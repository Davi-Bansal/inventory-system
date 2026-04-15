import { useEffect, useState } from "react";
import DataTable from "../components/common/DataTable";
import { fetchStockReport } from "../services/reportService";

const ReportsPage = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchStockReport();
      setRows(data.data || []);
    };

    load();
  }, []);

  return (
    <div className="space-y-4">
      <a
        href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/reports/sales/export.csv`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white"
      >
        Export sales CSV
      </a>

      <DataTable
        columns={[
          { key: "productName", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "quantity", label: "Quantity" },
          { key: "status", label: "Stock status" }
        ]}
        rows={rows}
      />
    </div>
  );
};

export default ReportsPage;
