import { createFileRoute } from "@tanstack/react-router";
import { ProductTable } from "@/components/admin/ProductTable";

export const Route = createFileRoute("/admin/products/")({
  head: () => ({ meta: [
    { title: "Kelola Produk — obsVerse" },
    { name: "description", content: "Daftar produk Minecraft di toko obsVerse." },
    { property: "og:title", content: "Kelola Produk — obsVerse" },
    { property: "og:description", content: "Daftar produk Minecraft di toko obsVerse." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Products</h1>
      <ProductTable />
    </div>
  ),
});
