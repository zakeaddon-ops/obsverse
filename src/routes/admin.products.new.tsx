import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/new")({
  component: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tambah Produk Baru</h1>
      <ProductForm />
    </div>
  ),
});
