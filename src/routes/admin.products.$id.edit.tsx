import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "@/components/admin/ProductForm";
import { BackButton } from "@/components/site/BackButton";
import { productQuery } from "@/lib/products";

export const Route = createFileRoute("/admin/products/$id/edit")({
  head: () => ({ meta: [
    { title: "Edit Produk — obsVerse" },
    { name: "description", content: "Perbarui informasi produk di obsVerse." },
    { property: "og:title", content: "Edit Produk — obsVerse" },
    { property: "og:description", content: "Perbarui informasi produk di obsVerse." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(productQuery(id));
  return (
    <div>
      <BackButton to="/admin" className="mb-2" />
      <h1 className="mb-6 text-2xl font-bold">Edit Produk</h1>
      {isLoading ? <p className="text-muted-foreground">Memuat...</p> : data ? <ProductForm key={data.id} product={data} /> : <p className="text-muted-foreground">Produk tidak ditemukan.</p>}
    </div>
  );
}
