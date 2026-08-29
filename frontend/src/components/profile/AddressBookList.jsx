import React from 'react';
import PropTypes from 'prop-types';
import { Home, Briefcase, Building, Trash2 } from 'lucide-react';

const AddressBookList = ({ addresses, onDeleteAddress }) => {
  if (!addresses || addresses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
        <p style={{ fontSize: '0.9rem' }}>
          No saved addresses yet. Add your first delivery address above.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {addresses.map((a) => (
        <div key={a.id} className="qc-address-item-row">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div className="qc-address-icon-box">
              {a.label?.toLowerCase() === 'home' ? (
                <Home size={16} />
              ) : a.label?.toLowerCase() === 'work' ? (
                <Briefcase size={16} />
              ) : (
                <Building size={16} />
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
                {a.label} • {a.receiverName} ({a.receiverPhone})
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                {a.streetAddress}, {a.apartmentUnit ? `${a.apartmentUnit}, ` : ''}
                {a.city} - {a.pincode}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label={`Delete ${a.label} address`}
            onClick={() => onDeleteAddress(a.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

AddressBookList.propTypes = {
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string,
      receiverName: PropTypes.string,
      receiverPhone: PropTypes.string,
      streetAddress: PropTypes.string,
      apartmentUnit: PropTypes.string,
      city: PropTypes.string,
      pincode: PropTypes.string,
    })
  ).isRequired,
  onDeleteAddress: PropTypes.func.isRequired,
};

export default AddressBookList;
