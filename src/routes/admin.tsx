import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Gem, LayoutDashboard, LogOut, Package, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  head: () => ({ meta: [{ title: "Admin — obsVerse" }, { name: "robots", content: "noindex" }] }),
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
  const item = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent";
  const activeCls = "bg-gradient-primary text-primary-foreground shadow-button hover:bg-transparent";

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-sidebar-border bg-sidebar p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <Link to="/" className="mb-6 hidden items-center gap-2 md:flex">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary"><Gem className="h-5 w-5 text-primary-foreground" /></span>
          <span className="font-display text-lg font-bold">obsVerse</span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }} className={item} activeProps={{ className: activeCls }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
          <button onClick={logout} className={cn(item, "md:mt-4")}>
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
