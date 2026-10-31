import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/site/BackButton";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { storeSettingsQuery } from "@/lib/store-settings";
import { normalizeWhatsApp } from "@/lib/whatsapp";

export const Route = createFileRoute("/admin/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(storeSettingsQuery),
  head: () => ({ meta: [
    { title: "Pengaturan Akun — obsVerse" },
    { name: "description", content: "Pengaturan akun pengelola obsVerse." },
    { property: "og:title", content: "Pengaturan Akun — obsVerse" },
    { property: "og:description", content: "Pengaturan akun pengelola obsVerse." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: settings } = useSuspenseQuery(storeSettingsQuery);
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp_url ?? "");
  const [savingContact, setSavingContact] = useState(false);
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const whatsapp_url = normalizeWhatsApp(whatsapp);
      const { error } = await supabase.from("store_settings").upsert({ id: 1, whatsapp_url });
      if (error) throw error;
      setWhatsapp(whatsapp_url);
      await qc.invalidateQueries({ queryKey: ["store-settings"] });
      toast.success("WhatsApp toko disimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "WhatsApp gagal disimpan. Coba lagi.");
    } finally { setSavingContact(false); }
  };

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) { toast.error("Password minimal 6 karakter"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw, current_password: current });
      if (error) throw error;
      toast.success("Password diperbarui");
      setPw(""); setCurrent("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password gagal diperbarui. Coba lagi.");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <BackButton to="/admin" className="mb-0 -ml-3" />
      <h1 className="text-2xl font-bold">Settings</h1>

      <form onSubmit={saveContact} className="space-y-4 border-y border-border py-6">
        <h2 className="font-bold">WhatsApp Toko</h2>
        <div className="space-y-2"><Label htmlFor="store-whatsapp">Nomor atau tautan WhatsApp</Label><Input id="store-whatsapp" type="text" placeholder="https://wa.me/62…" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></div>
        <Button variant="hero" type="submit" disabled={savingContact}>{savingContact && <Loader2 className="animate-spin" />} Simpan WhatsApp</Button>
      </form>

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
