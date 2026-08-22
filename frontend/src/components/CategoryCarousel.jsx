import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCarousel = ({ categories = [] }) => {
  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Shop By Category</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Explore handpicked groceries & daily necessities</p>
        </div>
        <Link
          to="/category/all"
          style={{
            fontSize: '0.88rem',
            fontWeight: '700',
            color: '#059669',
            textDecoration: 'none',
          }}
        >
          View All ➔
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '14px',
        }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="hover-elevate"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '12px 8px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                overflow: 'hidden',
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
              }}
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#0f172a',
                lineHeight: '1.2',
                textAlign: 'center',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '28px',
              }}
            >
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
