// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import DataTable from "../components/common/DataTable";
// import usePermissions from "../hooks/usePermissions";
// import { createProduct, fetchProducts, getProductBarcode, getProductQr } from "../services/productService";
// import { currency } from "../utils/format";

// const initialForm = {
//   name: "",
//   category: "",
//   price: "",
//   costPrice: "",
//   sku: "",
//   description: ""
// };

// const ProductsPage = () => {
//   const { isAdmin } = usePermissions();
//   const [products, setProducts] = useState([]);
//   const [form, setForm] = useState(initialForm);
//   const [qrModal, setQrModal] = useState(null); // { type: "qr"|"barcode", src, name }

//   const loadProducts = async () => {
//     const data = await fetchProducts();
//     setProducts(data.data || []);
//   };

//   useEffect(() => {
//     loadProducts();
//   }, []);

//   const onCreate = async (event) => {
//     event.preventDefault();
//     await createProduct({
//       ...form,
//       price: Number(form.price),
//       costPrice: Number(form.costPrice)
//     });
//     toast.success("Product created");
//     setForm(initialForm);
//     await loadProducts();
//   };

//   const openQr = async (product) => {
//     try {
//       const data = await getProductQr(product._id);
//       setQrModal({ type: "qr", src: data.qrDataUrl, name: product.name });
//     } catch {
//       toast.error("Could not load QR code");
//     }
//   };

//   const openBarcode = async (product) => {
//     try {
//       const src = await getProductBarcode(product._id);
//       setQrModal({ type: "barcode", src, name: product.name });
//     } catch {
//       toast.error("Could not load barcode");
//     }
//   };

//   const columns = [
//     { key: "name",      label: "Name" },
//     { key: "category",  label: "Category" },
//     { key: "sku",       label: "SKU" },
//     { key: "price",     label: "Price",    render: (row) => currency(row.price) },
//     { key: "costPrice", label: "Cost",     render: (row) => currency(row.costPrice) },
//     { key: "gstRate",   label: "GST %" },
//     {
//       key: "codes",
//       label: "Codes",
//       render: (row) => (
//         <div className="flex gap-2">
//           <button
//             onClick={() => openQr(row)}
//             className="rounded bg-teal-600 px-2 py-0.5 text-xs text-white hover:bg-teal-700"
//           >
//             QR
//           </button>
//           <button
//             onClick={() => openBarcode(row)}
//             className="rounded bg-slate-700 px-2 py-0.5 text-xs text-white hover:bg-slate-800"
//           >
//             Barcode
//           </button>
//         </div>
//       )
//     }
//   ];

//   return (
//     <div className="space-y-4">
//       {/* QR / Barcode modal */}
//       {qrModal && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
//           onClick={() => setQrModal(null)}
//         >
//           <div
//             className="rounded-2xl bg-white p-6 shadow-xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <p className="mb-4 text-center text-sm font-semibold text-slate-800">
//               {qrModal.type === "qr" ? "QR Code" : "Barcode"} — {qrModal.name}
//             </p>
//             <img src={qrModal.src} alt="code" className="mx-auto max-w-[260px]" />
//             <button
//               onClick={() => setQrModal(null)}
//               className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Create form (admin only) */}
//       {isAdmin && (
//         <form
//           onSubmit={onCreate}
//           className="grid gap-3 rounded-xl border border-brand-100 bg-white p-4 md:grid-cols-3"
//         >
//           {Object.keys(initialForm).map((field) => (
//             <input
//               key={field}
//               placeholder={field.replace(/([A-Z])/g, " $1").toLowerCase()}
//               className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
//               value={form[field]}
//               onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
//               required={field !== "description"}
//             />
//           ))}

//           <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white md:col-span-3">
//             Add product
//           </button>
//         </form>
//       )}

//       <DataTable columns={columns} rows={products} />
//     </div>
//   );
// };

// export default ProductsPage;





import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../components/common/DataTable";
import usePermissions from "../hooks/usePermissions";
import { createProduct, fetchProducts, getProductBarcode, getProductQr } from "../services/productService";
import { currency } from "../utils/format";

const initialForm = {
  name: "",
  sku: "",
  costPrice: "",
  price: "",
  description: ""
};

const fieldLabels = {
  name:        "Product Name",
  sku:         "MRP Price",
  costPrice:   "Purchase Price",
  price:       "Selling Price",
  description: "Description (optional)"
};

const ProductsPage = () => {
  const { isAdmin } = usePermissions();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [qrModal, setQrModal] = useState(null);

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data.data || []);
  };

  useEffect(() => { loadProducts(); }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    await createProduct({
      ...form,
      price:     Number(form.price),
      costPrice: Number(form.costPrice)
    });
    toast.success("Product created");
    setForm(initialForm);
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
    { key: "name",      label: "Name" },
    { key: "sku",       label: "MRP Price" },
    { key: "costPrice", label: "Purchase Price", render: (row) => currency(row.costPrice) },
    { key: "price",     label: "Selling Price",  render: (row) => currency(row.price) },
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
        >
          {Object.keys(initialForm).map((field) => (
            <input
              key={field}
              placeholder={fieldLabels[field]}
              className="rounded-lg border border-brand-100 px-3 py-2 text-sm"
              value={form[field]}
              onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
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