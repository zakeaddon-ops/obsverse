ALTER TABLE public.products ADD COLUMN sold int NOT NULL DEFAULT 0;
UPDATE public.products SET sold = 42 WHERE name = 'Rank Mythic Amethyst';
UPDATE public.products SET sold = 18 WHERE name = 'Server Setup Survival Premium';
UPDATE public.products SET sold = 11 WHERE name = 'Lobby Amethyst Crystal';
UPDATE public.products SET sold = 7 WHERE name = 'Spawn Kristal Floating Island';