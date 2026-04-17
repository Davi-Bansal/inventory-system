import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../components/common/DataTable";
import { fetchCustomers } from "../services/customerService";
import { createSale, fetchSales, finalizeSale, cancelSale, downloadInvoiceUrl } from "../services/salesService";
import { currency } from "../utils/format";

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    productId: "",
    quantity: "",
    paymentMethod: "Cash",
    discountAmount: "0"
  });

  const loadSales = async () => {
    const data = await fetchSales();
    setSales(data.data || []);
  };

  useEffect(() => {
    loadSales();
    fetchCustomers().then((d) => setCustomers(d.data || []));
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    await createSale({
      customerId: form.customerId || undefined,
      items: [{ productId: form.productId, quantity: Number(form.quantity) }],
      paymentMethod: form.paymentMethod,
      discountAmount: Number(form.discountAmount)
    });
    toast.success("Sale draft created");
    setForm({ customerId: "", productId: "", quantity: "", paymentMethod: "Cash", discountAmount: "0" });
    await loadSales();
  };

  const onFinalize = async (saleId) => {
    await finalizeSale(saleId);
    toast.success("Sale finalized and stock updated");
    await loadSales();
  };

  const onCancel = async (saleId) => {
    if (!window.confirm("Cancel this draft sale?")) return;
    await cancelSale(saleId);
    toast.success("Sale cancelled");
    await loadSales();
  };

  const columns = [
    { key: "invoiceNo", label: "Invoice" },
    { key: "customer", label: "Customer", render: (row) => row.customer?.name || "Walk-in" },
    { key: "paymentMethod", label: "Payment" },
    { key: "status", label: "Status" },
    { key: "discountAmount", label: "Discount", render: (row) => currency(row.discountAmount) },
    { key: "finalAmount", label: "Total", render: (row) => currency(row.finalAmount) },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "draft" && (
            <>
              <button
                onClick={() => onFinalize(row._id)}
                className="rounded bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:bg-teal-700"
              >
                Finalize
              </button>
              <button
                onClick={() => onCancel(row._id)}
                className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
              >
                Cancel
              </button>
            </>
          )}
          {row.status === "finalized" && (
            <a
              href={downloadInvoiceUrl(row._id)}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-slate-700 px-2 py-1 text-xs font-medium text-white hover:bg-slate-800"
            >
              PDF
            </a>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-xl border border-brand-100 bg-white p-4 md:grid-cols-3"
      >
        {/* Customer selector */}
        <select
          value={form.customerId}
          onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
        >
          <option value="">Walk-in customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.phone ? `(${c.phone})` : ""}
            </option>
          ))}
        </select>

        <input
          placeholder="Product ID"
          value={form.productId}
          onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
          required
        />
        <input
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
          required
        />
        <select
          value={form.paymentMethod}
          onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
          <option>Credit</option>
        </select>
        <input
          placeholder="Discount amount (₹)"
          value={form.discountAmount}
          onChange={(e) => setForm((p) => ({ ...p, discountAmount: e.target.value }))}
          className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white md:col-span-3">
          Create sale
        </button>
      </form>

      <DataTable columns={columns} rows={sales} />
    </div>
  );
};

export default SalesPage;