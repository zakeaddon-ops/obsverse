import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Package, SearchX, ShoppingBag, Gem, Search, Server, Wrench } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { Footer, Navbar } from "@/components/site/Navbar";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productsQuery, useProductsRealtime } from "@/lib/products";
import { cn } from "@/lib/utils";

const FILTERS = ["Semua", "Rank", "Server Setup", "Lobby", "Best Seller"] as const;

type Search = { q?: string | undefined; cat?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    cat: typeof s["cat"] === "string" && s["cat"] ? s["cat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "obsVerse — Rank & Server Setup Store Minecraft" },
      { name: "description", content: "Rank & Server Setup Premium untuk Server Minecraft Indonesia dengan desain Amethyst eksklusif." },
      { property: "og:title", content: "obsVerse — Rank & Server Setup Store Minecraft" },
      { property: "og:description", content: "Rank, Server Setup & Lobby premium bertema amethyst." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useProductsRealtime();
  const { q, cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const { data: products, isLoading, error } = useQuery(productsQuery);
  const active = cat ?? "Semua";
  const [term, setTerm] = useState(q ?? "");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => setTerm(q ?? ""), [q]);
  useEffect(() => () => { if (searchTimer.current) clearTimeout(searchTimer.current); }, []);
  const searchProducts = (value: string) => navigate({ search: (prev) => ({ ...prev, q: value.trim() || undefined }), replace: true });

  const filtered = useMemo(() => {
    const term = (q ?? "").toLowerCase().trim();
    return (products ?? []).filter((p) => {
      const matchCat =
        active === "Semua" ||
        p.category === active ||
        (active === "Best Seller" && p.badge === "BEST SELLER");
      const matchQ =
        !term ||
        [p.name, p.short_desc ?? "", p.category, ...p.tags].join(" ").toLowerCase().includes(term);
      return matchCat && matchQ;
    });
  }, [products, q, active]);

  const totalSold = (products ?? []).reduce((a, p) => a + (p.sold ?? 0), 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
        <div className="relative isolate overflow-hidden">
          <img src={heroImg} alt="Gua geode amethyst Minecraft" width={1920} height={1088} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
          <div className="absolute inset-0 -z-10 bg-store-cover" />
          <div className="px-5 py-8 sm:px-8 sm:py-10">
            <p className="text-sm font-semibold text-secondary-foreground sm:text-lg">Selamat Datang di</p>
            <h1 className="mt-1 text-4xl font-bold leading-tight text-primary-glow sm:text-5xl">obsVerse</h1>
            <h2 className="mt-4 max-w-sm text-sm font-semibold leading-relaxed sm:text-base">UPGRADE YOUR MINECRAFT EXPERIENCE</h2>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-secondary-foreground sm:text-sm">Rank, server setup & lobby premium untuk petualangan Minecraft-mu.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 divide-x divide-border border-y border-border bg-card/60 py-4">
          <Stat icon={<Package />} label="Total Produk" value={String(products?.length ?? 0)} />
          <Stat icon={<ShoppingBag />} label="Total Terjual" value={totalSold.toLocaleString("id-ID")} />
        </div>
      </section>

      <main id="katalog" className="mx-auto max-w-3xl scroll-mt-24 px-4 sm:px-6">
        <form id="pencarian" className="mt-4 flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 focus-within:border-primary/60" onSubmit={(event) => { event.preventDefault(); if (searchTimer.current) clearTimeout(searchTimer.current); searchProducts(term); }}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent text-primary-glow"><Search className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><label htmlFor="catalog-search" className="text-sm font-bold">Cari Produk</label><input id="catalog-search" type="search" aria-label="Cari produk di katalog" placeholder="Cari Rank, Setup, Lobby..." value={term} onChange={(event) => { const value = event.target.value; setTerm(value); if (searchTimer.current) clearTimeout(searchTimer.current); searchTimer.current = setTimeout(() => searchProducts(value), 220); }} className="mt-1 block w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground" /></div>
          <Button type="submit" variant="ghost" size="icon" aria-label="Cari" title="Cari" className="shrink-0 text-primary-glow"><ArrowRight className="h-4 w-4" /></Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2 border-y border-border py-3">
          <Button variant="secondary" size="sm" className="rounded-md text-xs" onClick={() => navigate({ search: { cat: "Rank" } })}><Server className="h-3.5 w-3.5" /> Rank Minecraft <ArrowRight className="h-3.5 w-3.5" /></Button>
          <Button variant="secondary" size="sm" className="rounded-md text-xs" onClick={() => navigate({ search: { cat: "Server Setup" } })}><Wrench className="h-3.5 w-3.5" /> Jasa Setup Server <ArrowRight className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Button
              variant="ghost"
              aria-pressed={active === f}
              key={f}
              onClick={() => navigate({ search: (prev) => ({ ...prev, cat: f === "Semua" ? undefined : f }) })}
              className={cn(
                "h-8 shrink-0 rounded-md border px-3 text-xs font-semibold transition",
                active === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground",
              )}
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold"><Gem className="h-5 w-5 shrink-0 text-primary-glow" />{active === "Semua" ? "Semua Koleksi" : active}</h2>
          <span className="shrink-0 text-xs text-muted-foreground">{filtered.length} produk</span>
        </div>

        {q && (
          <p className="mt-4 text-sm text-muted-foreground">
            Hasil pencarian untuk "<span className="text-glow">{q}</span>" — {filtered.length} produk
          </p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-card" />)}
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        {error && <div className="py-16 text-center"><p className="text-muted-foreground">Produk belum dapat dimuat.</p><Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Coba lagi</Button></div>}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex min-h-52 flex-col items-center justify-center border-y border-border bg-card/60 px-4 py-10 text-center">
            <span className="mb-4 text-primary-glow">{q || cat ? <SearchX className="h-8 w-8" /> : <Package className="h-8 w-8" />}</span>
            <h3 className="text-sm font-semibold">{q || cat ? "Produk tidak ditemukan" : "Belum ada produk tersedia"}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{q || cat ? "Coba kata kunci atau kategori lainnya." : "Belum ada produk yang tersedia saat ini."}</p>
            {(q || cat) && <Button variant="soft" className="mt-5" onClick={() => navigate({ search: { q: undefined, cat: undefined } })}>Lihat semua produk</Button>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-center gap-3 px-2">
      <div className="grid h-7 w-7 shrink-0 place-items-center text-primary-glow [&_svg]:h-6 [&_svg]:w-6">
        {icon}
      </div>
      <div><div className="font-display text-xl font-bold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div></div>
    </div>
  );
}
