import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { addressApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { validateSchema, addressSchema, sanitizeInput } from '../utils/validation';
import logger from '../utils/logger';
import AddressForm from '../components/profile/AddressForm';
import AddressBookList from '../components/profile/AddressBookList';
import { MapPin, Plus, Mail, Phone } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    receiverName: user?.fullName || '',
    receiverPhone: user?.phone || '',
    streetAddress: '',
    apartmentUnit: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    isDefault: false,
  });

  const fetchAddresses = useCallback(() => {
    setLoadError(null);
    addressApi
      .getAddresses()
      .then((res) => {
        if (res?.data) setAddresses(res.data);
      })
      .catch((err) => {
        logger.error('ProfilePage', 'Failed to fetch addresses', err);
        setLoadError('Failed to load saved addresses. Please try again.');
      });
  }, []);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user, fetchAddresses]);

  const handleFieldChange = (field, value) => {
    setNewAddr((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    const valResult = validateSchema(addressSchema, newAddr);
    if (!valResult.isValid) {
      addToast(Object.values(valResult.errors)[0], 'error');
      return;
    }

    setSubmitting(true);
    try {
      await addressApi.createAddress({
        ...newAddr,
        receiverName: sanitizeInput(newAddr.receiverName),
        streetAddress: sanitizeInput(newAddr.streetAddress),
        city: sanitizeInput(newAddr.city),
        apartmentUnit: sanitizeInput(newAddr.apartmentUnit),
      });
      addToast('Address added to your address book', 'success');
      setShowAddForm(false);
      fetchAddresses();
    } catch (err) {
      logger.error('ProfilePage', 'Failed to create address', err);
      addToast(err.message || 'Failed to add address', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressApi.deleteAddress(id);
      addToast('Address deleted', 'info');
      fetchAddresses();
    } catch (err) {
      logger.error('ProfilePage', 'Failed to delete address', err);
      addToast(err.message || 'Failed to delete address', 'error');
    }
  };

  return (
    <div
      className="container"
      style={{ paddingTop: '24px', paddingBottom: '60px', maxWidth: '800px' }}
    >
      <h1
        style={{
          fontSize: '1.75rem',
          color: 'var(--color-text-main, #0f172a)',
          marginBottom: '24px',
        }}
      >
        My Profile & Addresses
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* User Profile Card */}
        <div className="qc-profile-card">
          <div className="qc-avatar-circle">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              user?.fullName?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a' }}>{user?.fullName}</h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '0.85rem',
                color: '#64748b',
                marginTop: '4px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} /> {user?.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={14} /> {user?.phone}
              </span>
              <span className="badge badge-featured">{user?.roles?.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Address Book Card */}
        <div className="qc-card">
          <div className="qc-card-header">
            <h3 className="qc-card-title">
              <MapPin size={20} color="#059669" /> Saved Addresses ({addresses.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-outline-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={16} /> {showAddForm ? 'Close Form' : 'Add Address'}
            </button>
          </div>

          {loadError && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              {loadError}
            </div>
          )}

          {/* Form */}
          {showAddForm && (
            <AddressForm
              addressData={newAddr}
              onChange={handleFieldChange}
              onSubmit={handleAddAddress}
              onCancel={() => setShowAddForm(false)}
              submitting={submitting}
            />
          )}

          {/* Address List */}
          <AddressBookList addresses={addresses} onDeleteAddress={handleDeleteAddress} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
