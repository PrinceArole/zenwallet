const MAX_ENDPOINTS = 100;
const MAX_LATENCY_SAMPLES = 1000;

function createRequestMetrics() {
  const startedAt = Date.now();
  const endpoints = new Map();
  const latencies = [];
  const statusCodes = {};
  let requestCount = 0;
  let clientErrorCount = 0;
  let serverErrorCount = 0;

  function middleware(req, res, next) {
    if (!req.path.startsWith('/api/')) return next();

    const started = process.hrtime.bigint();
    let endpoint;
    const originalEnd = res.end;

    res.end = function end(...args) {
      if (!endpoint) {
        endpoint = req.route
          ? `${req.baseUrl || ''}${req.route.path}`
          : `${req.baseUrl || ''}/<unmatched>`;
      }
      return originalEnd.apply(this, args);
    };

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      if (endpoint === '/api/admin/metrics') return;

      requestCount += 1;
      statusCodes[res.statusCode] = (statusCodes[res.statusCode] || 0) + 1;
      if (res.statusCode >= 500) serverErrorCount += 1;
      else if (res.statusCode >= 400) clientErrorCount += 1;

      if (!endpoints.has(endpoint) && endpoints.size >= MAX_ENDPOINTS) {
        endpoints.delete(endpoints.keys().next().value);
      }

      const endpointMetrics = endpoints.get(endpoint) || { requests: 0, errors: 0, totalDurationMs: 0 };
      endpointMetrics.requests += 1;
      if (res.statusCode >= 400) endpointMetrics.errors += 1;
      endpointMetrics.totalDurationMs += durationMs;
      endpoints.set(endpoint, endpointMetrics);

      latencies.push(durationMs);
      if (latencies.length > MAX_LATENCY_SAMPLES) latencies.shift();
    });

    next();
  }

  function getSnapshot() {
    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const percentileIndex = sortedLatencies.length
      ? Math.ceil(sortedLatencies.length * 0.95) - 1
      : 0;

    return {
      startedAt: new Date(startedAt).toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      requests: {
        total: requestCount,
        clientErrors: clientErrorCount,
        serverErrors: serverErrorCount,
        statusCodes: { ...statusCodes },
        averageLatencyMs: latencies.length
          ? Number((latencies.reduce((total, latency) => total + latency, 0) / latencies.length).toFixed(2))
          : 0,
        p95LatencyMs: Number((sortedLatencies[percentileIndex] || 0).toFixed(2)),
        latencySampleSize: latencies.length,
      },
      endpoints: [...endpoints.entries()]
        .map(([path, metrics]) => ({
          path,
          requests: metrics.requests,
          errors: metrics.errors,
          averageLatencyMs: Number((metrics.totalDurationMs / metrics.requests).toFixed(2)),
        }))
        .sort((first, second) => second.requests - first.requests)
        .slice(0, 20),
    };
  }

  return { middleware, getSnapshot };
}

module.exports = { createRequestMetrics };
