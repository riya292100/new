import React from 'react';
import PropTypes from 'prop-types';
import { Calendar, Clock, Users, MapPin, XCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingCard = ({ booking, onCancelBooking = () => {} }) => {
  if (!booking) return null;

  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div
      className="qc-booking-card"
      style={{
        opacity: isCancelled ? 0.75 : 1,
        borderLeft: isCancelled ? '4px solid #ef4444' : '4px solid #059669',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: '800',
              color: '#059669',
              letterSpacing: '0.05em',
            }}
          >
            #{booking.bookingReference}
          </span>
          <h4 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '4px 0 2px' }}>
            <Link
              to={`/restaurant/${booking.restaurantId}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {booking.restaurantName}
            </Link>
          </h4>
          <p
            style={{
              fontSize: '0.82rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MapPin size={12} /> {booking.restaurantAddress}, {booking.restaurantCity}
          </p>
        </div>

        <span
          className={`badge ${isCancelled ? 'badge-danger' : 'badge-success'}`}
          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
        >
          {booking.status}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          background: '#f8fafc',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '0.82rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
          <Calendar size={14} color="#64748b" />
          <span>{booking.bookingDate}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
          <Clock size={14} color="#64748b" />
          <span>{booking.bookingTime}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
          <Users size={14} color="#64748b" />
          <span>{booking.numberOfGuests} Guests</span>
        </div>
      </div>

      {booking.specialRequest && (
        <p style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
          Special Request: &quot;{booking.specialRequest}&quot;
        </p>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '10px',
        }}
      >
        {booking.restaurantPhone && (
          <a
            href={`tel:${booking.restaurantPhone}`}
            style={{
              fontSize: '0.8rem',
              color: '#059669',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: '600',
            }}
          >
            <Phone size={12} /> {booking.restaurantPhone}
          </a>
        )}

        {!isCancelled && (
          <button
            type="button"
            onClick={() => onCancelBooking(booking.id)}
            className="btn btn-outline btn-sm"
            style={{
              color: '#ef4444',
              borderColor: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: 'auto',
            }}
          >
            <XCircle size={14} /> Cancel Reservation
          </button>
        )}
      </div>
    </div>
  );
};

BookingCard.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.number.isRequired,
    bookingReference: PropTypes.string.isRequired,
    restaurantId: PropTypes.number.isRequired,
    restaurantName: PropTypes.string.isRequired,
    restaurantAddress: PropTypes.string,
    restaurantCity: PropTypes.string,
    restaurantPhone: PropTypes.string,
    bookingDate: PropTypes.string.isRequired,
    bookingTime: PropTypes.string.isRequired,
    numberOfGuests: PropTypes.number.isRequired,
    seatingPreference: PropTypes.string,
    specialRequest: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onCancelBooking: PropTypes.func,
};

export default BookingCard;
