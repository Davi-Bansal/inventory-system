const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const { Parser } = require("json2csv");
const asyncHandler = require("../utils/asyncHandler");

// FIXED: period now handles "yearly" properly and profit uses costPrice, not unitPrice
const dashboardSummary = asyncHandler(async (req, res) => {
  const period = req.query.period || "daily";
  const now = new Date();

  let fromDate;
  if (period === "daily") {
    fromDate = new Date(now);
    fromDate.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    fromDate = new Date(now);
    fromDate.setDate(now.getDate() - 7);
  } else if (period === "monthly") {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "yearly") {
    fromDate = new Date(now.getFullYear(), 0, 1);
  } else {
    fromDate = new Date(now);
    fromDate.setHours(0, 0, 0, 0);
  }

  const sales = await Sale.find({ status: "finalized", createdAt: { $gte: fromDate } });

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.finalAmount || 0), 0);
  const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discountAmount || 0), 0);

  // FIXED: use item.costPrice for accurate profit calculation
  // We need to fetch costPrice from Product for items in finalized sales
  let profitOrLoss = 0;
  for (const sale of sales) {
    const revenue = Number(sale.finalAmount || 0);
    let cost = 0;
    for (const item of sale.items) {
      // saleItem stores unitPrice (selling price). Fetch costPrice from product.
      const product = await Product.findById(item.product).select("costPrice").lean();
      const costPrice = product ? Number(product.costPrice || 0) : 0;
      cost += costPrice * Number(item.quantity);
    }
    profitOrLoss += revenue - cost;
  }

  res.json({
    period,
    totalSales: Number(totalSales.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    profitOrLoss: Number(profitOrLoss.toFixed(2))
  });
});

const stockReport = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({}).populate("product", "name sku lowStockThreshold");
  const report = inventory.map((entry) => ({
    productName: entry.product?.name,
    sku: entry.product?.sku,
    quantity: entry.quantity,
    status:
      entry.quantity === 0
        ? "out_of_stock"
        : entry.quantity <= entry.product.lowStockThreshold
        ? "low_stock"
        : "available"
  }));
  res.json({ data: report });
});

const movementReport = asyncHandler(async (req, res) => {
  const sales = await Sale.find({ status: "finalized" });
  const movementMap = new Map();

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const prev = movementMap.get(String(item.product)) || {
        quantity: 0,
        revenue: 0,
        name: item.name,
        sku: item.sku
      };
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

module.exports = { dashboardSummary, stockReport, movementReport, exportSalesCsv };