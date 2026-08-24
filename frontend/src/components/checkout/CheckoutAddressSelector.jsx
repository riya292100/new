import React from 'react';
import PropTypes from 'prop-types';
import { MapPin, Plus, CheckCircle2, Home, Briefcase, Building } from 'lucide-react';

const CheckoutAddressSelector = ({
  addresses = [],
  selectedAddressId = null,
  setSelectedAddressId,
  showNewAddressForm,
  setShowNewAddressForm,
  newAddress,
  setNewAddress,
  onCreateAddress,
}) => {
  const getIconForLabel = (label) => {
    switch (label?.toLowerCase()) {
      case 'work':
      case 'office':
        return <Briefcase size={16} />;
      case 'hotel':
      case 'other':
        return <Building size={16} />;
      default:
        return <Home size={16} />;
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '1.15rem',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <MapPin size={20} color="#059669" /> Select Delivery Location
        </h3>
        <button
          type="button"
          onClick={() => setShowNewAddressForm(!showNewAddressForm)}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      {/* Existing Addresses Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => setSelectedAddressId(addr.id)}
              style={{
                border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                background: isSelected ? '#f0fdf4' : '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                position: 'relative',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    color: '#0f172a',
                  }}
                >
                  {getIconForLabel(addr.label)} {addr.label || 'Home'}
                </span>
                {isSelected && <CheckCircle2 size={18} color="#059669" />}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.4' }}>
                {addr.streetAddress}, {addr.city} - {addr.pincode}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Recipient: {addr.receiverName || 'Me'} ({addr.receiverPhone || ''})
              </div>
            </div>
          );
        })}
      </div>

      {/* New Address Form Modal/Drawer */}
      {showNewAddressForm && (
        <form
          onSubmit={onCreateAddress}
          style={{
            background: '#f8fafc',
            padding: '18px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a' }}>Add New Address</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '2px',
                }}
              >
                Label
              </label>
              <select
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                className="input-control"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '2px',
                }}
              >
                PIN Code
              </label>
              <input
                type="text"
                required
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                className="input-control"
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '2px',
              }}
            >
              Street Address / Flat No.
            </label>
            <input
              type="text"
              required
              value={newAddress.streetAddress}
              onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
              placeholder="Flat 402, Green Valley Apts"
              className="input-control"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '2px',
                }}
              >
                City
              </label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="input-control"
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '2px',
                }}
              >
                Receiver Phone
              </label>
              <input
                type="tel"
                required
                value={newAddress.receiverPhone}
                onChange={(e) => setNewAddress({ ...newAddress, receiverPhone: e.target.value })}
                placeholder="9876543210"
                className="input-control"
              />
            </div>
          </div>

          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}
          >
            <button
              type="button"
              onClick={() => setShowNewAddressForm(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Address
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

CheckoutAddressSelector.propTypes = {
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      label: PropTypes.string,
      receiverName: PropTypes.string,
      receiverPhone: PropTypes.string,
      streetAddress: PropTypes.string,
      apartmentUnit: PropTypes.string,
      landmark: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      pincode: PropTypes.string,
      isDefault: PropTypes.bool,
    })
  ),
  selectedAddressId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  setSelectedAddressId: PropTypes.func.isRequired,
  showNewAddressForm: PropTypes.bool.isRequired,
  setShowNewAddressForm: PropTypes.func.isRequired,
  newAddress: PropTypes.object.isRequired,
  setNewAddress: PropTypes.func.isRequired,
  onCreateAddress: PropTypes.func.isRequired,
};

export default CheckoutAddressSelector;
