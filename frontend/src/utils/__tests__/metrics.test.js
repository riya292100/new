import { describe, it, expect, beforeEach } from 'vitest';
import { recordMetric, getMetrics, clearMetrics, getClientHealth } from '../metrics';

describe('Client Metrics & Health Suite', () => {
  beforeEach(() => {
    clearMetrics();
  });

  it('records metrics with tags and timestamps', () => {
    const metric = recordMetric('api_latency_ms', 142, { endpoint: '/api/products' });
    expect(metric.name).toBe('api_latency_ms');
    expect(metric.value).toBe(142);
    expect(metric.tags.endpoint).toBe('/api/products');
    expect(getMetrics().length).toBe(1);
  });

  it('clears metrics correctly', () => {
    recordMetric('page_render_time', 45);
    expect(getMetrics().length).toBe(1);
    clearMetrics();
    expect(getMetrics().length).toBe(0);
  });

  it('returns client health status', () => {
    const health = getClientHealth();
    expect(health.status).toBe('UP');
    expect(health.service).toBe('quickcart-frontend-pwa');
    expect(health.online).toBe(true);
  });
});
