import React from 'react';
import PropTypes from 'prop-types';

const RestaurantGallery = ({ imageUrl, name, galleryImages = [] }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '28px',
      }}
    >
      <div style={{ height: '360px', position: 'relative' }}>
        <img
          src={imageUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {galleryImages && galleryImages.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateRows: '1fr 1fr',
            gap: '16px',
            height: '360px',
          }}
        >
          {galleryImages.slice(0, 2).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '16px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

RestaurantGallery.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  galleryImages: PropTypes.arrayOf(PropTypes.string),
};

export default RestaurantGallery;
