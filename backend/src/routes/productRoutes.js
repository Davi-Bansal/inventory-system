const express = require("express");
const {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductQr,
  getProductBarcode
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const { productValidator } = require("../middleware/validators");
const { ROLES } = require("../utils/permissions");

const router = express.Router();

router.use(protect);
router.get("/", listProducts);
router.get("/:id/qr", getProductQr);
router.get("/:id/barcode", getProductBarcode);
router.post("/", authorizeRoles(ROLES.ADMIN), productValidator, validateRequest, createProduct);
router.put("/:id", authorizeRoles(ROLES.ADMIN), productValidator, validateRequest, updateProduct);
router.delete("/:id", authorizeRoles(ROLES.ADMIN), deleteProduct);

module.exports = router;
