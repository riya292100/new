/**
 * Hermetic MSW Mock Server for Vitest Test Suite
 * Intercepts catalogApi and restaurantApi HTTP requests to guarantee zero-network test execution.
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { FALLBACK_RESTAURANTS } from '../utils/demoConfig.js';

export const mockCatalogCategories = [
  {
    id: 1,
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    description: 'Fresh organic produce and farm greens',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf',
    isActive: true,
  },
  {
    id: 2,
    name: 'Dairy & Breakfast',
    slug: 'dairy-breakfast',
    description: 'Fresh milk, bread, butter and farm eggs',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150',
    isActive: true,
  },
];

export const mockCatalogProducts = [
  {
    id: 101,
    name: 'Organic Cavendish Bananas',
    slug: 'organic-cavendish-bananas',
    brand: 'FarmFresh',
    categoryId: 1,
    categorySlug: 'fruits-vegetables',
    sellingPrice: 48,
    mrp: 60,
    discountPercentage: 20,
    unitQuantity: '500 g',
    stockQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
    description: 'Sweet and ripe organic bananas',
    inStock: true,
    isFeatured: true,
    isDeal: true,
    rating: 4.8,
    ratingCount: 120,
  },
  {
    id: 102,
    name: 'Farm Fresh Whole Milk',
    slug: 'farm-fresh-whole-milk',
    brand: 'Amul',
    categoryId: 2,
    categorySlug: 'dairy-breakfast',
    sellingPrice: 32,
    mrp: 35,
    discountPercentage: 8,
    unitQuantity: '500 ml',
    stockQuantity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    description: 'Pasteurized whole milk rich in calcium',
    inStock: true,
    isFeatured: true,
    isDeal: false,
    rating: 4.9,
    ratingCount: 210,
  },
];

export const handlers = [
  // Categories
  http.get('*/api/categories', () => {
    return HttpResponse.json(mockCatalogCategories);
  }),

  http.get('*/api/categories/:slug', ({ params }) => {
    const found = mockCatalogCategories.find((c) => c.slug === params.slug);
    if (found) {
      return HttpResponse.json(found);
    }
    return HttpResponse.json(
      { id: 99, name: String(params.slug).replace('-', ' '), slug: params.slug },
      { status: 200 }
    );
  }),

  // Products
  http.get('*/api/products', ({ request }) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const filtered = categoryId
      ? mockCatalogProducts.filter((p) => String(p.categoryId) === String(categoryId))
      : mockCatalogProducts;

    return HttpResponse.json({
      content: filtered,
      totalElements: filtered.length,
      totalPages: 1,
      size: 50,
      number: 0,
    });
  }),

  http.get('*/api/products/search', ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get('query') || '').toLowerCase();
    const results = mockCatalogProducts.filter(
      (p) => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query)
    );
    return HttpResponse.json(results);
  }),

  http.get('*/api/products/deals', () => {
    const deals = mockCatalogProducts.filter((p) => p.isDeal);
    return HttpResponse.json(deals);
  }),

  http.get('*/api/products/featured', () => {
    const featured = mockCatalogProducts.filter((p) => p.isFeatured);
    return HttpResponse.json(featured);
  }),

  // Dining / Restaurants
  http.get('*/api/v1/dining/restaurants', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase();
    const cuisine = url.searchParams.get('cuisine')?.toLowerCase();
    let list = FALLBACK_RESTAURANTS;
    if (query) {
      list = list.filter((r) => r.name.toLowerCase().includes(query));
    }
    if (cuisine) {
      list = list.filter((r) => r.cuisine.toLowerCase() === cuisine);
    }
    return HttpResponse.json({
      data: list,
      status: 'SUCCESS',
    });
  }),

  http.get('*/api/v1/dining/restaurants/:id', ({ params }) => {
    const item = FALLBACK_RESTAURANTS.find((r) => String(r.id) === String(params.id)) || {
      id: params.id,
      name: 'Sample Restaurant',
      cuisine: 'Italian',
      priceLevel: '$$',
    };
    return HttpResponse.json({ data: item });
  }),

  http.get('*/api/v1/dining/restaurants/:id/reviews', () => {
    return HttpResponse.json({
      data: [{ id: 1, rating: 5, comment: 'Exceptional service and quick dispatch!' }],
    });
  }),

  // Admin Endpoints
  http.get('*/api/admin/dashboard/stats', () => {
    return HttpResponse.json({
      totalOrders: 1482,
      totalRevenue: 439200,
      activeCouriers: 18,
      lowStockCount: 3,
      deliveredToday: 164,
      averageDeliveryTimeMinutes: 11.4,
      activeCustomers: 890,
    });
  }),

  http.get('*/api/admin/coupons', () => {
    return HttpResponse.json([
      { id: 1, code: 'WELCOME50', discountValue: 50, active: true },
      { id: 2, code: 'QUICK100', discountValue: 100, active: true },
    ]);
  }),
];

export const server = setupServer(...handlers);
