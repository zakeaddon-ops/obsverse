import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BADGES, CATEGORIES, uploadProductImage, type Product } from "@/lib/products";

export function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: product?.name ?? "",
    category: product?.category ?? "Rank",
    price: product?.price ?? 0,
    sold: product?.sold ?? 0,
    short_desc: product?.short_desc ?? "",
    features: (product?.features ?? []).join("\n"),
    tags: (product?.tags ?? []).join(", "),
    badge: product?.badge ?? "None",
    wa_link: product?.wa_link ?? "",
    is_featured: product?.is_featured ?? false,
    main_image: product?.main_image ?? "",
    gallery: product?.gallery ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  const onMain = async (file?: File) => {
    if (!file) return;
    setUploading("main");
    try { set("main_image", await uploadProductImage(file)); } catch (e) { toast.error((e as Error).message); }
    setUploading(null);
  };
  const onGallery = async (files: FileList | null) => {
    if (!files) return;
    const room = 3 - f.gallery.length;
    const picked = Array.from(files).slice(0, room);
    if (!picked.length) return toast.error("Maksimal 3 gambar galeri");
    setUploading("gallery");
    try {
      const urls = await Promise.all(picked.map(uploadProductImage));
      setF((s) => ({ ...s, gallery: [...s.gallery, ...urls].slice(0, 3) }));
    } catch (e) { toast.error((e as Error).message); }
    setUploading(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return toast.error("Nama produk wajib diisi");
    setSaving(true);
    const payload = {
      name: f.name.trim(),
      category: f.category,
      price: Number(f.price) || 0,
      sold: Number(f.sold) || 0,
      short_desc: f.short_desc,
      features: f.features.split("\n").map((x) => x.trim()).filter(Boolean),
      tags: f.tags.split(",").map((x) => x.trim()).filter(Boolean),
      badge: f.badge,
      wa_link: f.wa_link,
      is_featured: f.is_featured,
      main_image: f.main_image || null,
      gallery: f.gallery,
    };
    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) return toast.error("Gagal menyimpan: " + error.message);
    toast.success("Produk disimpan");
    qc.invalidateQueries({ queryKey: ["products"] });
    navigate({ to: "/admin" });
  };

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <Field label="Product Name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} required /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <Select value={f.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Badge">
            <Select value={f.badge} onValueChange={(v) => set("badge", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BADGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Price (Rp)"><Input type="number" min={0} value={f.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
          <Field label="Total Terjual"><Input type="number" min={0} value={f.sold} onChange={(e) => set("sold", Number(e.target.value))} /></Field>
        </div>
        <Field label="Short Description"><Textarea rows={3} value={f.short_desc} onChange={(e) => set("short_desc", e.target.value)} /></Field>
        <Field label="Full Features" hint="1 fitur per baris"><Textarea rows={6} value={f.features} onChange={(e) => set("features", e.target.value)} /></Field>
        <Field label="Tags" hint="Pisahkan dengan koma, contoh: Java & Bedrock, LuckPerms"><Input value={f.tags} onChange={(e) => set("tags", e.target.value)} /></Field>
        <Field label="WhatsApp Link"><Input placeholder="https://wa.me/62..." value={f.wa_link} onChange={(e) => set("wa_link", e.target.value)} /></Field>
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <div><div className="font-medium">Is Featured</div><div className="text-xs text-muted-foreground">Tampilkan di urutan teratas</div></div>
          <Switch checked={f.is_featured} onCheckedChange={(v) => set("is_featured", v)} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Label>Main Image</Label>
          <label className="mt-3 grid aspect-video cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-primary">
            {uploading === "main" ? <Loader2 className="animate-spin text-primary-glow" /> : f.main_image ? (
              <img src={f.main_image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground"><ImagePlus className="text-primary-glow" /> Upload gambar</span>
            )}
            <input type="file" accept="image/*" hidden onChange={(e) => onMain(e.target.files?.[0])} />
          </label>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Label>Gallery Images ({f.gallery.length}/3)</Label>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {f.gallery.map((g, i) => (
              <div key={g} className="relative aspect-video overflow-hidden rounded-lg">
                <img src={g} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => set("gallery", f.gallery.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-background/80" aria-label="Hapus">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {f.gallery.length < 3 && (
              <label className="grid aspect-video cursor-pointer place-items-center rounded-lg border-2 border-dashed border-border hover:border-primary">
                {uploading === "gallery" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4 text-primary-glow" />}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => onGallery(e.target.files)} />
              </label>
            )}
          </div>
        </div>
        <Button variant="hero" type="submit" className="h-12 w-full rounded-xl" disabled={saving || !!uploading}>
          {saving && <Loader2 className="animate-spin" />} Simpan Produk
        </Button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
