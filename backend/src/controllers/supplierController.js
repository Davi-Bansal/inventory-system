const Supplier = require("../models/Supplier");
const Purchase = require("../models/Purchase");
const asyncHandler = require("../utils/asyncHandler");

const listSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
  res.json({ data: suppliers });
});

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json(supplier);
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  res.json(supplier);
});

const supplierHistory = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({ supplier: req.params.id }).sort({ createdAt: -1 });
  res.json({ data: purchases });
});

module.exports = {
  listSuppliers,
  createSupplier,
  updateSupplier,
  supplierHistory
};
