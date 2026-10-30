import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";
import { BackButton } from "@/components/site/BackButton";

export const Route = createFileRoute("/admin/products/new")({
  head: () => ({ meta: [
    { title: "Tambah Produk — obsVerse" },
    { name: "description", content: "Tambahkan produk Minecraft baru ke obsVerse." },
    { property: "og:title", content: "Tambah Produk — obsVerse" },
    { property: "og:description", content: "Tambahkan produk Minecraft baru ke obsVerse." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: () => (
    <div>
      <BackButton to="/admin" className="mb-2" />
      <h1 className="mb-6 text-2xl font-bold">Tambah Produk Baru</h1>
      <ProductForm />
    </div>
  ),
});
