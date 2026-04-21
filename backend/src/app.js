const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const env = require("./config/env");

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: env.clientUrl || "*",
    credentials: true
  })
);

// ✅ Security & middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ✅ Rate limiting
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500
  })
);

// ✅ Health check (IMPORTANT for Render)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ Routes
app.use("/api/v1", routes);

// ✅ Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;