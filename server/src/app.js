const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./logger");
const routes = require("./routes");
const requestContext = require("./middlewares/requestContext");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const { recordRequest } = require("./monitoring/metrics");
const { corsOrigins } = require("./config");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("CORS_ORIGIN_NOT_ALLOWED"));
      }
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(requestContext);
  app.use(pinoHttp({ logger }));

  app.use((req, res, next) => {
    res.on("finish", () => {
      recordRequest(res.statusCode);
    });
    next();
  });

  app.use("/api/v1", routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
