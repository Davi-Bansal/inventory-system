const app = require("./app");
const connectDb = require("./config/db");
const env = require("./config/env");

const startServer = async () => {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`Backend server running on port ${env.port}`);
  });
};

startServer();
