import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../components/common/DataTable";
import usePermissions from "../hooks/usePermissions";
import { adjustInventory, fetchInventory } from "../services/inventoryService";

const InventoryPage = () => {
  const { isAdmin } = usePermissions();
  const [rows, setRows] = useState([]);
  const [adjustForm, setAdjustForm] = useState({ productId: "", adjustment: "", reason: "" });

  const loadInventory = async () => {
    const data = await fetchInventory();
    setRows(data.data || []);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const onAdjust = async (event) => {
    event.preventDefault();
    await adjustInventory({
      productId: adjustForm.productId,
      adjustment: Number(adjustForm.adjustment),
      reason: adjustForm.reason
    });
    toast.success("Stock adjusted");
    setAdjustForm({ productId: "", adjustment: "", reason: "" });
    await loadInventory();
  };

  const columns = [
    { key: "product", label: "Product", render: (row) => row.product?.name || "-" },
    { key: "sku", label: "SKU", render: (row) => row.product?.sku || "-" },
    { key: "quantity", label: "Quantity" },
    {
      key: "status",
      label: "Status",
      render: (row) => (row.outOfStock ? "Out of stock" : row.lowStock ? "Low stock" : "Available")
    }
  ];

  return (
    <div className="space-y-4">
      {isAdmin && (
        <form onSubmit={onAdjust} className="grid gap-3 rounded-xl border border-brand-100 bg-white p-4 md:grid-cols-3">
          <input
            placeholder="Product ID"
            className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
            value={adjustForm.productId}
            onChange={(event) => setAdjustForm((prev) => ({ ...prev, productId: event.target.value }))}
            required
          />
          <input
            placeholder="Adjustment (+/-)"
            className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
            value={adjustForm.adjustment}
            onChange={(event) => setAdjustForm((prev) => ({ ...prev, adjustment: event.target.value }))}
            required
          />
          <input
            placeholder="Reason"
            className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
            value={adjustForm.reason}
            onChange={(event) => setAdjustForm((prev) => ({ ...prev, reason: event.target.value }))}
            required
          />
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white md:col-span-3">
            Adjust stock
          </button>
        </form>
      )}
      <DataTable columns={columns} rows={rows} />
    </div>
  );
};

export default InventoryPage;
