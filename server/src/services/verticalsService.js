const repo = require("../repositories/verticalsRepository");

function listVerticals() {
  return repo.getAll().map(v => ({ id: v.id, name: v.id }));
}

function getVertical(id) {
  return repo.getById(id);
}

function getHome(id) {
  const v = repo.getById(id);
  if (!v) return null;
  return v.payload.home || null;
}

function getIndustry(id) {
  const v = repo.getById(id);
  if (!v) return null;
  return v.payload.industry || null;
}

function getConsumer(id) {
  const v = repo.getById(id);
  if (!v) return null;
  return v.payload.consumer || null;
}

function updateHome(id, homePatch) {
  return repo.updateHomePartial(id, homePatch);
}

module.exports = {
  listVerticals,
  getVertical,
  getHome,
  getIndustry,
  getConsumer,
  updateHome
};
