const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const asyncHandler = require("../utils/asyncHandler");

const listCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const filter = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const skip = (Number(page) - 1) * Number(limit);

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Customer.countDocuments(filter)
  ]);

  res.json({ data: customers, meta: { page: Number(page), limit: Number(limit), total } });
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(customer);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }
  res.json(customer);
});

const customerHistory = asyncHandler(async (req, res) => {
  const sales = await Sale.find({ customer: req.params.id }).sort({ createdAt: -1 });
  res.json({ data: sales });
});

module.exports = {
  listCustomers,
  createCustomer,
  updateCustomer,
  customerHistory
};
