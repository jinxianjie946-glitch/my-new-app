process.env.API_KEY = "test-key";

const { errorHandler } = require("../src/middlewares/errorHandler");
const requestContext = require("../src/middlewares/requestContext");
const { recordRequest, snapshot } = require("../src/monitoring/metrics");
const ApiError = require("../src/utils/apiError");
const { requireApiKey } = require("../src/middlewares/auth");
const { createMetricsRateLimit } = require("../src/middlewares/metricsRateLimit");

describe("middlewares and monitoring", () => {
  it("requestContext injects request id header", () => {
    const req = {};
    const setHeader = jest.fn();
    const res = { setHeader };
    const next = jest.fn();

    requestContext(req, res, next);

    expect(req.id).toBeTruthy();
    expect(setHeader).toHaveBeenCalledWith("x-request-id", req.id);
    expect(next).toHaveBeenCalled();
  });

  it("errorHandler handles ApiError with details", () => {
    const err = new ApiError(400, "INVALID_PAYLOAD", "invalid payload", "bad field");
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    errorHandler(err, { id: "r1" }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "INVALID_PAYLOAD",
        message: "invalid payload",
        details: "bad field"
      }
    });
  });

  it("errorHandler handles generic error with default status", () => {
    const err = new Error("boom");
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    errorHandler(err, { id: "r2" }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "boom"
      }
    });
  });

  it("errorHandler handles cors forbidden error", () => {
    const err = new Error("CORS_ORIGIN_NOT_ALLOWED");
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    errorHandler(err, { id: "r3" }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "CORS_FORBIDDEN",
        message: "Origin not allowed by CORS policy"
      }
    });
  });

  it("metrics counts 5xx as errors", () => {
    const before = snapshot();
    recordRequest(200);
    recordRequest(500);
    const after = snapshot();
    expect(after.requestsTotal).toBe(before.requestsTotal + 2);
    expect(after.errorsTotal).toBe(before.errorsTotal + 1);
    expect(after.byStatus["200"]).toBeGreaterThanOrEqual(1);
    expect(after.byStatus["500"]).toBeGreaterThanOrEqual(1);
  });

  it("requireApiKey accepts correct token", () => {
    const req = {
      header: jest.fn().mockReturnValue("test-key")
    };
    const next = jest.fn();

    requireApiKey(req, {}, next);
    expect(next).toHaveBeenCalled();
  });

  it("requireApiKey rejects invalid token", () => {
    const req = {
      header: jest.fn().mockReturnValue("bad-key")
    };
    const call = () => requireApiKey(req, {}, jest.fn());
    expect(call).toThrow("Missing or invalid API key");
  });

  it("metricsRateLimit rejects burst requests", () => {
    const rateLimit = createMetricsRateLimit(2);
    const req = { ip: "127.0.0.1" };
    const next = jest.fn();

    rateLimit(req, {}, next);
    rateLimit(req, {}, next);
    const thirdCall = () => rateLimit(req, {}, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(thirdCall).toThrow("Too many requests for metrics endpoint");
  });
});
