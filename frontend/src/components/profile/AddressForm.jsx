import React from 'react';
import PropTypes from 'prop-types';

const AddressForm = ({ addressData, onChange, onSubmit, onCancel, submitting }) => {
  return (
    <form onSubmit={onSubmit} className="qc-address-form-container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <select
          value={addressData.label}
          onChange={(e) => onChange('label', e.target.value)}
          className="input-control"
        >
          <option value="Home">Home</option>
          <option value="Work">Work</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          required
          placeholder="Receiver Name"
          value={addressData.receiverName}
          onChange={(e) => onChange('receiverName', e.target.value)}
          className="input-control"
        />
        <input
          type="tel"
          required
          placeholder="Receiver Phone"
          value={addressData.receiverPhone}
          onChange={(e) => onChange('receiverPhone', e.target.value.replace(/\D/g, ''))}
          className="input-control"
        />
      </div>

      <input
        type="text"
        required
        placeholder="Street Address, Building Name"
        value={addressData.streetAddress}
        onChange={(e) => onChange('streetAddress', e.target.value)}
        className="input-control"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <input
          type="text"
          placeholder="Apartment/Flat"
          value={addressData.apartmentUnit}
          onChange={(e) => onChange('apartmentUnit', e.target.value)}
          className="input-control"
        />
        <input
          type="text"
          placeholder="City"
          value={addressData.city}
          onChange={(e) => onChange('city', e.target.value)}
          className="input-control"
        />
        <input
          type="text"
          placeholder="Pincode"
          value={addressData.pincode}
          onChange={(e) => onChange('pincode', e.target.value)}
          className="input-control"
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
          {submitting ? 'Saving...' : 'Save Address'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
};

AddressForm.propTypes = {
  addressData: PropTypes.shape({
    label: PropTypes.string,
    receiverName: PropTypes.string,
    receiverPhone: PropTypes.string,
    streetAddress: PropTypes.string,
    apartmentUnit: PropTypes.string,
    city: PropTypes.string,
    pincode: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
};

export default AddressForm;
