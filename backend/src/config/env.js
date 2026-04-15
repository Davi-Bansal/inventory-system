const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ims_db",
  jwtSecret: process.env.JWT_SECRET || "replace-with-strong-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  defaultGstRate: Number(process.env.DEFAULT_GST_RATE || 18),
  invoicePrefix: process.env.INVOICE_PREFIX || "INV",
  invoiceDigits: Number(process.env.INVOICE_DIGITS || 4),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173"
};

module.exports = env;
