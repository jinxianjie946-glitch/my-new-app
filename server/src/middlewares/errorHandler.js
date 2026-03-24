const logger = require("../logger");

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
}

function errorHandler(err, req, res, next) {
  const isCorsError = err.message === "CORS_ORIGIN_NOT_ALLOWED";
  const statusCode = isCorsError ? 403 : err.statusCode || 500;
  const payload = {
    success: false,
    error: {
      code: isCorsError ? "CORS_FORBIDDEN" : err.code || "INTERNAL_SERVER_ERROR",
      message: isCorsError ? "Origin not allowed by CORS policy" : err.message || "Unexpected server error"
    }
  };
  if (err.details) {
    payload.error.details = err.details;
  }
  logger.error({ err, requestId: req.id }, "Unhandled error");
  res.status(statusCode).json(payload);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
