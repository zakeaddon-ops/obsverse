import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";
import { BackButton } from "@/components/site/BackButton";

export const Route = createFileRoute("/admin/products/new")({
  component: () => (
    <div>
      <BackButton to="/admin" className="mb-2" />
      <h1 className="mb-6 text-2xl font-bold">Tambah Produk Baru</h1>
      <ProductForm />
    </div>
  ),
});
