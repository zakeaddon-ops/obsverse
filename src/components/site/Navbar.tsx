import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Gem, MessageCircle, Search, Shield, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { storeSettingsQuery } from "@/lib/store-settings";
import { safeWhatsApp } from "@/lib/whatsapp";

export function Navbar() {
  const navigate = useNavigate();
  const { data: settings } = useQuery(storeSettingsQuery);
  const whatsapp = safeWhatsApp(settings?.whatsapp_url);
  const search = useRouterState({
    select: (s) => s.location.search as { q?: string; cat?: string },
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const [q, setQ] = useState(search.q ?? "");
  useEffect(() => setQ(search.q ?? ""), [search.q]);

  const submit = (value: string) =>
    navigate({ to: "/", search: { q: value || undefined, cat: search.cat }, replace: true });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-button">
            <Gem className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-bold">
            obs<span className="text-gradient">Verse</span>
          </span>
        </Link>
        <form
          className="relative col-span-3 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (timer.current) clearTimeout(timer.current);
            submit(q.trim());
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (timer.current) clearTimeout(timer.current);
              const value = e.target.value;
              timer.current = setTimeout(() => submit(value), 220);
            }}
            aria-label="Cari produk"
            type="search"
            placeholder="Cari Rank, Setup, Lobby..."
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {q && <Button type="button" variant="ghost" size="icon" aria-label="Hapus pencarian" className="absolute right-1 top-0.5 h-9 w-9" onClick={() => { if (timer.current) clearTimeout(timer.current); setQ(""); submit(""); }}><X /></Button>}
        </form>
        <Button variant="outline" className="shrink-0 rounded-lg" asChild>
          <Link to="/admin" aria-label="Admin" title="Admin">
            <Shield />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </Button>
        {whatsapp ? <Button variant="hero" className="shrink-0 rounded-lg" asChild>
          <a href={whatsapp} aria-label="WhatsApp" title="WhatsApp" target="_blank" rel="noreferrer">
            <MessageCircle />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </Button> : <Button variant="hero" className="shrink-0 rounded-lg" disabled aria-label="WhatsApp belum tersedia" title="WhatsApp belum tersedia"><MessageCircle /><span className="hidden sm:inline">WhatsApp</span></Button>}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border px-4 py-8 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Gem className="h-4 w-4 text-primary-glow" />
        <span className="mr-auto font-display font-semibold text-foreground">obsVerse</span>
        <span>© 2026 · Minecraft Store</span>
      </div>
    </footer>
  );
}
