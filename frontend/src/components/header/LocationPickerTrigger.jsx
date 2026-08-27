import React from 'react';
import PropTypes from 'prop-types';
import { MapPin, ChevronDown } from 'lucide-react';

const LocationPickerTrigger = ({ selectedLocation, onOpenModal }) => {
  return (
    <div
      onClick={onOpenModal}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        padding: '6px 12px',
        borderRadius: '10px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        maxWidth: '220px',
        transition: 'background 0.15s',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenModal();
        }
      }}
    >
      <MapPin size={16} color="#059669" style={{ flexShrink: 0 }} />
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
          }}
        >
          Delivery in 15 mins
        </div>
        <div
          style={{
            fontSize: '0.84rem',
            fontWeight: '600',
            color: '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {selectedLocation?.streetAddress
            ? `${selectedLocation.label}: ${selectedLocation.streetAddress}`
            : 'Select Location'}
        </div>
      </div>
      <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
    </div>
  );
};

LocationPickerTrigger.propTypes = {
  selectedLocation: PropTypes.shape({
    label: PropTypes.string,
    streetAddress: PropTypes.string,
  }),
  onOpenModal: PropTypes.func.isRequired,
};

export default LocationPickerTrigger;
