const express = require("express");
const { dashboardSummary, stockReport, movementReport, exportSalesCsv } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/dashboard", dashboardSummary);
router.get("/stock", stockReport);
router.get("/movement", movementReport);
router.get("/sales/export.csv", exportSalesCsv);

module.exports = router;
