const ApiError = require("../utils/apiError");
const { apiKey } = require("../config");

function requireApiKey(req, res, next) {
  const token = req.header("x-api-key");
  if (!token || token !== apiKey) {
    throw new ApiError(401, "UNAUTHORIZED", "Missing or invalid API key");
  }
  next();
}

module.exports = {
  requireApiKey
};
