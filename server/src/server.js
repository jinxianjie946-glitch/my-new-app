const createApp = require("./app");
const logger = require("./logger");
const { port, apiKey } = require("./config");
const { runMigrations, hasData, seedFromFile } = require("./db");

function bootstrap() {
  if (!apiKey) {
    throw new Error("API_KEY is required");
  }
  runMigrations();
  if (!hasData()) {
    seedFromFile();
  }
  const app = createApp();
  app.listen(port, () => {
    logger.info({ port }, "Sintech backend started");
  });
}

bootstrap();
