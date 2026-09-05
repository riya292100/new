import { describe, it, expect } from 'vitest';
import { server, mockCatalogCategories, mockCatalogProducts } from '../mockServer';

describe('MSW Mock Server Suite', () => {
  it('intercepts /api/categories and returns catalog categories', async () => {
    const res = await fetch('http://localhost:8080/api/categories');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(mockCatalogCategories.length);
    expect(data[0].slug).toBe('fruits-vegetables');
  });

  it('intercepts /api/categories/:slug and returns specific category', async () => {
    const res = await fetch('http://localhost:8080/api/categories/fruits-vegetables');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.slug).toBe('fruits-vegetables');
    expect(data.name).toBe('Fruits & Vegetables');
  });

  it('intercepts /api/products and returns paginated products', async () => {
    const res = await fetch('http://localhost:8080/api/products?size=50');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBeDefined();
    expect(data.content.length).toBe(mockCatalogProducts.length);
    expect(data.content[0].name).toBe('Organic Cavendish Bananas');
  });

  it('intercepts /api/products/search with query param', async () => {
    const res = await fetch('http://localhost:8080/api/products/search?query=bananas');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].brand).toBe('FarmFresh');
  });

  it('intercepts /api/products/deals and returns promotional items', async () => {
    const res = await fetch('http://localhost:8080/api/products/deals');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.every((p) => p.isDeal)).toBe(true);
  });

  it('intercepts /api/v1/dining/restaurants and returns restaurant discovery list', async () => {
    const res = await fetch('http://localhost:8080/api/v1/dining/restaurants');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('SUCCESS');
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('intercepts admin dashboard statistics', async () => {
    const res = await fetch('http://localhost:8080/api/admin/dashboard/stats');
    expect(res.status).toBe(200);
    const stats = await res.json();
    expect(stats.totalOrders).toBe(1482);
    expect(stats.totalRevenue).toBe(439200);
  });
});
