import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, RefreshCw, ShieldCheck, Save, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackButton } from "@/components/site/BackButton";
import { getAdminPayments, savePaymentSettings, fulfillPaymentOrder } from "@/lib/payments.functions";
import { PAYMENT_LABELS } from "@/lib/payment-rules";
import { formatRupiah } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { saveOwnerPaymentKey } from "@/lib/owner.functions";

export const Route = createFileRoute("/admin/payments")({ head: () => ({ meta: [
  { title: "Pembayaran Admin — obsVerse" }, { name: "description", content: "Kelola pembayaran Midtrans dan pesanan obsVerse." },
  { property: "og:title", content: "Pembayaran Admin — obsVerse" }, { property: "og:description", content: "Pengaturan QRIS, e-wallet dan pesanan obsVerse." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
] }), component: AdminPayments });
function AdminPayments() {
  const get = useServerFn(getAdminPayments);
  const save = useServerFn(savePaymentSettings);
  const fulfill = useServerFn(fulfillPaymentOrder);
  const saveKey = useServerFn(saveOwnerPaymentKey);
  const qc = useQueryClient();
  const { data, isPending, error, refetch } = useQuery({ queryKey: ["admin-payments"], queryFn: () => get(), retry: false });
  const [environment, setEnvironment] = useState<"sandbox" | "live" | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [serverKey, setServerKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const submitKey = async (event: React.FormEvent) => {
    event.preventDefault(); setSavingKey(true);
    try {
      await saveKey({ data: { environment: mode, key: serverKey } });
      setServerKey(""); await refetch();
      await qc.invalidateQueries({ queryKey: ["payment-availability"] });
      toast.success("Server Key tersimpan aman");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Key gagal disimpan"); }
    finally { setServerKey(""); setSavingKey(false); }
  };
  const webhookUrl = "https://obsverse.lovable.app/api/public/midtrans/webhook";
  const copyWebhook = async () => {
    try { await navigator.clipboard.writeText(webhookUrl); toast.success("Alamat notifikasi disalin"); }
    catch { toast.error("Tidak dapat menyalin. Pilih dan salin alamat secara manual."); }
  };
  const mode = environment ?? (data?.settings.environment === "live" ? "live" : "sandbox");
  const keySet = mode === "live" ? data?.liveKeySet : data?.testKeySet;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true);
    try { await save({ data: { environment: mode, enabled: enabled ?? data?.settings.enabled ?? false } }); await qc.invalidateQueries({ queryKey: ["payment-availability"] }); await refetch(); setEnvironment(null); setEnabled(null); toast.success("Pengaturan pembayaran disimpan"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Gagal menyimpan"); } finally { setBusy(false); }
  };
  const complete = async (id: string) => {
    setProcessing(id);
    try { await fulfill({ data: { id } }); await refetch(); toast.success("Pesanan selesai"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Gagal menyelesaikan pesanan"); } finally { setProcessing(null); }
  };
  return <div className="max-w-5xl space-y-6"><BackButton to="/admin" /><h1 className="text-2xl font-bold">Pembayaran</h1>
    {isPending ? <p role="status">Memuat pembayaran…</p> : error ? <div className="space-y-3"><p role="alert">{error.message}</p><Button variant="outline" onClick={() => refetch()}>Coba lagi</Button></div> : data && <>
      {data.isOwner ? <section className="max-w-lg space-y-5 border-y border-border py-6">
        <h2 className="flex items-center gap-2 font-bold"><ShieldCheck className="text-primary-glow" />Midtrans · QRIS & E-wallet</h2>
        <div className="space-y-2"><Label>Lingkungan pembayaran</Label><Select value={mode} disabled={savingKey || busy} onValueChange={value => { setEnvironment(value === "live" ? "live" : "sandbox"); setEnabled(false); setServerKey(""); }}><SelectTrigger aria-label="Lingkungan pembayaran"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sandbox">Uji — tanpa uang asli</SelectItem><SelectItem value="live">Live — uang asli</SelectItem></SelectContent></Select></div>
        <p role="status" className="text-sm text-muted-foreground">{keySet ? "Server Key sudah tersimpan aman." : "Server Key belum tersimpan. Pembayaran belum bisa diaktifkan."}</p>
        <form onSubmit={submitKey} className="space-y-3">
          <Label htmlFor="midtrans-server-key">{keySet ? "Ganti Server Key" : "Server Key Midtrans"}</Label>
          <Input id="midtrans-server-key" type="password" autoComplete="new-password" value={serverKey} onChange={e => setServerKey(e.target.value)} required maxLength={256} disabled={savingKey || busy} />
          <Button type="submit" variant="outline" disabled={savingKey || busy || !serverKey.trim()}><Save />{savingKey ? "Menyimpan…" : "Simpan key"}</Button>
        </form>
        <dl className="space-y-3 text-sm">
          <div><dt className="font-semibold">Key yang diperlukan</dt><dd className="mt-1 break-all text-muted-foreground">{mode === "live" ? "MIDTRANS_LIVE_SERVER_KEY" : "MIDTRANS_SANDBOX_SERVER_KEY"}</dd></div>
          <div><dt className="font-semibold">Alamat notifikasi Midtrans</dt><dd className="mt-1 flex items-start gap-2"><code className="min-w-0 flex-1 select-all break-all text-xs text-muted-foreground">{webhookUrl}</code><Button type="button" variant="ghost" size="icon" aria-label="Salin alamat notifikasi" title="Salin alamat notifikasi" onClick={copyWebhook}><Copy /></Button></dd></div>
        </dl>
        <p className="text-sm text-muted-foreground">Pasang alamat ini sebagai Payment Notification URL di Midtrans setelah website diterbitkan. Mulai dengan mode uji sebelum mengaktifkan uang asli.</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center justify-between gap-4"><Label htmlFor="payment-enabled">Aktifkan pembayaran</Label><Switch id="payment-enabled" checked={enabled ?? data.settings.enabled} onCheckedChange={setEnabled} disabled={!keySet || savingKey || busy} /></div>
          <Button type="submit" variant="hero" disabled={busy || savingKey}><Save />Simpan pengaturan</Button>
        </form>
      </section> : <p className="border-y border-border py-5 text-sm text-muted-foreground">Key dan pengaturan pembayaran hanya dapat diubah oleh owner.</p>}
      <section><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Pesanan</h2><Button variant="ghost" size="icon" title="Perbarui pesanan" aria-label="Perbarui pesanan" onClick={() => refetch()}><RefreshCw /></Button></div>
        {data.orders.length === 0 ? <p className="border-y border-border py-12 text-center text-muted-foreground">Belum ada pesanan pembayaran.</p> : <div className="divide-y divide-border">{data.orders.map(order => <article key={order.id} className="space-y-3 py-5">
          <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{order.product_name}</h3><span className="font-semibold text-primary-glow">{formatRupiah(order.amount)}</span></div>
          <p className="break-all text-xs text-muted-foreground">{order.id} · {new Date(order.created_at).toLocaleString("id-ID")}</p>
          <p className="text-sm">{order.buyer_name} · {order.minecraft_name}</p><p className="text-sm text-muted-foreground">WhatsApp: {order.buyer_whatsapp}</p>
          <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-primary-glow">{PAYMENT_LABELS[order.status] ?? order.status}{order.environment === "sandbox" ? " · Uji" : " · Live"}</span>
            {order.fulfilled ? <span className="text-sm">Sudah diserahkan</span> : order.status === "paid" && <Button variant="outline" size="sm" disabled={processing === order.id} onClick={() => complete(order.id)}><Check />Tandai sudah diserahkan</Button>}
          </div>
        </article>)}</div>}
      </section>
    </>}
  </div>;
}