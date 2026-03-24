const { connect } = require("../db");

function getAll() {
  const db = connect();
  const rows = db.prepare("SELECT id, payload FROM verticals").all();
  return rows.map(r => ({ id: r.id, payload: JSON.parse(r.payload) }));
}

function getById(id) {
  const db = connect();
  const row = db.prepare("SELECT id, payload FROM verticals WHERE id = ?").get(id);
  if (!row) return null;
  return { id: row.id, payload: JSON.parse(row.payload) };
}

function updatePayload(id, payload) {
  const db = connect();
  const stmt = db.prepare("INSERT OR REPLACE INTO verticals (id, payload) VALUES (?, ?)");
  stmt.run(id, JSON.stringify(payload));
  return getById(id);
}

function updateHomePartial(id, homePatch) {
  const db = connect();
  const selectStmt = db.prepare("SELECT id, payload FROM verticals WHERE id = ?");
  const updateStmt = db.prepare("UPDATE verticals SET payload = ? WHERE id = ?");

  const tx = db.transaction((verticalId, patch) => {
    const row = selectStmt.get(verticalId);
    if (!row) {
      return null;
    }
    const parsed = JSON.parse(row.payload);
    const nextPayload = {
      ...parsed,
      home: {
        ...(parsed.home || {}),
        ...patch
      }
    };
    updateStmt.run(JSON.stringify(nextPayload), verticalId);
    return { id: row.id, payload: nextPayload };
  });

  return tx(id, homePatch);
}

module.exports = {
  getAll,
  getById,
  updatePayload,
  updateHomePartial
};
