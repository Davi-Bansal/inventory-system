import { useEffect, useState } from "react";
import MovementChart from "../components/charts/MovementChart";
import StatCard from "../components/common/StatCard";
import { fetchDashboardSummary, fetchMovementReport } from "../services/reportService";
import { currency } from "../utils/format";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [movement, setMovement] = useState({ fastMoving: [] });

  useEffect(() => {
    const load = async () => {
      const [summaryData, movementData] = await Promise.all([
        fetchDashboardSummary("daily"),
        fetchMovementReport()
      ]);
      setSummary(summaryData);
      setMovement(movementData);
    };

    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Sales" value={currency(summary?.totalSales)} subtitle="Current period" />
        <StatCard title="Total Discounts" value={currency(summary?.totalDiscount)} subtitle="All finalized sales" />
        <StatCard title="Profit / Loss" value={currency(summary?.profitOrLoss)} subtitle="Computed projection" />
      </div>
      <MovementChart data={movement.fastMoving || []} />
    </div>
  );
};

export default DashboardPage;
