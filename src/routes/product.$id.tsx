import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Eye, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/site/BackButton";
import { PaymentCheckout } from "@/components/site/PaymentCheckout";
import { Footer, Navbar } from "@/components/site/Navbar";
import { storeSettingsQuery } from "@/lib/store-settings";
import { safeWhatsApp } from "@/lib/whatsapp";

import { ProductBadge } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah, productQuery, useProductsRealtime } from "@/lib/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Detail Produk — obsVerse" },
      { name: "description", content: "Detail rank & server setup Minecraft premium bertema amethyst dari obsVerse." },
      { property: "og:title", content: "Detail Produk — obsVerse" },
      { property: "og:description", content: "Rank & server setup Minecraft premium bertema amethyst." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  useProductsRealtime();
  const { data: p, isLoading, error, refetch } = useQuery(productQuery(id));
  const { data: settings } = useQuery(storeSettingsQuery);
  const whatsapp = safeWhatsApp(p?.wa_link) || safeWhatsApp(settings?.whatsapp_url);
  const [idx, setIdx] = useState(0);
  const counted = useRef<string | null>(null);

  useEffect(() => {
    if (counted.current === id) return;
    counted.current = id;
    supabase.rpc("increment_product_views", { _id: id });
  }, [id]);

  const images = p ? Array.from(new Set([p.main_image, ...p.gallery].filter(Boolean) as string[])) : [];
  const go = (d: number) => setIdx((i) => (i + d + images.length) % images.length);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <BackButton />


        {isLoading && <Skeleton className="aspect-video w-full rounded-2xl bg-card" />}
        {error && <div className="py-16 text-center"><p className="text-muted-foreground">Produk belum dapat dimuat.</p><Button variant="outline" className="mt-4" onClick={() => refetch()}>Coba lagi</Button></div>}
        {!isLoading && !error && !p && (
          <div className="py-24 text-center text-muted-foreground">Produk tidak ditemukan.</div>
        )}
        {p && (
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-card">
                {images[idx] && <img src={images[idx]} alt={p.name} className="h-full w-full object-cover" />}
                {images.length > 1 && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => go(-1)} aria-label="Sebelumnya" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/70 backdrop-blur hover:bg-primary">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => go(1)} aria-label="Berikutnya" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/70 backdrop-blur hover:bg-primary">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {images.map((src, i) => (
                    <Button variant="ghost" aria-label={`Gambar ${i + 1}`} aria-pressed={i === idx} key={src} onClick={() => setIdx(i)} className={cn("h-auto aspect-video overflow-hidden rounded-lg border-2 p-0 transition", i === idx ? "border-primary shadow-glow" : "border-border opacity-60 hover:opacity-100")}>
                      <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </Button>
                  ))}
                </div>
              )}
              <section className="mt-8 border-t border-border pt-6">
                <h2 className="text-lg font-bold">Deskripsi</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{p.short_desc}</p>
              </section>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <ProductBadge badge={p.badge} />
                <span className="text-xs font-medium uppercase tracking-wider text-primary-glow">{p.category}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3.5 w-3.5" /> {p.views} views</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">{p.name}</h1>
              <div className="font-display text-3xl font-bold text-gradient">{formatRupiah(p.price)}</div>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs">{t}</span>
                ))}
              </div>
              <div className="border-y border-border py-6">
                <h2 className="mb-4 font-bold">Fitur</h2>
                <ul className="space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3">
                <PaymentCheckout product={p} />
                {whatsapp ? <Button variant="hero" size="lg" className="h-12 rounded-xl" asChild>
                  <a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle /> Beli via WhatsApp</a>
                </Button> : <Button variant="hero" size="lg" className="h-12 rounded-xl" disabled><MessageCircle /> WhatsApp belum tersedia</Button>}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
