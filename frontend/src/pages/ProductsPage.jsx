import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../components/common/DataTable";
import usePermissions from "../hooks/usePermissions";
import { createProduct, fetchProducts, getProductBarcode, getProductQr } from "../services/productService";
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [qrModal, setQrModal] = useState(null);   // { type: "qr"|"barcode", src, name }
  const fileInputRef = useRef();

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data.data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onCreate = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries({ ...form, price: Number(form.price), costPrice: Number(form.costPrice) }).forEach(
      ([k, v]) => formData.append(k, v)
    );
    if (imageFile) formData.append("image", imageFile);

    await createProduct(formData);
    toast.success("Product created");
    setForm(initialForm);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    await loadProducts();
  };

  const openQr = async (product) => {
    try {
      const data = await getProductQr(product._id);
      setQrModal({ type: "qr", src: data.qrDataUrl, name: product.name });
    } catch {
      toast.error("Could not load QR code");
    }
  };

  const openBarcode = async (product) => {
    try {
      const src = await getProductBarcode(product._id);
      setQrModal({ type: "barcode", src, name: product.name });
    } catch {
      toast.error("Could not load barcode");
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (row) =>
        row.imageUrl ? (
          <img src={row.imageUrl} alt={row.name} className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
            —
          </div>
        )
    },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "sku", label: "SKU" },
    { key: "price", label: "Price", render: (row) => currency(row.price) },
    { key: "costPrice", label: "Cost", render: (row) => currency(row.costPrice) },
    { key: "gstRate", label: "GST %" },
    {
      key: "codes",
      label: "Codes",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openQr(row)}
            className="rounded bg-teal-600 px-2 py-0.5 text-xs text-white hover:bg-teal-700"
          >
            QR
          </button>
          <button
            onClick={() => openBarcode(row)}
            className="rounded bg-slate-700 px-2 py-0.5 text-xs text-white hover:bg-slate-800"
          >
            Barcode
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* QR / Barcode modal */}
      {qrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setQrModal(null)}
        >
          <div
            className="rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-center text-sm font-semibold text-slate-800">
              {qrModal.type === "qr" ? "QR Code" : "Barcode"} — {qrModal.name}
            </p>
            <img src={qrModal.src} alt="code" className="mx-auto max-w-[260px]" />
            <button
              onClick={() => setQrModal(null)}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create form (admin only) */}
      {isAdmin && (
        <form
          onSubmit={onCreate}
          className="grid gap-3 rounded-xl border border-brand-100 bg-white p-4 md:grid-cols-3"
          encType="multipart/form-data"
        >
          {Object.keys(initialForm).map((field) => (
            <input
              key={field}
              placeholder={field.replace(/([A-Z])/g, " $1").toLowerCase()}
              className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
              value={form[field]}
              onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
              required={field !== "description"}
            />
          ))}

          {/* Image upload */}
          <div className="md:col-span-3">
            <label className="mb-1 block text-xs text-slate-500">Product image (optional)</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-slate-600"
              />
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="h-12 w-12 rounded-lg object-cover" />
              )}
            </div>
          </div>

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