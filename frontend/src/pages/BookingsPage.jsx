import React, { useState, useEffect } from 'react';
import { CalendarCheck, Utensils, Search, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../services/bookingApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookingCard from '../components/dining/BookingCard';
import logger from '../utils/logger';

const BookingsPage = () => {
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UPCOMING, CANCELLED
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      if (res?.data?.data) {
        setBookings(res.data.data);
      }
    } catch (err) {
      logger.error('BookingsPage', 'Failed to fetch bookings', err);
      addToast('Failed to load table reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await bookingApi.cancelBooking(bookingId);
      if (res?.data?.data) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
        );
        addToast('Table reservation cancelled successfully', 'info');
      }
    } catch (err) {
      logger.error('BookingsPage', 'Failed to cancel reservation', err);
      const msg = err?.response?.data?.message || 'Failed to cancel booking';
      addToast(msg, 'error');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'CANCELLED'
          ? b.status === 'CANCELLED'
          : b.status === 'CONFIRMED';

    const matchesSearch =
      searchQuery === ''
        ? true
        : b.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.restaurantCity && b.restaurantCity.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <CalendarCheck size={48} color="#059669" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '8px' }}>
          Sign In to View Table Bookings
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          Track and manage your restaurant reservations globally.
        </p>
        <button onClick={() => openAuthModal('LOGIN')} className="btn btn-primary">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ paddingTop: '24px', paddingBottom: '60px', maxWidth: '840px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: '800' }}>
            My Table Reservations
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
            Manage upcoming dining bookings, cancel reservations, or get restaurant details.
          </p>
        </div>

        <Link
          to="/dining"
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
        >
          <Utensils size={14} /> Explore Dining
        </Link>
      </div>

      {/* Search & Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '12px' }}
          />
          <input
            type="text"
            className="input-control"
            placeholder="Search by restaurant or ref (e.g. QC-DINE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'UPCOMING', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn btn-sm"
              style={{
                background: activeTab === tab ? '#059669' : '#f1f5f9',
                color: activeTab === tab ? '#ffffff' : '#475569',
                border: 'none',
                fontWeight: '700',
              }}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          <p>Loading your reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '48px 20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <CalendarCheck size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '6px' }}>
            No reservations found
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
            You don&apos;t have any table reservations matching your current filter.
          </p>
          <Link
            to="/dining"
            className="btn btn-outline-primary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredBookings.map((b) => (
            <BookingCard key={b.id} booking={b} onCancelBooking={handleCancelBooking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
