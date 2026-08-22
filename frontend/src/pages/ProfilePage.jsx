import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addressApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Building,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
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

  const fetchAddresses = () => {
    addressApi
      .getAddresses()
      .then((res) => {
        if (res?.data) setAddresses(res.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressApi.createAddress(newAddr);
      addToast('Address added to your address book', 'success');
      setShowAddForm(false);
      fetchAddresses();
    } catch (err) {
      addToast(err.message || 'Failed to add address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressApi.deleteAddress(id);
      addToast('Address deleted', 'info');
      fetchAddresses();
    } catch (err) {
      addToast(err.message || 'Failed to delete address', 'error');
    }
  };

  return (
    <div
      className="container"
      style={{ paddingTop: '24px', paddingBottom: '60px', maxWidth: '800px' }}
    >
      <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '24px' }}>
        My Profile & Addresses
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* User Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              fontSize: '1.6rem',
              fontWeight: 'bold',
            }}
          >
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
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
            }}
          >
            <h3
              style={{
                fontSize: '1.2rem',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <MapPin size={20} color="#059669" /> Saved Addresses ({addresses.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-outline-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={16} /> Add Address
            </button>
          </div>

          {/* Inline Add Address Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddAddress}
              style={{
                background: '#f8fafc',
                padding: '18px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <select
                  value={newAddr.label}
                  onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
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
                  value={newAddr.receiverName}
                  onChange={(e) => setNewAddr({ ...newAddr, receiverName: e.target.value })}
                  className="input-control"
                />
                <input
                  type="tel"
                  required
                  placeholder="Receiver Phone"
                  value={newAddr.receiverPhone}
                  onChange={(e) =>
                    setNewAddr({ ...newAddr, receiverPhone: e.target.value.replace(/\D/g, '') })
                  }
                  className="input-control"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Street Address, Building Name"
                value={newAddr.streetAddress}
                onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                className="input-control"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Apartment/Flat"
                  value={newAddr.apartmentUnit}
                  onChange={(e) => setNewAddr({ ...newAddr, apartmentUnit: e.target.value })}
                  className="input-control"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="input-control"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  className="input-control"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {addresses.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#059669',
                      flexShrink: 0,
                    }}
                  >
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
                  onClick={() => handleDeleteAddress(a.id)}
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
