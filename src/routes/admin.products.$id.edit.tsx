import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "@/components/admin/ProductForm";
import { productQuery } from "@/lib/products";

export const Route = createFileRoute("/admin/products/$id/edit")({
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(productQuery(id));
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Produk</h1>
      {isLoading ? <p className="text-muted-foreground">Memuat...</p> : data ? <ProductForm key={data.id} product={data} /> : <p className="text-muted-foreground">Produk tidak ditemukan.</p>}
    </div>
  );
}
