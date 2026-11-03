import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Gem, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/site/BackButton";

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
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        const message = error.code === "invalid_credentials" ? "Email atau password salah." : error.status === 429 ? "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi." : "Login belum berhasil. Periksa koneksi dan coba lagi.";
        setErrorMessage(message);
        return;
      }
      await router.invalidate();
      await navigate({ to: "/admin", replace: true });
    } catch {
      setErrorMessage("Tidak dapat terhubung. Periksa koneksi dan coba lagi.");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-8 shadow-glow">
        <BackButton to="/" className="mb-0 -ml-3" />
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-button">
            <Gem className="h-6 w-6 text-primary-foreground" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">obsVerse Admin & Owner</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Password</Label>
          <div className="relative"><Input id="pw" type={showPassword ? "text" : "password"} autoComplete="current-password" required className="pr-12" value={password} onChange={(e) => setPassword(e.target.value)} /><Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} title={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-0 top-0" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff /> : <Eye />}</Button></div>
        </div>
        {errorMessage && <p role="alert" className="text-sm text-primary-glow">{errorMessage}</p>}
        <Button variant="hero" type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />} Login
        </Button>
      </form>
    </div>
  );
}
