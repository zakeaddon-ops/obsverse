CREATE TABLE public.store_settings (
 id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
 whatsapp_url text NOT NULL DEFAULT '' CHECK (whatsapp_url = '' OR whatsapp_url ~ '^https://wa[.]me/[1-9][0-9]{6,14}$')
);
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads store contact" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins add store contact" ON public.store_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update store contact" ON public.store_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));