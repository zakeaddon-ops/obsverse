# Obsverse

Build a premium full-stack website named "obsVerse" - Rank & Server Setup Store for Minecraft.



### 1. CORE DESIGN - CLONE ZAKEMOD-HUB.VERCEL.APP

- UI Reference: https://zakemod-hub.vercel.app - Clone the layout exactly.

- Layout: Dark mode only. Background #0a0a0a, Card BG #1a1625, Border #2a2440.

- THEME COLOR: Change RED accent to AMETHYST PURPLE. Primary: #a78bfa, #8b5cf6, #7c3aed. Secondary glow: #e9d5ff. All buttons, badges, hovers must be purple.

- Navbar: Left logo "obsVerse" with amethyst crystal icon (lucide gem), Center search bar "Cari Rank, Setup, Lobby...", Right Discord button with purple gradient.

- Category filters as pill buttons like zakemod: [ Semua ] [ Rank ] [ Server Setup ] [ Lobby ] [ Spawn ] [ Best Seller ] - active state is purple filled.

- Product grid: 3 columns on desktop, rounded-2xl cards, dark card, image on top 16:9, purple glow on hover, lift effect.

- Font: Modern sans, bold title, clean.



### 2. FRONTEND PAGES



**A. HERO SECTION:**

Background image: Minecraft Amethyst Geode cave glowing, dark overlay.

Title: UPGRADE YOUR MINECRAFT EXPERIENCE

Subtitle: Rank & Server Setup Premium untuk Server Minecraft Indonesia - Desain Amethyst Eksklusif

Stats row (like zakemod): Total Produk, Total Terjual, Rating 5.0 - with purple icons.



**B. PRODUCT GRID (from DATABASE, not dummy):**

Fetch from Supabase table `products`.

Each card shows:

- Main image

- Badge (BEST SELLER / NEW / DISCOUNT) in purple

- Name (e.g. Rank Mythic Amethyst)

- Short description

- Tags (e.g. Java & Bedrock)

- Price Rp 25.000

- Button "Lihat Detail" (purple)

Search and Category filter must work live from database.



**C. PRODUCT DETAIL PAGE (/product/[id]):**

- Image gallery slider (main + 3 images)

- Title, price, badge, views

- Features list with purple checkmarks (features is array from DB)

- Buttons: "Beli via WhatsApp" (link from wa_link field), "Preview Server"

- Description long

- Back button



**D. FOOTER:** obsVerse © 2026 - Premium Amethyst Minecraft Solutions



### 3. ADMIN PANEL - FULL CRUD (MUST BE EDITABLE)



**DATABASE - Use Lovable Supabase Integration:**

Create table `products`:

- id: uuid primary key default gen_random_uuid()

- name: text not null

- category: text (Rank, Server Setup, Lobby, Spawn, Best Seller)

- price: int

- short_desc: text

- features: text[] (array of strings)

- main_image: text (url)

- gallery: text[] (array of urls)

- tags: text[]

- badge: text (None, BEST SELLER, NEW, DISCOUNT)

- wa_link: text

- is_featured: boolean default false

- views: int default 0

- created_at: timestamp default now()



Also create Storage bucket `product-images` public.



**ADMIN AUTH:**

- Page /admin/login : Dark amethyst card, email + password fields, purple login button.

- Use Supabase Auth.

- Create default admin account: admin@obsverse.id / obsverse123

- Middleware: If user not logged in and accessing /admin/*, redirect to /admin/login

- RLS: Enable RLS on products table. Public can SELECT. Only authenticated can INSERT/UPDATE/DELETE. Storage bucket public read, authenticated write.



**ADMIN DASHBOARD (/admin):**

- Layout: Sidebar (Dashboard, Products, Settings, Logout) dark with purple active state.

- Stats: Total Products count, Categories count, Total Views sum.

- Table: List all products with thumbnail, name, category, price, badge, actions [Edit] [Delete]

- Top bar: Search products + Button "+ Tambah Produk Baru" (purple)

- Delete needs confirmation.



**ADD/EDIT FORM (/admin/products/new and /admin/products/[id]/edit):**

Form fields:

- Product Name (input)

- Category (select: Rank, Server Setup, Lobby, Spawn, Best Seller)

- Price (number input Rp)

- Short Description (textarea)

- Full Features (textarea, instruction: "1 fitur per baris")

- Tags (input comma separated)

- Badge (select: None, BEST SELLER, NEW, DISCOUNT)

- WhatsApp Link (input)

- Is Featured (switch)

- Main Image Upload (upload to Supabase Storage `product-images`, get URL and save to main_image)

- Gallery Images Upload (up to 3, save to gallery array)

- Save Button (purple gradient) -> insert/update to Supabase, then redirect to /admin



**FRONTEND CONNECTION:**

- Homepage and detail page must read from Supabase products table in real-time.

- When admin adds/edits/deletes, frontend auto updates.

- Implement view increment when detail page opened.



**TECH STACK:**

- Next.js 14 App Router + Tailwind CSS + Supabase (Lovable integration)

- Lucide-react icons

- No red color anywhere, only amethyst purple theme.

- Fully responsive, premium, fast.



Build it fully functional, no placeholder, production-ready.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://obsverse.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/726f6481-4039-4ad6-8966-fc2fc1a97541).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
