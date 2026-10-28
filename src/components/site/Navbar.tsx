import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Gem, MessageCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const DISCORD_URL = "https://discord.gg/obsverse";

export function Navbar() {
  const navigate = useNavigate();
  const search = useRouterState({
    select: (s) => s.location.search as { q?: string; cat?: string },
  });
  const [q, setQ] = useState(search.q ?? "");
  useEffect(() => setQ(search.q ?? ""), [search.q]);

  const submit = (value: string) =>
    navigate({ to: "/", search: { q: value || undefined, cat: search.cat }, replace: true });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-button">
            <Gem className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="hidden font-display text-xl font-bold tracking-tight sm:inline">
            obs<span className="text-gradient">Verse</span>
          </span>
        </Link>
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            submit(q);
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              submit(e.target.value);
            }}
            placeholder="Cari Rank, Setup, Lobby..."
            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </form>
        <Button variant="outline" className="shrink-0 rounded-full" asChild>
          <Link to="/admin">
            <Shield />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </Button>
        <Button variant="hero" className="shrink-0 rounded-full" asChild>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">
            <MessageCircle />
            <span className="hidden sm:inline">Discord</span>
          </a>
        </Button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border py-8 text-center text-sm text-muted-foreground">
      <div className="flex items-center justify-center gap-2">
        <Gem className="h-4 w-4 text-primary-glow" />
        obsVerse © 2026 - Premium Amethyst Minecraft Solutions
      </div>
    </footer>
  );
}
