import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/site/BackButton";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) { toast.error("Password minimal 6 karakter"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: current } as never);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password diperbarui");
    setPw(""); setCurrent("");
  };

  return (
    <div className="max-w-lg space-y-6">
      <BackButton to="/admin" className="mb-0 -ml-3" />
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Akun</div>
        <div className="mt-1 font-semibold">{user.email}</div>
      </div>
      <form onSubmit={change} className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-bold">Ganti Password</h2>
        <div className="space-y-2"><Label>Password saat ini</Label><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Password baru</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
        <Button variant="hero" type="submit" className="rounded-xl" disabled={loading}>{loading && <Loader2 className="animate-spin" />} Simpan</Button>
      </form>
    </div>
  );
}
