const express = require("express");
const verticalsRoutes = require("./verticalsRoutes");
const { snapshot } = require("../monitoring/metrics");
const { requireApiKey } = require("../middlewares/auth");
const { metricsRateLimit } = require("../middlewares/metricsRateLimit");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      requestId: req.id
    }
  });
});

router.get("/metrics", requireApiKey, metricsRateLimit, (req, res) => {
  res.json({
    success: true,
    data: snapshot()
  });
});

router.use("/verticals", verticalsRoutes);

module.exports = router;
