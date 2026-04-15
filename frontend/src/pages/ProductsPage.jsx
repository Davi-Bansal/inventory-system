import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../components/common/DataTable";
import usePermissions from "../hooks/usePermissions";
import { createProduct, fetchProducts } from "../services/productService";
import { currency } from "../utils/format";

const initialForm = {
  name: "",
  category: "",
  price: "",
  costPrice: "",
  sku: "",
  description: ""
};

const ProductsPage = () => {
  const { isAdmin } = usePermissions();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data.data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    await createProduct({
      ...form,
      price: Number(form.price),
      costPrice: Number(form.costPrice)
    });
    toast.success("Product created");
    setForm(initialForm);
    await loadProducts();
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "sku", label: "SKU" },
    { key: "price", label: "Price", render: (row) => currency(row.price) },
    { key: "costPrice", label: "Cost", render: (row) => currency(row.costPrice) },
    { key: "gstRate", label: "GST %" }
  ];

  return (
    <div className="space-y-4">
      {isAdmin && (
        <form onSubmit={onCreate} className="grid gap-3 rounded-xl border border-brand-100 bg-white p-4 md:grid-cols-3">
          {Object.keys(initialForm).map((field) => (
            <input
              key={field}
              placeholder={field}
              className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
              value={form[field]}
              onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
              required={field !== "description"}
            />
          ))}
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white md:col-span-3">
            Add product
          </button>
        </form>
      )}

      <DataTable columns={columns} rows={products} />
    </div>
  );
};

export default ProductsPage;
