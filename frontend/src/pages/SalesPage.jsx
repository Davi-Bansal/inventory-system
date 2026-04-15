import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../components/common/DataTable";
import { createSale, fetchSales, finalizeSale } from "../services/salesService";
import { currency } from "../utils/format";

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({ productId: "", quantity: "", paymentMethod: "Cash", discountAmount: "0" });

  const loadSales = async () => {
    const data = await fetchSales();
    setSales(data.data || []);
  };

  useEffect(() => {
    loadSales();
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();

    await createSale({
      items: [{ productId: form.productId, quantity: Number(form.quantity) }],
      paymentMethod: form.paymentMethod,
      discountAmount: Number(form.discountAmount)
    });

    toast.success("Sale draft created");
    setForm({ productId: "", quantity: "", paymentMethod: "Cash", discountAmount: "0" });
    await loadSales();
  };

  const onFinalize = async (saleId) => {
    await finalizeSale(saleId);
    toast.success("Sale finalized and stock updated");
    await loadSales();
  };

  const columns = [
    { key: "invoiceNo", label: "Invoice" },
    { key: "paymentMethod", label: "Payment" },
    { key: "status", label: "Status" },
    { key: "discountAmount", label: "Discount", render: (row) => currency(row.discountAmount) },
    { key: "finalAmount", label: "Total", render: (row) => currency(row.finalAmount) },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        row.status === "draft" ? (
          <button
            onClick={() => onFinalize(row._id)}
            className="rounded bg-teal-600 px-3 py-1 text-xs font-medium text-white"
          >
            Finalize
          </button>
        ) : (
          "-"
        )
    }
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={onCreate} className="grid gap-3 rounded-xl border border-brand-100 bg-white p-4 md:grid-cols-4">
        <input
          placeholder="Product ID"
          value={form.productId}
          onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
          required
        />
        <input
          placeholder="Quantity"
          value={form.quantity}
          onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
          required
        />
        <select
          value={form.paymentMethod}
          onChange={(event) => setForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
          <option>Credit</option>
        </select>
        <input
          placeholder="Discount amount"
          value={form.discountAmount}
          onChange={(event) => setForm((prev) => ({ ...prev, discountAmount: event.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white md:col-span-4">Create sale</button>
      </form>
      <DataTable columns={columns} rows={sales} />
    </div>
  );
};

export default SalesPage;
