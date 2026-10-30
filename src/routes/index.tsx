import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, Package, SearchX, ShoppingBag, Star, Gem } from "lucide-react";
import { useMemo } from "react";
import heroImg from "@/assets/hero.jpg";
import { Footer, Navbar } from "@/components/site/Navbar";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productsQuery, useProductsRealtime } from "@/lib/products";
import { cn } from "@/lib/utils";

const FILTERS = ["Semua", "Rank", "Server Setup", "Lobby", "Spawn", "Best Seller"] as const;

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
      { property: "og:description", content: "Rank, Server Setup, Lobby & Spawn premium bertema amethyst." },
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
      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Gua geode amethyst Minecraft" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 pb-5 pt-6 text-center sm:pb-12 sm:pt-16">
          <span className="inline-block rounded-full border border-primary/40 bg-accent/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-glow backdrop-blur">
            Premium Amethyst Store
          </span>
          <h1 className="mt-3 font-display text-5xl sm:mt-5 font-bold leading-tight sm:text-7xl">obs<span className="text-gradient">Verse</span></h1>
          <h2 className="mx-auto mt-2 max-w-3xl text-xl sm:mt-4 font-bold leading-tight sm:text-4xl">UPGRADE YOUR <span className="text-gradient">MINECRAFT</span> EXPERIENCE</h2>
          <p className="mx-auto mt-3 max-w-2xl sm:mt-5 text-sm leading-relaxed text-secondary-foreground sm:text-base">
            Rank & Server Setup Premium untuk Server Minecraft Indonesia - Desain Amethyst Eksklusif
          </p>
          <Button variant="hero" size="lg" className="mt-4 rounded-lg sm:mt-7" asChild><a href="#katalog">Jelajahi Produk <ArrowDown /></a></Button>
          <div className="mx-auto mt-5 grid max-w-xl sm:mt-9 grid-cols-3 divide-x divide-border border-t border-border/60 pt-3 sm:pt-6">
            <Stat icon={<Package />} label="Total Produk" value={String(products?.length ?? 0)} />
            <Stat icon={<ShoppingBag />} label="Total Terjual" value={totalSold.toLocaleString("id-ID")} />
            <Stat icon={<Star />} label="Rating" value="5.0" />
          </div>
        </div>
      </section>

      <main id="katalog" className="mx-auto max-w-7xl scroll-mt-36 px-4 pt-9 sm:scroll-mt-24">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase text-primary-glow">Koleksi obsVerse</p><h2 className="mt-1 text-2xl font-bold sm:text-3xl">Temukan upgrade-mu.</h2></div>
          <span className="text-xs text-muted-foreground">{products?.length ?? 0} produk</span>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((f) => (
            <Button
              variant="ghost"
              aria-pressed={active === f}
              key={f}
              onClick={() => navigate({ search: (prev) => ({ ...prev, cat: f === "Semua" ? undefined : f }) })}
              className={cn(
                "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition",
                active === f
                  ? "border-transparent bg-gradient-primary text-primary-foreground shadow-button"
                  : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground",
              )}
            >
              {f}
            </Button>
          ))}
        </div>

        {q && (
          <p className="mt-4 text-sm text-muted-foreground">
            Hasil pencarian untuk "<span className="text-glow">{q}</span>" — {filtered.length} produk
          </p>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-card" />)}
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        {error && <div className="py-16 text-center"><p className="text-muted-foreground">Produk belum dapat dimuat.</p><Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Coba lagi</Button></div>}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex min-h-60 flex-col items-center justify-center border-y border-border py-12 text-center">
            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary-glow">{q || cat ? <SearchX className="h-6 w-6" /> : <Gem className="h-6 w-6" />}</span>
            <h3 className="text-lg font-semibold">{q || cat ? "Produk tidak ditemukan" : "Koleksi baru segera hadir"}</h3>
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
    <div className="px-2 text-center">
      <div className="mx-auto mb-2 hidden h-7 sm:grid w-7 place-items-center text-primary-glow [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <div className="font-display text-xl font-bold md:text-2xl">{value}</div>
      <div className="text-[11px] text-muted-foreground md:text-xs">{label}</div>
    </div>
  );
}
