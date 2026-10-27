import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag, Star } from "lucide-react";
import { useMemo } from "react";
import heroImg from "@/assets/hero.jpg";
import { Footer, Navbar } from "@/components/site/Navbar";
import { ProductCard } from "@/components/site/ProductCard";
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
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center md:py-36">
          <span className="inline-block rounded-full border border-primary/40 bg-accent/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-glow backdrop-blur">
            Premium Amethyst Store
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            UPGRADE YOUR <span className="text-gradient">MINECRAFT</span> EXPERIENCE
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-secondary-foreground md:text-lg">
            Rank & Server Setup Premium untuk Server Minecraft Indonesia - Desain Amethyst Eksklusif
          </p>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
            <Stat icon={<Package />} label="Total Produk" value={String(products?.length ?? 0)} />
            <Stat icon={<ShoppingBag />} label="Total Terjual" value={totalSold.toLocaleString("id-ID")} />
            <Stat icon={<Star />} label="Rating" value="5.0" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4">
        <div className="-mt-2 flex gap-2 overflow-x-auto pb-2 pt-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => navigate({ search: (prev) => ({ ...prev, cat: f === "Semua" ? undefined : f }) })}
              className={cn(
                "shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition",
                active === f
                  ? "border-transparent bg-gradient-primary text-primary-foreground shadow-button"
                  : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {q && (
          <p className="mt-4 text-sm text-muted-foreground">
            Hasil pencarian untuk "<span className="text-glow">{q}</span>" — {filtered.length} produk
          </p>
        )}

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-card" />)}
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        {error && <p className="mt-10 text-center text-muted-foreground">Gagal memuat produk. Coba refresh halaman.</p>}
        {!isLoading && !error && filtered.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">Produk tidak ditemukan.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur">
      <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-lg bg-accent text-primary-glow [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <div className="font-display text-xl font-bold md:text-2xl">{value}</div>
      <div className="text-[11px] text-muted-foreground md:text-xs">{label}</div>
    </div>
  );
}
