const startedAt = Date.now();

const metrics = {
  requestsTotal: 0,
  errorsTotal: 0,
  byStatus: {}
};

function recordRequest(statusCode) {
  metrics.requestsTotal += 1;
  const key = String(statusCode);
  metrics.byStatus[key] = (metrics.byStatus[key] || 0) + 1;
  if (statusCode >= 500) {
    metrics.errorsTotal += 1;
  }
}

function snapshot() {
  return {
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    requestsTotal: metrics.requestsTotal,
    errorsTotal: metrics.errorsTotal,
    byStatus: metrics.byStatus
  };
}

module.exports = {
  recordRequest,
  snapshot
};
