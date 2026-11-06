ALTER TABLE public.payment_orders ADD COLUMN provider_invoice_id text UNIQUE;
UPDATE public.payment_settings SET environment='live', enabled=false;
INSERT INTO public.payment_settings(id,enabled,environment) VALUES (1,false,'live') ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.payment_settings ALTER COLUMN environment SET DEFAULT 'live';