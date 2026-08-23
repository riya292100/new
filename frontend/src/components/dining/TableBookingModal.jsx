import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Calendar, Clock, Users, Utensils, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingApi } from '../../services/bookingApi';
import logger from '../../utils/logger';

const TableBookingModal = ({ restaurant, onClose = () => {}, onBookingSuccess = () => {} }) => {
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [bookingDate, setBookingDate] = useState(
    () => new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bookingTime, setBookingTime] = useState('19:30');
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState('Indoor Dining');
  const [specialRequest, setSpecialRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!restaurant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('LOGIN');
      return;
    }

    setSubmitting(true);
    try {
      const res = await bookingApi.createBooking({
        restaurantId: restaurant.id,
        bookingDate,
        bookingTime,
        numberOfGuests: parseInt(numberOfGuests, 10),
        seatingPreference,
        specialRequest,
      });

      if (res?.data?.data) {
        setConfirmedBooking(res.data.data);
        addToast('Table reservation confirmed!', 'success');
        onBookingSuccess(res.data.data);
      }
    } catch (err) {
      logger.error('TableBookingModal', 'Reservation failed', err);
      const msg =
        err?.response?.data?.message ||
        'Failed to reserve table. Please verify availability and try again.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '24px',
          padding: '28px',
          background: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} color="#64748b" />
        </button>

        {confirmedBooking ? (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <CheckCircle2 size={56} color="#059669" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '8px' }}>
              Reservation Confirmed!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Your table at <strong>{restaurant.name}</strong> is reserved.
            </p>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'left',
                border: '1px solid #e2e8f0',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Booking Reference:</span>
                <strong style={{ color: '#059669', letterSpacing: '0.05em' }}>
                  {confirmedBooking.bookingReference}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Date & Time:</span>
                <strong>
                  {confirmedBooking.bookingDate} at {confirmedBooking.bookingTime}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Guests & Seating:</span>
                <strong>
                  {confirmedBooking.numberOfGuests} Guests ({confirmedBooking.seatingPreference})
                </strong>
              </div>
            </div>

            <button onClick={onClose} className="btn btn-primary btn-block">
              Done
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Utensils size={20} color="#059669" />
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Reserve a Table</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                {restaurant.name} • {restaurant.city}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: '#334155',
                      marginBottom: '6px',
                    }}
                  >
                    <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Date
                  </label>
                  <input
                    type="date"
                    className="input-control"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: '#334155',
                      marginBottom: '6px',
                    }}
                  >
                    <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Time
                  </label>
                  <select
                    className="input-control"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                  >
                    <option value="12:30">12:30 PM (Lunch)</option>
                    <option value="13:30">1:30 PM (Lunch)</option>
                    <option value="18:30">6:30 PM (Dinner)</option>
                    <option value="19:30">7:30 PM (Dinner)</option>
                    <option value="20:30">8:30 PM (Dinner)</option>
                    <option value="21:30">9:30 PM (Late Dinner)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: '#334155',
                      marginBottom: '6px',
                    }}
                  >
                    <Users size={14} style={{ display: 'inline', marginRight: '4px' }} /> Guests
                  </label>
                  <select
                    className="input-control"
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: '#334155',
                      marginBottom: '6px',
                    }}
                  >
                    Seating Area
                  </label>
                  <select
                    className="input-control"
                    value={seatingPreference}
                    onChange={(e) => setSeatingPreference(e.target.value)}
                  >
                    <option value="Indoor Dining">Indoor Dining</option>
                    <option value="Outdoor / Patio">Outdoor / Patio</option>
                    <option value="Window Table">Window View</option>
                    <option value="Bar Seating">Bar Counter</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Special Requests (Optional)
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Birthday anniversary, quiet corner, wheelchair accessible"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting}
                style={{ padding: '14px', fontSize: '0.95rem' }}
              >
                {submitting ? 'Confirming Reservation...' : 'Confirm Table Reservation'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

TableBookingModal.propTypes = {
  restaurant: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func,
  onBookingSuccess: PropTypes.func,
};

export default TableBookingModal;
