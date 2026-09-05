/**
 * Client-side Observability & Metrics Collector
 * Captures Core Web Vitals, API request latencies, and client health probes.
 */

const metricsStore = [];
const MAX_METRICS_STORE = 100;

export const recordMetric = (name, value, tags = {}) => {
  const metric = {
    name,
    value,
    tags,
    timestamp: new Date().toISOString(),
  };

  metricsStore.push(metric);
  if (metricsStore.length > MAX_METRICS_STORE) {
    metricsStore.shift();
  }

  return metric;
};

export const getMetrics = () => [...metricsStore];

export const clearMetrics = () => {
  metricsStore.length = 0;
};

export const getClientHealth = () => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  return {
    status: isOnline ? 'UP' : 'DEGRADED',
    service: 'quickcart-frontend-pwa',
    timestamp: new Date().toISOString(),
    online: isOnline,
    metricsRecorded: metricsStore.length,
    environment: typeof window !== 'undefined' ? 'browser' : 'test',
  };
};

export default {
  recordMetric,
  getMetrics,
  clearMetrics,
  getClientHealth,
};
