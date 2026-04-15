const PDFDocument = require("pdfkit");
const Sale = require("../models/Sale");
const asyncHandler = require("../utils/asyncHandler");
const { createSale, finalizeSale } = require("../services/saleService");
const { logAudit } = require("../services/auditService");

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

  res.json(sale);
});

const downloadInvoicePdf = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate("customer", "name phone email address");
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${sale.invoiceNo}.pdf`);

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(18).text("Retail Shop Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice: ${sale.invoiceNo}`);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`);
  doc.text(`Payment Method: ${sale.paymentMethod}`);

  if (sale.customer) {
    doc.moveDown(0.5);
    doc.text(`Customer: ${sale.customer.name}`);
    doc.text(`Phone: ${sale.customer.phone || "-"}`);
  }

  doc.moveDown();
  doc.text("Items", { underline: true });
  sale.items.forEach((item) => {
    doc.text(`${item.name} (${item.sku}) x ${item.quantity} = ${item.lineTotal.toFixed(2)}`);
  });

  doc.moveDown();
  doc.text(`Subtotal: ${sale.subtotal.toFixed(2)}`);
  doc.text(`GST: ${sale.totalTax.toFixed(2)}`);
  doc.text(`Discount: ${sale.discountAmount.toFixed(2)}`);
  doc.fontSize(13).text(`Final Amount: ${sale.finalAmount.toFixed(2)}`, { underline: true });

  doc.end();
});

module.exports = {
  listSales,
  createSaleTransaction,
  finalizeSaleTransaction,
  cancelDraftSale,
  downloadInvoicePdf
};
