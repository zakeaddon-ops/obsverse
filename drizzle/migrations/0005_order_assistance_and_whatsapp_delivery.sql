ALTER TABLE public.payment_orders ADD COLUMN whatsapp_notifications boolean NOT NULL DEFAULT false;
CREATE TABLE public.order_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.payment_orders(id), status text NOT NULL CHECK(status IN ('paid','expired')),
 state text NOT NULL DEFAULT 'queued' CHECK(state IN ('queued','sending','accepted','sent','delivered','read','failed','uncertain','blocked')),
 provider_id text UNIQUE, error text, next_attempt_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz, delivered_at timestamptz, read_at timestamptz, failed_at timestamptz,
 UNIQUE(order_id,status)
);
GRANT SELECT ON public.order_notifications TO authenticated;
GRANT ALL ON public.order_notifications TO service_role;
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads notification delivery" ON public.order_notifications FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.whatsapp_webhook_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id text NOT NULL UNIQUE, event text NOT NULL, payload jsonb NOT NULL, received_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz, processing_error text, next_attempt_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.whatsapp_webhook_events TO service_role;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.whatsapp_delivery_statuses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id text NOT NULL, provider_id text NOT NULL, status text NOT NULL, provider_at timestamptz NOT NULL, errors jsonb, UNIQUE(delivery_id,provider_id,status)
);
GRANT ALL ON public.whatsapp_delivery_statuses TO service_role;
ALTER TABLE public.whatsapp_delivery_statuses ENABLE ROW LEVEL SECURITY;
CREATE INDEX whatsapp_delivery_provider_idx ON public.whatsapp_delivery_statuses(provider_id);
CREATE TABLE public.order_service_state (id text PRIMARY KEY, paused boolean NOT NULL DEFAULT false, message text, http_status integer, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.order_service_state TO service_role;
ALTER TABLE public.order_service_state ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.queue_order_notification() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('paid','expired') AND NEW.whatsapp_notifications AND NEW.environment='live' THEN
 INSERT INTO public.order_notifications(order_id,status) VALUES(NEW.id,NEW.status) ON CONFLICT(order_id,status) DO NOTHING;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.queue_order_notification() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER payment_notification_queue AFTER UPDATE OF status ON public.payment_orders FOR EACH ROW EXECUTE FUNCTION public.queue_order_notification();
CREATE FUNCTION public.reconcile_whatsapp_delivery(_provider_id text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE callback record; item public.order_notifications%ROWTYPE; current_rank integer; next_rank integer;
BEGIN
 SELECT * INTO item FROM public.order_notifications WHERE provider_id=_provider_id FOR UPDATE;
 IF item.id IS NULL THEN RETURN; END IF;
 FOR callback IN SELECT * FROM public.whatsapp_delivery_statuses WHERE provider_id=_provider_id ORDER BY provider_at LOOP
 current_rank:=CASE item.state WHEN 'read' THEN 4 WHEN 'delivered' THEN 3 WHEN 'sent' THEN 2 ELSE 1 END;
 next_rank:=CASE callback.status WHEN 'read' THEN 4 WHEN 'delivered' THEN 3 WHEN 'sent' THEN 2 ELSE 1 END;
 IF next_rank>current_rank OR (callback.status='failed' AND current_rank<3) THEN item.state:=callback.status; END IF;
 IF callback.status='sent' THEN item.sent_at:=COALESCE(item.sent_at,callback.provider_at); END IF;
 IF callback.status='delivered' THEN item.delivered_at:=COALESCE(item.delivered_at,callback.provider_at); END IF;
 IF callback.status='read' THEN item.read_at:=COALESCE(item.read_at,callback.provider_at); END IF;
 IF callback.status='failed' THEN item.failed_at:=COALESCE(item.failed_at,callback.provider_at); item.error:=callback.errors::text; END IF;
 END LOOP;
 UPDATE public.order_notifications SET state=item.state,sent_at=item.sent_at,delivered_at=item.delivered_at,read_at=item.read_at,failed_at=item.failed_at,error=item.error,updated_at=now() WHERE id=item.id;
END $$;
REVOKE ALL ON FUNCTION public.reconcile_whatsapp_delivery(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_whatsapp_delivery(text) TO service_role;
CREATE FUNCTION public.process_whatsapp_event(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE item public.whatsapp_webhook_events%ROWTYPE; callback jsonb; change jsonb;
BEGIN
 SELECT * INTO item FROM public.whatsapp_webhook_events WHERE id=_id FOR UPDATE;
 IF item.id IS NULL OR item.processed_at IS NOT NULL THEN RETURN; END IF;
 FOR change IN SELECT value FROM jsonb_array_elements(COALESCE(item.payload->'entry','[]'::jsonb)) LOOP
 FOR callback IN SELECT s.value FROM jsonb_array_elements(COALESCE(change->'changes','[]'::jsonb)) c CROSS JOIN LATERAL jsonb_array_elements(COALESCE(c.value->'value'->'statuses','[]'::jsonb)) s LOOP
 IF callback->>'id' IS NOT NULL AND callback->>'status' IN ('sent','delivered','read','failed') AND callback->>'timestamp' ~ '^\d+$' THEN
 INSERT INTO public.whatsapp_delivery_statuses(delivery_id,provider_id,status,provider_at,errors) VALUES(item.delivery_id,callback->>'id',callback->>'status',to_timestamp((callback->>'timestamp')::bigint),callback->'errors') ON CONFLICT DO NOTHING;
 PERFORM public.reconcile_whatsapp_delivery(callback->>'id');
 END IF;
 END LOOP;
 END LOOP;
 IF item.event='whatsapp.account_update' AND item.payload::text ~ 'PARTNER_REMOVED|PARTNER_APP_UNINSTALLED|DISABLED_UPDATE|ACCOUNT_OFFBOARDED' THEN
 INSERT INTO public.order_service_state(id,paused,message,http_status) VALUES('whatsapp',true,'WhatsApp perlu disambungkan kembali.',403) ON CONFLICT(id) DO UPDATE SET paused=true,message=EXCLUDED.message,updated_at=now();
 END IF;
 UPDATE public.whatsapp_webhook_events SET processed_at=now(),processing_error=NULL WHERE id=_id;
END $$;
REVOKE ALL ON FUNCTION public.process_whatsapp_event(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.process_whatsapp_event(uuid) TO service_role;
CREATE INDEX whatsapp_pending_idx ON public.whatsapp_webhook_events(next_attempt_at) WHERE processed_at IS NULL;