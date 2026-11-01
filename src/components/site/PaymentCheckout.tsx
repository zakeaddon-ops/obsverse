import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Loader2, QrCode } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPayment, getPaymentAvailability } from "@/lib/payments.functions";
import { formatRupiah, type Product } from "@/lib/products";

export function PaymentCheckout({ product }: { product: Product }) {
  const { data: availability, isError } = useQuery({ queryKey: ["payment-availability"], queryFn: () => getPaymentAvailability(), staleTime: 15_000 });
  const create = useServerFn(createPayment);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [minecraft, setMinecraft] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    const access = token ?? crypto.randomUUID(); setToken(access);
    try {
      // The capability stays in this tab, never in a provider redirect or query string.
      sessionStorage.setItem(`obsverse-payment-token-${product.id}`, access);
      const result = await create({ data: { productId: product.id, token: access, buyerName: name, whatsapp, minecraftName: minecraft } });
      sessionStorage.setItem(`obsverse-order-${result.id}`, access);
      await navigate({ to: "/payment/$id", params: { id: result.id } });
    } catch (e) { setError(e instanceof Error ? e.message : "Pembayaran gagal dibuka."); }
    finally { setBusy(false); }
  };
  const enabled = availability?.enabled && product.price > 0;
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline" size="lg" className="h-12 rounded-xl" disabled={!enabled}><QrCode />{enabled ? "Bayar QRIS / E-wallet" : isError ? "Pembayaran tidak tersedia" : "QRIS / E-wallet segera tersedia"}</Button></DialogTrigger>
    <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-lg">
      <DialogHeader><DialogTitle>Bayar pesanan</DialogTitle><DialogDescription>{product.name} · {formatRupiah(product.price)}</DialogDescription></DialogHeader>
      {availability?.environment === "sandbox" && <p role="status" className="text-sm text-primary-glow">Mode uji — tanpa uang asli</p>}
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="buyer-name">Nama pembeli</Label><Input id="buyer-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={80} /></div>
        <div className="space-y-2"><Label htmlFor="buyer-whatsapp">Nomor WhatsApp</Label><Input id="buyer-whatsapp" type="tel" autoComplete="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required maxLength={30} /></div>
        <div className="space-y-2"><Label htmlFor="minecraft-name">Username Minecraft</Label><Input id="minecraft-name" value={minecraft} onChange={e => setMinecraft(e.target.value)} required minLength={3} maxLength={16} pattern="[A-Za-z0-9_]+" /></div>
        <p className="text-xs text-muted-foreground">Data pesanan digunakan admin untuk menghubungi dan menyerahkan produk.</p>
        {error && <p role="alert" className="text-sm text-primary-glow">{error}</p>}
        <Button variant="hero" className="w-full" disabled={busy} type="submit">{busy ? <Loader2 className="animate-spin" /> : <CreditCard />}Lanjutkan pembayaran</Button>
      </form>
    </DialogContent>
  </Dialog>;
}