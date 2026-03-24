const request = require("supertest");
const fs = require("fs");
const path = require("path");

process.env.DB_PATH = path.join(__dirname, "tmp", "test.db");
process.env.API_KEY = "test-key";

const { runMigrations, connect, seedFromFile } = require("../src/db");
const createApp = require("../src/app");

describe("Sintech Backend API", () => {
  let app;

  beforeAll(() => {
    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    runMigrations();
    const db = connect();
    db.exec("DELETE FROM verticals");
    seedFromFile();
    app = createApp();
  });

  it("GET /api/v1/health returns ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });

  it("GET /api/v1/verticals returns list", async () => {
    const res = await request(app).get("/api/v1/verticals");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/health with disallowed origin returns 403", async () => {
    const res = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://evil.example.com");
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CORS_FORBIDDEN");
  });

  it("GET /api/v1/verticals/:id returns one vertical", async () => {
    const res = await request(app).get("/api/v1/verticals/smartphones");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("smartphones");
    expect(res.body.data.payload).toHaveProperty("home");
  });

  it("GET /api/v1/verticals/:id/home returns home section", async () => {
    const res = await request(app).get("/api/v1/verticals/smartphones/home");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("marketSize");
  });

  it("GET /api/v1/verticals/:id/industry returns industry section", async () => {
    const res = await request(app).get("/api/v1/verticals/smartphones/industry");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("shares");
  });

  it("GET /api/v1/verticals/:id/consumer returns consumer section", async () => {
    const res = await request(app).get("/api/v1/verticals/smartphones/consumer");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("users");
  });

  it("PATCH /api/v1/verticals/:id/home updates section", async () => {
    const patchRes = await request(app)
      .patch("/api/v1/verticals/smartphones/home")
      .set("x-api-key", "test-key")
      .send({ marketSize: "$700B" });
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.payload.home.marketSize).toBe("$700B");

    const readRes = await request(app).get("/api/v1/verticals/smartphones/home");
    expect(readRes.body.data.marketSize).toBe("$700B");
  });

  it("GET /api/v1/verticals/:id for missing id returns 404", async () => {
    const res = await request(app).get("/api/v1/verticals/not-exist");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VERTICAL_NOT_FOUND");
  });

  it("GET /api/v1/verticals/:id/home for missing id returns 404", async () => {
    const res = await request(app).get("/api/v1/verticals/not-exist/home");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("HOME_NOT_FOUND");
  });

  it("GET /api/v1/verticals/:id/industry for missing id returns 404", async () => {
    const res = await request(app).get("/api/v1/verticals/not-exist/industry");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INDUSTRY_NOT_FOUND");
  });

  it("GET /api/v1/verticals/:id/consumer for missing id returns 404", async () => {
    const res = await request(app).get("/api/v1/verticals/not-exist/consumer");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CONSUMER_NOT_FOUND");
  });

  it("PATCH /api/v1/verticals/:id/home with invalid field returns 400", async () => {
    const res = await request(app)
      .patch("/api/v1/verticals/smartphones/home")
      .set("x-api-key", "test-key")
      .send({ unknownField: "x" });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_PAYLOAD");
  });

  it("PATCH /api/v1/verticals/:id/home with invalid type returns 400", async () => {
    const res = await request(app)
      .patch("/api/v1/verticals/smartphones/home")
      .set("x-api-key", "test-key")
      .send({ marketChange: "11.2" });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_PAYLOAD");
  });

  it("PATCH /api/v1/verticals/:id/home with empty payload returns 400", async () => {
    const res = await request(app)
      .patch("/api/v1/verticals/smartphones/home")
      .set("x-api-key", "test-key")
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_PAYLOAD");
  });

  it("PATCH /api/v1/verticals/:id/home without api key returns 401", async () => {
    const res = await request(app)
      .patch("/api/v1/verticals/smartphones/home")
      .send({ marketSize: "$710B" });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("GET unknown route returns 404", async () => {
    const res = await request(app).get("/api/v1/unknown-route");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("GET /api/v1/metrics returns counters", async () => {
    const res = await request(app)
      .get("/api/v1/metrics")
      .set("x-api-key", "test-key");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("requestsTotal");
  });

  it("GET /api/v1/metrics without api key returns 401", async () => {
    const res = await request(app).get("/api/v1/metrics");
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
