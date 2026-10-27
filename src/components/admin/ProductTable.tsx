import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductBadge } from "@/components/site/ProductCard";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah, productsQuery, useProductsRealtime } from "@/lib/products";

export function ProductTable({ showStats = false }: { showStats?: boolean }) {
  useProductsRealtime();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery(productsQuery);
  const [q, setQ] = useState("");
  const list = data.filter((p) => (p.name + p.category).toLowerCase().includes(q.toLowerCase()));

  const remove = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error("Gagal menghapus: " + error.message);
    toast.success("Produk dihapus");
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div className="space-y-6">
      {showStats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Products" value={data.length} />
          <StatCard label="Categories" value={new Set(data.map((p) => p.category)).size} />
          <StatCard label="Total Views" value={data.reduce((a, p) => a + p.views, 0)} />
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari produk..." value={q} onChange={(e) => setQ(e.target.value)} className="h-10 bg-card pl-9" />
        </div>
        <Button variant="hero" className="h-10 rounded-xl" asChild>
          <Link to="/admin/products/new"><Plus /> Tambah Produk Baru</Link>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">Produk</th><th className="p-4">Kategori</th><th className="p-4">Harga</th>
              <th className="p-4">Badge</th><th className="p-4">Views</th><th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Memuat...</td></tr>}
            {!isLoading && list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Belum ada produk.</td></tr>}
            {list.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {p.main_image ? <img src={p.main_image} alt="" className="h-10 w-16 rounded-md object-cover" /> : <div className="h-10 w-16 rounded-md bg-muted" />}
                    <span className="font-semibold">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{p.category}</td>
                <td className="p-4 font-semibold">{formatRupiah(p.price)}</td>
                <td className="p-4">{p.badge === "None" ? <span className="text-muted-foreground">—</span> : <ProductBadge badge={p.badge} />}</td>
                <td className="p-4 text-muted-foreground">{p.views}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="soft" asChild>
                      <Link to="/admin/products/$id/edit" params={{ id: p.id }}><Pencil /> Edit</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline"><Trash2 /> Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
                          <AlertDialogDescription>"{p.name}" akan dihapus permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(p.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold text-gradient">{value.toLocaleString("id-ID")}</div>
    </div>
  );
}
