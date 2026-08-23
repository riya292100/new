import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { addressApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Navigation, Check, X, Plus, Home, Briefcase, Building } from 'lucide-react';

const LocationModal = () => {
  const {
    selectedLocation,
    locationModalOpen,
    setLocationModalOpen,
    updateLocation,
    detectGPSLocation,
  } = useLocation();
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingGps, setLoadingGps] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  useEffect(() => {
    if (locationModalOpen && user) {
      addressApi
        .getAddresses()
        .then((res) => {
          if (res?.data) setSavedAddresses(res.data);
        })
        .catch((err) => { console.error('Failed to search locations:', err); });
    }
  }, [locationModalOpen, user]);

  if (!locationModalOpen) return null;

  const handleGpsDetect = async () => {
    setLoadingGps(true);
    await detectGPSLocation();
    setLoadingGps(false);
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;

    const code = pincodeInput.trim();
    // Simulate serviceability check
    if (
      code.length === 6 &&
      (code.startsWith('11') ||
        code.startsWith('12') ||
        code.startsWith('40') ||
        code.startsWith('56') ||
        code.startsWith('70') ||
        code.startsWith('60'))
    ) {
      setPincodeStatus({
        serviceable: true,
        message: '🎉 Superfast 12-min delivery is available in your area!',
      });
      updateLocation({
        ...selectedLocation,
        pincode: code,
        city: code.startsWith('11')
          ? 'New Delhi'
          : code.startsWith('12')
            ? 'Gurugram'
            : code.startsWith('40')
              ? 'Mumbai'
              : 'Bengaluru',
        streetAddress: `Area Pincode ${code}`,
      });
    } else {
      setPincodeStatus({
        serviceable: false,
        message: 'Sorry, we currently deliver to select metros (Delhi-NCR, Mumbai, Bengaluru).',
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setLocationModalOpen(false)}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '500px',
          borderRadius: '24px',
          padding: '28px',
          background: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Select Delivery Location</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              We deliver instant groceries in 10–30 minutes
            </p>
          </div>
          <button
            onClick={() => setLocationModalOpen(false)}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* GPS Auto Detect */}
        <button
          onClick={handleGpsDetect}
          disabled={loadingGps}
          className="btn btn-primary btn-block"
          style={{
            marginBottom: '20px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Navigation size={18} />
          {loadingGps ? 'Detecting exact GPS coordinates...' : 'Use Current Live GPS Location'}
        </button>

        {/* Pincode Quick Search */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Check Pincode Serviceability
          </div>
          <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              maxLength={6}
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit pincode (e.g. 110001)"
              className="input-control"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-outline" style={{ padding: '0 20px' }}>
              Check
            </button>
          </form>
          {pincodeStatus && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: pincodeStatus.serviceable ? '#059669' : '#ef4444',
              }}
            >
              {pincodeStatus.message}
            </div>
          )}
        </div>

        {/* Saved Addresses List */}
        {savedAddresses.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Saved Addresses
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              {savedAddresses.map((addr) => {
                const isCurrent =
                  selectedLocation?.id === addr.id ||
                  selectedLocation?.streetAddress === addr.streetAddress;
                return (
                  <div
                    key={addr.id}
                    onClick={() => updateLocation(addr)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isCurrent ? '2px solid #059669' : '1px solid #e2e8f0',
                      background: isCurrent ? '#ecfdf5' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#059669',
                        flexShrink: 0,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {addr.label?.toLowerCase() === 'home' ? (
                        <Home size={18} />
                      ) : addr.label?.toLowerCase() === 'work' ? (
                        <Briefcase size={18} />
                      ) : (
                        <Building size={18} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>
                          {addr.label}
                        </span>
                        {isCurrent && <Check size={16} color="#059669" />}
                      </div>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: '#64748b',
                          marginTop: '2px',
                          lineHeight: '1.3',
                        }}
                      >
                        {addr.streetAddress}, {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
