import { createFileRoute } from "@tanstack/react-router";
import { ProductTable } from "@/components/admin/ProductTable";

export const Route = createFileRoute("/admin/products/")({
  component: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Products</h1>
      <ProductTable />
    </div>
  ),
});
