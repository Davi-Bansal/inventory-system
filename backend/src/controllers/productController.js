const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const asyncHandler = require("../utils/asyncHandler");
const QRCode = require("qrcode");
const bwipjs = require("bwip-js");
const { logAudit } = require("../services/auditService");

const listProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", category } = req.query;
  const filter = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    filter.category = category;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter)
  ]);

  res.json({
    data: products,
    meta: { page: Number(page), limit: Number(limit), total }
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  await Inventory.create({ product: product._id, quantity: 0, updatedBy: req.user._id });

  await logAudit({
    action: "product.create",
    entityType: "Product",
    entityId: product._id,
    metadata: { sku: product.sku },
    actor: req.user._id
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isActive = false;
  await product.save();
  res.json({ message: "Product archived" });
});

const getProductQr = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const payload = JSON.stringify({ id: product._id, sku: product.sku, name: product.name, price: product.price });
  const qrDataUrl = await QRCode.toDataURL(payload);
  res.json({ qrDataUrl });
});

const getProductBarcode = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const png = await bwipjs.toBuffer({ bcid: "code128", text: product.sku, scale: 3, height: 10, includetext: true });
  res.set("Content-Type", "image/png");
  res.send(png);
});

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductQr,
  getProductBarcode
};
