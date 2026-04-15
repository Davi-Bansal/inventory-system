const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { changeStock } = require("../services/inventoryService");

const listPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({})
    .populate("supplier", "name phone")
    .sort({ createdAt: -1 });
  res.json({ data: purchases });
});

const createPurchase = asyncHandler(async (req, res) => {
  const { supplierId, items, notes } = req.body;

  if (!items || !items.length) {
    res.status(400);
    throw new Error("At least one purchase item is required");
  }

  const normalizedItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const lineTotal = Number(item.quantity) * Number(item.unitCost);
    normalizedItems.push({
      product: product._id,
      quantity: Number(item.quantity),
      unitCost: Number(item.unitCost),
      lineTotal
    });

    totalAmount += lineTotal;
  }

  const purchase = await Purchase.create({
    supplier: supplierId,
    items: normalizedItems,
    totalAmount,
    notes: notes || "",
    createdBy: req.user._id
  });

  for (const item of normalizedItems) {
    await changeStock({
      productId: item.product,
      quantityChange: Number(item.quantity),
      movementType: "purchase",
      reason: "Purchase received",
      referenceModel: "Purchase",
      referenceId: purchase._id,
      userId: req.user._id
    });
  }

  res.status(201).json(purchase);
});

module.exports = {
  listPurchases,
  createPurchase
};
