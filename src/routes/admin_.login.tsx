import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Gem, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — obsVerse" },
      { name: "description", content: "Masuk ke panel admin obsVerse." },
      { property: "og:title", content: "Admin Login — obsVerse" },
      { property: "og:description", content: "Panel admin obsVerse." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error("Email atau password salah"); return; }
    navigate({ to: "/admin" });
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-8 shadow-glow">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-button">
            <Gem className="h-6 w-6 text-primary-foreground" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">obsVerse Admin</h1>
          <p className="text-sm text-muted-foreground">Masuk untuk mengelola produk</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button variant="hero" type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />} Login
        </Button>
      </form>
    </div>
  );
}
