const PDFDocument = require("pdfkit");
const jwt = require("jsonwebtoken");
const Sale = require("../models/Sale");
const asyncHandler = require("../utils/asyncHandler");
const { createSale, finalizeSale } = require("../services/saleService");
const { logAudit } = require("../services/auditService");
const env = require("../config/env");

const listSales = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .populate("customer", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Sale.countDocuments(filter)
  ]);
  res.json({ data: sales, meta: { page: Number(page), limit: Number(limit), total } });
});

const createSaleTransaction = asyncHandler(async (req, res) => {
  const sale = await createSale({
    customerId: req.body.customerId,
    items: req.body.items,
    discountAmount: Number(req.body.discountAmount || 0),
    paymentMethod: req.body.paymentMethod,
    userId: req.user._id
  });
  await logAudit({
    action: "sale.create",
    entityType: "Sale",
    entityId: sale._id,
    metadata: { invoiceNo: sale.invoiceNo },
    actor: req.user._id
  });
  res.status(201).json(sale);
});

const finalizeSaleTransaction = asyncHandler(async (req, res) => {
  const sale = await finalizeSale({ saleId: req.params.id, userId: req.user._id });
  await logAudit({
    action: "sale.finalize",
    entityType: "Sale",
    entityId: sale._id,
    metadata: { invoiceNo: sale.invoiceNo },
    actor: req.user._id
  });
  res.json(sale);
});

// FIXED: was already in the controller but route was likely missing
const cancelDraftSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }
  if (sale.status !== "draft") {
    res.status(400);
    throw new Error("Only draft sales can be cancelled");
  }
  sale.status = "cancelled";
  await sale.save();
  await logAudit({
    action: "sale.cancel",
    entityType: "Sale",
    entityId: sale._id,
    metadata: { invoiceNo: sale.invoiceNo },
    actor: req.user._id
  });
  res.json(sale);
});

// FIXED: supports both Bearer token (from middleware) and ?token= query param
// so that <a href> PDF downloads work from the browser
const downloadInvoicePdf = asyncHandler(async (req, res) => {
  // Allow token via query string for direct browser download links
  let userId = req.user?._id;
  if (!userId && req.query.token) {
    try {
      const decoded = jwt.verify(req.query.token, env.jwtSecret);
      userId = decoded.id;
    } catch {
      res.status(401);
      throw new Error("Invalid token");
    }
  }

  const sale = await Sale.findById(req.params.id).populate("customer", "name phone email address");
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${sale.invoiceNo}.pdf`
  );

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  // Header
  doc.fontSize(20).font("Helvetica-Bold").text("RETAIL SHOP INVOICE", { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Invoice meta
  doc.fontSize(11).font("Helvetica");
  doc.text(`Invoice No: ${sale.invoiceNo}`);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString("en-IN")}`);
  doc.text(`Payment Method: ${sale.paymentMethod}`);
  doc.text(`Status: ${sale.status}`);

  if (sale.customer) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("Customer:");
    doc.font("Helvetica");
    doc.text(`  Name: ${sale.customer.name}`);
    if (sale.customer.phone) doc.text(`  Phone: ${sale.customer.phone}`);
    if (sale.customer.email) doc.text(`  Email: ${sale.customer.email}`);
  }

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Items table header
  doc.font("Helvetica-Bold");
  doc.text("Item", 50, doc.y, { width: 200, continued: false });
  const headerY = doc.y - 15;
  doc.text("SKU", 255, headerY, { width: 100 });
  doc.text("Qty", 355, headerY, { width: 60 });
  doc.text("Rate", 415, headerY, { width: 80 });
  doc.text("Total", 495, headerY, { width: 80 });

  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.3);

  // Items
  doc.font("Helvetica");
  sale.items.forEach((item) => {
    const y = doc.y;
    doc.text(item.name, 50, y, { width: 200 });
    doc.text(item.sku || "-", 255, y, { width: 100 });
    doc.text(String(item.quantity), 355, y, { width: 60 });
    doc.text(`₹${Number(item.unitPrice).toFixed(2)}`, 415, y, { width: 80 });
    doc.text(`₹${Number(item.lineTotal).toFixed(2)}`, 495, y, { width: 80 });
    doc.moveDown(0.3);
  });

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Totals
  const totalsX = 380;
  doc.text("Subtotal:", totalsX, doc.y, { continued: false });
  doc.text(`₹${Number(sale.subtotal).toFixed(2)}`, 480, doc.y - 15);
  doc.text("GST:", totalsX);
  doc.text(`₹${Number(sale.totalTax).toFixed(2)}`, 480, doc.y - 15);
  doc.text("Discount:", totalsX);
  doc.text(`₹${Number(sale.discountAmount).toFixed(2)}`, 480, doc.y - 15);

  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fontSize(13);
  doc.text("Final Amount:", totalsX, doc.y, { continued: false });
  doc.text(`₹${Number(sale.finalAmount).toFixed(2)}`, 480, doc.y - 16);

  doc.moveDown(2);
  doc.fontSize(9).font("Helvetica").fillColor("gray").text("Thank you for your business!", { align: "center" });

  doc.end();
});

module.exports = {
  listSales,
  createSaleTransaction,
  finalizeSaleTransaction,
  cancelDraftSale,
  downloadInvoicePdf
};