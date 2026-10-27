import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah, type Product } from "@/lib/products";

export function ProductBadge({ badge }: { badge: string | null }) {
  if (!badge || badge === "None") return null;
  return (
    <span className="rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-bold tracking-wide text-primary-foreground shadow-button">
      {badge}
    </span>
  );
}

export function ProductCard({ p }: { p: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-glow">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {p.main_image && (
          <img
            src={p.main_image}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3">
          <ProductBadge badge={p.badge} />
        </div>
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          <Eye className="h-3 w-3" /> {p.views}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-primary-glow">{p.category}</span>
        <h3 className="text-lg font-bold leading-tight">{p.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{p.short_desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <span key={t} className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-secondary-foreground">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-xl font-bold text-glow">{formatRupiah(p.price)}</span>
          <Button variant="hero" size="sm" className="rounded-full" asChild>
            <Link to="/product/$id" params={{ id: p.id }}>Lihat Detail</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
