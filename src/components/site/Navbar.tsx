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
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => setQ(search.q ?? ""), [search.q]);

  const submit = (value: string) =>
    navigate({ to: "/", search: { q: value || undefined, cat: search.cat }, replace: true });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-1 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary shadow-button">
            <Gem className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-bold">
            obs<span className="text-gradient">Verse</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Buka pencarian" title="Cari produk" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Search className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" asChild><Link to="/admin" aria-label="Admin" title="Admin"><Shield className="h-4 w-4" /></Link></Button>
          {whatsapp ? <Button variant="ghost" size="icon" asChild><a href={whatsapp} aria-label="WhatsApp" title="WhatsApp" target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /></a></Button> : <Button variant="ghost" size="icon" disabled aria-label="WhatsApp belum tersedia" title="WhatsApp belum tersedia"><MessageCircle className="h-4 w-4" /></Button>}
        </div>
        {searchOpen &&
        <form
          className="relative mt-2 w-full min-w-0"
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
        </form>}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border px-4 py-8 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 sm:px-2">
        <Gem className="h-4 w-4 text-primary-glow" />
        <span className="mr-auto font-display font-semibold text-foreground">obsVerse</span>
        <span>© 2026 · Minecraft Store</span>
      </div>
    </footer>
  );
}
