CREATE TABLE public.store_owners (
 user_id uuid PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_owners TO authenticated;
GRANT ALL ON public.store_owners TO service_role;
ALTER TABLE public.store_owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own membership" ON public.store_owners FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.is_store_owner() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.store_owners WHERE user_id = auth.uid()) $$;
REVOKE ALL ON FUNCTION public.is_store_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_store_owner() TO authenticated, service_role;
CREATE TABLE public.payment_credentials (
 environment text PRIMARY KEY CHECK (environment IN ('sandbox','live')),
 encrypted_key text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_credentials TO service_role;
ALTER TABLE public.payment_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY "Admin payment settings insert" ON public.payment_settings;
DROP POLICY "Admin payment settings update" ON public.payment_settings;
CREATE POLICY "Owner payment settings insert" ON public.payment_settings FOR INSERT TO authenticated WITH CHECK (public.is_store_owner());
CREATE POLICY "Owner payment settings update" ON public.payment_settings FOR UPDATE TO authenticated USING (public.is_store_owner()) WITH CHECK (public.is_store_owner());