import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/site/BackButton";
import { Navbar, Footer } from "@/components/site/Navbar";
import { getPaymentOrder } from "@/lib/payments.functions";
import { PAYMENT_LABELS } from "@/lib/payment-rules";
import { formatRupiah } from "@/lib/products";

export const Route = createFileRoute("/payment/$id")({
  head: () => ({ meta: [
    { title: "Status Pembayaran — obsVerse" }, { name: "description", content: "Status pesanan dan pembayaran QRIS atau e-wallet obsVerse." },
    { property: "og:title", content: "Status Pembayaran — obsVerse" }, { property: "og:description", content: "Periksa pembayaran pesanan Minecraft obsVerse." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }), component: PaymentPage,
});
function PaymentPage() {
  const { id } = Route.useParams();
  const getOrder = useServerFn(getPaymentOrder);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setToken(sessionStorage.getItem(`obsverse-order-${id}`)); } catch { setToken(null); } finally { setReady(true); } }, [id]);
  const { data: order, error, isPending, refetch, isFetching } = useQuery({ queryKey: ["payment-order", id, token],
    queryFn: () => { if (!token) throw new Error("Akses pesanan tidak tersedia."); return getOrder({ data: { id, token } }); },
    enabled: Boolean(token), retry: false, refetchInterval: query => ["creating", "pending"].includes(query.state.data?.status ?? "") ? 20_000 : false,
  });
  return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-2xl px-4 py-8"><BackButton />
    <div className="mb-6 flex items-center gap-3 text-primary-glow"><ShieldCheck /><h1 className="text-2xl font-bold">Status pembayaran</h1></div>
    {ready && !token ? <p role="alert" className="py-8 text-muted-foreground">Buka pesanan dari tab yang digunakan saat checkout.</p> : isPending ? <p role="status">Memuat pesanan…</p> : error ? <div className="space-y-4"><p role="alert" className="text-muted-foreground">{error.message}</p><Button variant="outline" onClick={() => refetch()}><RefreshCw />Coba lagi</Button></div> : order && <div className="space-y-6">
      {order.environment === "sandbox" && <p className="border-y border-border py-3 text-sm text-primary-glow">Mode uji — tanpa uang asli</p>}
      <div><p className="text-sm text-muted-foreground">Pesanan {order.id}</p><h2 className="mt-2 text-xl font-bold">{order.productName}</h2><p className="mt-3 font-display text-3xl font-bold text-primary-glow">{formatRupiah(order.amount)}</p></div>
      <section className="space-y-3 border-y border-border py-6"><h2 className="flex items-center gap-2 text-lg font-semibold">{order.status === "paid" && <CheckCircle2 />}{PAYMENT_LABELS[order.status] ?? order.status}</h2>
        {order.status === "paid" && <p className="text-sm text-muted-foreground">{order.fulfilled ? "Produk sudah diserahkan oleh admin." : "Pembayaran terverifikasi. Pesanan menunggu diproses admin."}</p>}
        {order.status === "creating" && <p className="text-sm text-muted-foreground">Pembayaran belum selesai disiapkan. Periksa status sebelum membuat pesanan baru.</p>}
        {order.status === "expired" && <p className="text-sm text-muted-foreground">Waktu pembayaran telah habis. Jangan bayar kode dari pesanan ini.</p>}
        {["failed", "cancelled"].includes(order.status) && <p className="text-sm text-muted-foreground">Pembayaran tidak selesai. Periksa riwayat transaksi sebelum mencoba pesanan baru.</p>}
        {order.verificationPending && <p role="status" className="text-sm text-muted-foreground">Verifikasi sementara belum tersedia. Coba periksa lagi.</p>}
        {order.checkoutUrl && order.status === "pending" && <Button variant="hero" asChild><a href={order.checkoutUrl} rel="noopener noreferrer"><ExternalLink />Buka pembayaran Midtrans</a></Button>}
      </section>
      <Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={isFetching ? "animate-spin" : ""} />Periksa status</Button>
    </div>}
  </main><Footer /></div>;
}