import { useEffect, useState } from "react";
import DataTable from "../components/common/DataTable";
import StatCard from "../components/common/StatCard";
import { fetchStockReport, fetchDashboardSummary } from "../services/reportService";
import { currency } from "../utils/format";

const PERIODS = ["daily", "weekly", "monthly", "yearly"];
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ReportsPage = () => {
  const [rows, setRows] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [stockData, summaryData] = await Promise.all([
        fetchStockReport(),
        fetchDashboardSummary(period)
      ]);
      setRows(stockData.data || []);
      setSummary(summaryData);
    };
    load();
  }, [period]);

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
              period === p
                ? "bg-brand-600 text-white"
                : "border border-brand-100 bg-white text-slate-700 hover:bg-brand-50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Sales"
          value={currency(summary?.totalSales)}
          subtitle={`${period} period`}
        />
        <StatCard
          title="Total Discounts"
          value={currency(summary?.totalDiscount)}
          subtitle={`${period} period`}
        />
        <StatCard
          title="Profit / Loss"
          value={currency(summary?.profitOrLoss)}
          subtitle={`${period} period`}
          valueClass={summary?.profitOrLoss >= 0 ? "text-teal-700" : "text-red-600"}
        />
      </div>

      {/* Export + stock table */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Current stock report</h3>
        <a
          href={`${API_BASE}/reports/sales/export.csv`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Export sales CSV
        </a>
      </div>

      <DataTable
        columns={[
          { key: "productName", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "quantity", label: "Quantity" },
          {
            key: "status",
            label: "Stock status",
            render: (row) => {
              const map = {
                out_of_stock: "bg-red-100 text-red-700",
                low_stock: "bg-amber-100 text-amber-700",
                available: "bg-teal-100 text-teal-700"
              };
              return (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[row.status] || ""}`}>
                  {row.status?.replace("_", " ")}
                </span>
              );
            }
          }
        ]}
        rows={rows}
      />
    </div>
  );
};

export default ReportsPage;