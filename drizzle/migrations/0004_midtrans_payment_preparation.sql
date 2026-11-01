CREATE TABLE public.payment_settings (id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1), enabled boolean NOT NULL DEFAULT false, environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','live')));
GRANT SELECT ON public.payment_settings TO anon, authenticated;
GRANT UPDATE, INSERT ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public payment settings" ON public.payment_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin payment settings insert" ON public.payment_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin payment settings update" ON public.payment_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TABLE public.payment_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), access_hash text NOT NULL UNIQUE, requester_hash text NOT NULL,
 product_id uuid NOT NULL, product_name text NOT NULL, amount bigint NOT NULL CHECK (amount > 0),
 buyer_name text NOT NULL, buyer_whatsapp text NOT NULL, minecraft_name text NOT NULL DEFAULT '',
 environment text NOT NULL CHECK (environment IN ('sandbox','live')),
 status text NOT NULL DEFAULT 'creating' CHECK (status IN ('creating','pending','paid','failed','cancelled','expired','refunded')),
 checkout_url text, payment_method text, fulfilled boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_orders TO service_role;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads orders" ON public.payment_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX payment_orders_created_idx ON public.payment_orders (created_at DESC);
CREATE INDEX payment_orders_requester_idx ON public.payment_orders (requester_hash, created_at);
CREATE FUNCTION public.reserve_payment_order(_access_hash text, _requester_hash text, _product_id uuid, _buyer_name text, _buyer_whatsapp text, _minecraft_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE existing_id uuid; new_id uuid; product_row public.products%ROWTYPE; config public.payment_settings%ROWTYPE;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(_requester_hash, 0));
 SELECT id INTO existing_id FROM public.payment_orders WHERE access_hash = _access_hash;
 IF existing_id IS NOT NULL THEN RETURN existing_id; END IF;
 IF (SELECT count(*) FROM public.payment_orders WHERE requester_hash = _requester_hash AND created_at > now() - interval '10 minutes') >= 5 THEN RAISE EXCEPTION 'Too many orders'; END IF;
 SELECT * INTO config FROM public.payment_settings WHERE id = 1;
 IF config.enabled IS DISTINCT FROM true THEN RAISE EXCEPTION 'Payments disabled'; END IF;
 SELECT * INTO product_row FROM public.products WHERE id = _product_id;
 IF product_row.id IS NULL OR product_row.price <= 0 OR product_row.price <> trunc(product_row.price) THEN RAISE EXCEPTION 'Invalid product price'; END IF;
 INSERT INTO public.payment_orders(access_hash,requester_hash,product_id,product_name,amount,buyer_name,buyer_whatsapp,minecraft_name,environment)
 VALUES (_access_hash,_requester_hash,product_row.id,product_row.name,product_row.price,_buyer_name,_buyer_whatsapp,_minecraft_name,config.environment) RETURNING id INTO new_id;
 RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.reserve_payment_order(text,text,uuid,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_payment_order(text,text,uuid,text,text,text) TO service_role;