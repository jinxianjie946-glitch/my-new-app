const path = require("path");

const nodeEnv = process.env.NODE_ENV || "development";
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "..", "data", "app.db");
const apiKey = process.env.API_KEY;
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:8080,http://localhost:5173,http://localhost:3000")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
const metricsRateLimitPerMin = process.env.METRICS_RATE_LIMIT_PER_MIN
  ? Number(process.env.METRICS_RATE_LIMIT_PER_MIN)
  : 60;

module.exports = {
  nodeEnv,
  port,
  dbPath,
  apiKey,
  corsOrigins,
  metricsRateLimitPerMin
};
