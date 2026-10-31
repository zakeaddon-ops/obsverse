import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Gem, LayoutDashboard, LogOut, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  head: () => ({ meta: [
    { title: "Admin — obsVerse" },
    { name: "description", content: "Kelola toko dan katalog Minecraft obsVerse." },
    { property: "og:title", content: "Admin — obsVerse" },
    { property: "og:description", content: "Panel pengelola toko Minecraft obsVerse." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const logout = async () => {
    await qc.cancelQueries();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };
  const item = "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2.5 text-[11px] md:flex-row md:justify-start md:gap-3 md:px-3 md:text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent";
  const activeCls = "bg-gradient-primary text-primary-foreground shadow-button hover:bg-transparent";

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-sidebar-border bg-sidebar p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <Link to="/" className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary"><Gem className="h-5 w-5 text-primary-foreground" /></span>
          <span className="font-display text-lg font-bold">obsVerse</span>
        </Link>
        <nav className="grid grid-cols-4 gap-1 md:flex md:flex-col">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }} className={item} activeProps={{ className: activeCls }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
          <Button variant="ghost" onClick={logout} className={cn(item, "h-auto md:mt-4")}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
