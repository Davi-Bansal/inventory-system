const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

const ensureInventoryDoc = async (productId) => {
  let doc = await Inventory.findOne({ product: productId });
  if (!doc) {
    doc = await Inventory.create({ product: productId, quantity: 0 });
  }
  return doc;
};

const changeStock = async ({ productId, quantityChange, movementType, reason, referenceModel, referenceId, userId }) => {
  await Product.findById(productId).orFail(() => new Error("Product not found"));
  const inventory = await ensureInventoryDoc(productId);

  const nextQty = Number(inventory.quantity) + Number(quantityChange);
  if (nextQty < 0) {
    throw new Error("Insufficient stock");
  }

  inventory.quantity = nextQty;
  inventory.updatedBy = userId;
  await inventory.save();

  await StockMovement.create({
    product: productId,
    movementType,
    quantityChange,
    reason,
    referenceModel,
    referenceId,
    performedBy: userId
  });

  return inventory;
};

module.exports = {
  changeStock
};
