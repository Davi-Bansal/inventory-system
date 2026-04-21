const app = require("./app");
const connectDb = require("./config/db");
const env = require("./config/env");

const startServer = async () => {
  try {
    await connectDb();

    // ✅ IMPORTANT FIX
    const PORT = process.env.PORT || env.port || 5000;

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();