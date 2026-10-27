CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Rank',
  price int NOT NULL DEFAULT 0,
  short_desc text,
  features text[] NOT NULL DEFAULT '{}',
  main_image text,
  gallery text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  badge text NOT NULL DEFAULT 'None',
  wa_link text,
  is_featured boolean NOT NULL DEFAULT false,
  views int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update products" ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete products" ON public.products FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.increment_product_views(_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.products SET views = views + 1 WHERE id = _id;
$$;
GRANT EXECUTE ON FUNCTION public.increment_product_views(uuid) TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Auth upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Auth update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Auth delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

INSERT INTO public.products (name, category, price, short_desc, features, main_image, gallery, tags, badge, wa_link, is_featured, views) VALUES
('Rank Mythic Amethyst', 'Rank', 25000, 'Rank tertinggi dengan prefix amethyst animasi, kit eksklusif, dan akses command premium.', ARRAY['Prefix animasi amethyst','Kit Mythic setiap 24 jam','/fly, /heal, /nick','Akses warp eksklusif','Partikel kristal custom'], '/images/rank.jpg', ARRAY['/images/rank.jpg','/images/lobby.jpg','/images/spawn.jpg'], ARRAY['Java & Bedrock','LuckPerms'], 'BEST SELLER', 'https://wa.me/6281234567890?text=Halo%20saya%20mau%20beli%20Rank%20Mythic%20Amethyst', true, 128),
('Server Setup Survival Premium', 'Server Setup', 150000, 'Setup server survival lengkap siap pakai: plugin, ekonomi, rank, dan proteksi.', ARRAY['50+ plugin terkonfigurasi','Sistem ekonomi & shop','Anti-cheat & proteksi','Rank system LuckPerms','Support instalasi 7 hari'], '/images/setup.jpg', ARRAY['/images/setup.jpg','/images/spawn.jpg','/images/lobby.jpg'], ARRAY['Java & Bedrock','Paper 1.21'], 'NEW', 'https://wa.me/6281234567890?text=Halo%20saya%20mau%20beli%20Server%20Setup%20Survival', true, 87),
('Lobby Amethyst Crystal', 'Lobby', 75000, 'Lobby bertema gua geode amethyst dengan NPC selector dan parkour.', ARRAY['Build custom 300x300','NPC server selector','Parkour & hologram','Schematic siap paste'], '/images/lobby.jpg', ARRAY['/images/lobby.jpg','/images/spawn.jpg','/images/rank.jpg'], ARRAY['Schematic','1.20+'], 'DISCOUNT', 'https://wa.me/6281234567890?text=Halo%20saya%20mau%20beli%20Lobby%20Amethyst', false, 54),
('Spawn Kristal Floating Island', 'Spawn', 50000, 'Spawn pulau melayang dengan kristal amethyst raksasa dan detail premium.', ARRAY['Build detail tinggi','Area warp & shop','Lighting kristal','Schematic siap paste'], '/images/spawn.jpg', ARRAY['/images/spawn.jpg','/images/lobby.jpg','/images/setup.jpg'], ARRAY['Schematic','Java & Bedrock'], 'None', 'https://wa.me/6281234567890?text=Halo%20saya%20mau%20beli%20Spawn%20Kristal', false, 33);