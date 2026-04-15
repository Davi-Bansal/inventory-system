const express = require("express");
const {
  listSales,
  createSaleTransaction,
  finalizeSaleTransaction,
  cancelDraftSale,
  downloadInvoicePdf
} = require("../controllers/salesController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { saleValidator } = require("../middleware/validators");
const { authorizePermissions } = require("../middleware/authorize");

const router = express.Router();

router.use(protect);
router.get("/", authorizePermissions("sales.read"), listSales);
router.post("/", authorizePermissions("sales.create"), saleValidator, validateRequest, createSaleTransaction);
router.post("/:id/finalize", authorizePermissions("sales.create"), finalizeSaleTransaction);
router.post("/:id/cancel", authorizePermissions("sales.create"), cancelDraftSale);
router.get("/:id/invoice", authorizePermissions("sales.invoice"), downloadInvoicePdf);

module.exports = router;
