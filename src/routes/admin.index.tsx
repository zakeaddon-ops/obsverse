import { createFileRoute } from "@tanstack/react-router";
import { ProductTable } from "@/components/admin/ProductTable";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [
    { title: "Dashboard Admin — obsVerse" },
    { name: "description", content: "Ringkasan produk dan pengunjung toko obsVerse." },
    { property: "og:title", content: "Dashboard Admin — obsVerse" },
    { property: "og:description", content: "Ringkasan produk dan pengunjung toko obsVerse." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <ProductTable showStats />
    </div>
  ),
});
