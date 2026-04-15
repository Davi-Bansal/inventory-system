const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const { Parser } = require("json2csv");
const asyncHandler = require("../utils/asyncHandler");

const dashboardSummary = asyncHandler(async (req, res) => {
  const period = req.query.period || "daily";
  const now = new Date();

  const range = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    yearly: 365
  }[period] || 1;

  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - range);

  const sales = await Sale.find({ status: "finalized", createdAt: { $gte: fromDate } });
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.finalAmount || 0), 0);
  const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discountAmount || 0), 0);

  const profit = sales.reduce((sum, sale) => {
    const cost = sale.items.reduce((itemSum, item) => itemSum + Number(item.quantity) * Number(item.unitPrice || 0), 0);
    return sum + (Number(sale.finalAmount || 0) - cost);
  }, 0);

  res.json({
    period,
    totalSales,
    totalDiscount,
    profitOrLoss: Number(profit.toFixed(2))
  });
});

const stockReport = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({}).populate("product", "name sku lowStockThreshold");

  const report = inventory.map((entry) => ({
    productName: entry.product?.name,
    sku: entry.product?.sku,
    quantity: entry.quantity,
    status: entry.quantity === 0 ? "out_of_stock" : entry.quantity <= entry.product.lowStockThreshold ? "low_stock" : "available"
  }));

  res.json({ data: report });
});

const movementReport = asyncHandler(async (req, res) => {
  const sales = await Sale.find({ status: "finalized" });
  const movementMap = new Map();

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const prev = movementMap.get(String(item.product)) || { quantity: 0, revenue: 0, name: item.name, sku: item.sku };
      prev.quantity += Number(item.quantity);
      prev.revenue += Number(item.lineTotal);
      movementMap.set(String(item.product), prev);
    });
  });

  const movement = [...movementMap.values()].sort((a, b) => b.quantity - a.quantity);

  res.json({
    fastMoving: movement.slice(0, 10),
    slowMoving: movement.slice(-10).reverse()
  });
});

const exportSalesCsv = asyncHandler(async (req, res) => {
  const sales = await Sale.find({ status: "finalized" }).populate("customer", "name");
  const rows = sales.map((sale) => ({
    invoiceNo: sale.invoiceNo,
    customer: sale.customer?.name || "Walk-in",
    paymentMethod: sale.paymentMethod,
    subtotal: sale.subtotal,
    totalTax: sale.totalTax,
    discountAmount: sale.discountAmount,
    finalAmount: sale.finalAmount,
    createdAt: sale.createdAt
  }));

  const parser = new Parser();
  const csv = parser.parse(rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=sales-report.csv");
  res.send(csv);
});

module.exports = {
  dashboardSummary,
  stockReport,
  movementReport,
  exportSalesCsv
};
