const ApiError = require("../utils/apiError");
const service = require("../services/verticalsService");
const { validateHomePatch } = require("../validators/homePatchValidator");

function listVerticals(req, res) {
  const data = service.listVerticals();
  res.json({ success: true, data });
}

function getVertical(req, res) {
  const { id } = req.params;
  const data = service.getVertical(id);
  if (!data) {
    throw new ApiError(404, "VERTICAL_NOT_FOUND", `Vertical not found: ${id}`);
  }
  res.json({ success: true, data });
}

function getVerticalHome(req, res) {
  const { id } = req.params;
  const data = service.getHome(id);
  if (!data) {
    throw new ApiError(404, "HOME_NOT_FOUND", `Home section not found for: ${id}`);
  }
  res.json({ success: true, data });
}

function getVerticalIndustry(req, res) {
  const { id } = req.params;
  const data = service.getIndustry(id);
  if (!data) {
    throw new ApiError(404, "INDUSTRY_NOT_FOUND", `Industry section not found for: ${id}`);
  }
  res.json({ success: true, data });
}

function getVerticalConsumer(req, res) {
  const { id } = req.params;
  const data = service.getConsumer(id);
  if (!data) {
    throw new ApiError(404, "CONSUMER_NOT_FOUND", `Consumer section not found for: ${id}`);
  }
  res.json({ success: true, data });
}

function patchVerticalHome(req, res) {
  const { id } = req.params;
  const payload = req.body;
  const validation = validateHomePatch(payload);
  if (!validation.valid) {
    throw new ApiError(400, "INVALID_PAYLOAD", "Home patch payload is invalid", validation.details);
  }
  const data = service.updateHome(id, payload);
  if (!data) {
    throw new ApiError(404, "VERTICAL_NOT_FOUND", `Vertical not found: ${id}`);
  }
  res.json({ success: true, data });
}

module.exports = {
  listVerticals,
  getVertical,
  getVerticalHome,
  getVerticalIndustry,
  getVerticalConsumer,
  patchVerticalHome
};
