import { createFileRoute } from "@tanstack/react-router";
import { ProductTable } from "@/components/admin/ProductTable";

export const Route = createFileRoute("/admin/")({
  component: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <ProductTable showStats />
    </div>
  ),
});
