const autocannon = require("autocannon");

const targetUrl = process.env.PERF_URL || "http://localhost:4000/api/v1/health";
const duration = process.env.PERF_DURATION ? Number(process.env.PERF_DURATION) : 10;
const connections = process.env.PERF_CONNECTIONS ? Number(process.env.PERF_CONNECTIONS) : 50;

const instance = autocannon({
  url: targetUrl,
  duration,
  connections
});

autocannon.track(instance, { renderProgressBar: true });

instance.on("done", result => {
  const summary = {
    latencyMsAvg: result.latency.average,
    reqPerSecAvg: result.requests.average,
    throughputBytesPerSecAvg: result.throughput.average,
    non2xx: result.non2xx || 0
  };
  process.stdout.write(`\nPerf Summary: ${JSON.stringify(summary, null, 2)}\n`);
});
