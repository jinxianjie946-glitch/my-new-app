const ApiError = require("../utils/apiError");
const { metricsRateLimitPerMin } = require("../config");

function createMetricsRateLimit(maxPerMinute = metricsRateLimitPerMin) {
  const records = new Map();

  return function metricsRateLimit(req, res, next) {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const windowStart = now - 60000;
    const current = records.get(key) || [];
    const recent = current.filter(ts => ts > windowStart);

    if (recent.length >= maxPerMinute) {
      throw new ApiError(429, "RATE_LIMITED", "Too many requests for metrics endpoint");
    }

    recent.push(now);
    records.set(key, recent);
    next();
  };
}

const metricsRateLimit = createMetricsRateLimit();

module.exports = {
  createMetricsRateLimit,
  metricsRateLimit
};
