const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const { dbPath } = require("../config");

let db;
const migrationsDir = path.join(__dirname, "..", "..", "migrations");

function connect() {
  if (!db) {
    const dirPath = path.dirname(dbPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
  }
  return db;
}

function ensureMigrationsTable(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);
}

function runMigrations() {
  const database = connect();
  ensureMigrationsTable(database);

  if (!fs.existsSync(migrationsDir)) {
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith(".sql"))
    .sort();

  const appliedRows = database.prepare("SELECT version FROM schema_migrations").all();
  const appliedSet = new Set(appliedRows.map(row => row.version));
  const insertMigrationStmt = database.prepare(
    "INSERT INTO schema_migrations (version, applied_at) VALUES (?, datetime('now'))"
  );

  files.forEach(file => {
    if (appliedSet.has(file)) {
      return;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    const apply = database.transaction(() => {
      database.exec(sql);
      insertMigrationStmt.run(file);
    });
    apply();
  });
}

function seedFromFile() {
  const database = connect();
  const filePath = path.join(__dirname, "..", "..", "..", "data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  const stmt = database.prepare("INSERT OR REPLACE INTO verticals (id, payload) VALUES (?, ?)");
  const ids = Object.keys(data.VERTICALS || {});
  const seedTx = database.transaction(() => {
    ids.forEach(id => {
      stmt.run(id, JSON.stringify(data.VERTICALS[id]));
    });
  });
  seedTx();
}

function hasData() {
  const database = connect();
  const row = database.prepare("SELECT COUNT(1) as count FROM verticals").get();
  return row.count > 0;
}

module.exports = {
  connect,
  runMigrations,
  seedFromFile,
  hasData
};
