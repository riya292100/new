import React from 'react';
import PropTypes from 'prop-types';
import { Clock, Phone, Globe } from 'lucide-react';

const RestaurantInfoCards = ({ openingHours, phone, website }) => {
  return (
    <div
      style={{
        background: '#f8fafc',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          <Clock size={14} /> Opening Hours
        </div>
        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>
          {openingHours || '11:00 AM - 11:00 PM Daily'}
        </p>
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          <Phone size={14} /> Telephone
        </div>
        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>
          {phone || '+1 800-555-DINE'}
        </p>
      </div>

      {website && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            <Globe size={14} /> Official Site
          </div>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.9rem',
              color: '#059669',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Visit Website
          </a>
        </div>
      )}
    </div>
  );
};

RestaurantInfoCards.propTypes = {
  openingHours: PropTypes.string,
  phone: PropTypes.string,
  website: PropTypes.string,
};

export default RestaurantInfoCards;
