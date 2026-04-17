import { useEffect, useState } from "react";
import DataTable from "../components/common/DataTable";
import { fetchSuppliers } from "../services/supplierService";
import { fetchProducts } from "../services/productService";
import { createPurchase, fetchPurchases } from "../services/purchaseService";
import { currency } from "../utils/format";

const PurchasesPage = () => {
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ supplierId: "", productId: "", quantity: "", unitCost: "" });

  const load = async () => {
    const data = await fetchPurchases();
    setRows(data.data || []);
  };

  useEffect(() => {
    load();
    fetchSuppliers().then((d) => setSuppliers(d.data || []));
    fetchProducts().then((d) => setProducts(d.data || []));
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    await createPurchase({
      supplierId: form.supplierId,
      items: [{ productId: form.productId, quantity: Number(form.quantity), unitCost: Number(form.unitCost) }]
    });
    setForm({ supplierId: "", productId: "", quantity: "", unitCost: "" });
    await load();
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-xl border border-brand-100 bg-white p-4 md:grid-cols-2"
      >
        <select
          value={form.supplierId}
          onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
          required
        >
          <option value="">Select supplier</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={form.productId}
          onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
          required
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>

        <input
          placeholder="Quantity"
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          required
        />
        <input
          placeholder="Unit cost (₹)"
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
          value={form.unitCost}
          onChange={(e) => setForm((p) => ({ ...p, unitCost: e.target.value }))}
          required
        />
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white md:col-span-2">
          Create purchase
        </button>
      </form>

      <DataTable
        columns={[
          { key: "supplier", label: "Supplier", render: (row) => row.supplier?.name || row.supplier },
          { key: "totalAmount", label: "Total", render: (row) => currency(row.totalAmount) },
          { key: "createdAt", label: "Date", render: (row) => new Date(row.createdAt).toLocaleDateString() }
        ]}
        rows={rows}
      />
    </div>
  );
};

export default PurchasesPage;