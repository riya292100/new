import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { deliveryApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import logger from '../utils/logger';
import {
  Bike,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Clock,
  Package,
  Navigation,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';

const DeliveryPartnerPortal = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDriverData = async () => {
    try {
      const [profRes, ordersRes] = await Promise.all([
        deliveryApi.getProfile(),
        deliveryApi.getAssignedOrders(),
      ]);
      if (profRes?.data) setProfile(profRes.data);
      if (ordersRes?.data) setAssignedOrders(ordersRes.data);
    } catch (err) {
      logger.warn('DeliveryPartnerPortal', 'Driver fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
    const interval = setInterval(fetchDriverData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setActionLoading(true);
    try {
      await deliveryApi.acceptOrder(orderId);
      addToast('Order accepted! Proceed to Dark Store for pickup.', 'success');
      fetchDriverData();
    } catch (err) {
      addToast(err.message || 'Failed to accept order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm('Reject this delivery assignment?')) return;
    setActionLoading(true);
    try {
      await deliveryApi.rejectOrder(orderId);
      addToast('Order rejected', 'info');
      fetchDriverData();
    } catch (err) {
      addToast(err.message || 'Failed to reject order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await deliveryApi.updateStatus(orderId, newStatus);
      addToast(`Delivery status updated to: ${newStatus}`, 'success');
      fetchDriverData();
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981',
              }}
            />
            <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Delivery Partner Portal</h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Welcome back,{' '}
            <strong>{profile?.user?.fullName || user?.fullName || 'Express Rider'}</strong> •{' '}
            {profile?.vehicleType || 'Electric Scooter'}
          </p>
        </div>

        <button
          onClick={fetchDriverData}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Refresh Live Feed
        </button>
      </div>

      {/* Driver Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            Total Deliveries
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
            {profile?.totalDeliveries || 142}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600' }}>
            ⚡ 100% on-time rate
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            Partner Rating
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b', margin: '4px 0' }}>
            ⭐ {profile?.rating || '4.9'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Top Tier Express Driver</div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            Vehicle & License
          </div>
          <div
            style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px' }}
          >
            {profile?.vehicleNumber || 'DL-01-QC-8821'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {profile?.vehicleType || 'HERO_ELECTRIC_NYX'}
          </div>
        </div>
      </div>

      {/* Assigned Orders Feed */}
      <div>
        <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '16px' }}>
          Active & Assigned Deliveries ({assignedOrders.length})
        </h3>

        {loading ? (
          <div className="skeleton" style={{ height: '200px', borderRadius: '20px' }} />
        ) : assignedOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {assignedOrders.map((order) => {
              const isDelivered = order.status === 'DELIVERED';
              const isCancelled = order.status === 'CANCELLED';
              return (
                <div
                  key={order.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Order Banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                        Order #{order.orderNumber}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Estimated Delivery:{' '}
                        {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <span
                      className={`badge ${isDelivered ? 'badge-featured' : isCancelled ? 'badge-discount' : 'badge-deal'}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Customer Info & Destination */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '16px',
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Customer Details
                      </div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {order.customerName}
                      </div>
                      <a
                        href={`tel:${order.customerPhone}`}
                        style={{
                          fontSize: '0.85rem',
                          color: '#059669',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '4px',
                        }}
                      >
                        <Phone size={14} /> {order.customerPhone}
                      </a>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Delivery Destination
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                        <MapPin
                          size={14}
                          color="#059669"
                          style={{ display: 'inline', marginRight: '4px' }}
                        />
                        {order.address?.streetAddress}, {order.address?.city} -{' '}
                        {order.address?.pincode}
                      </div>
                      {order.deliveryInstructions && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: '#d97706',
                            marginTop: '4px',
                            fontWeight: '600',
                          }}
                        >
                          Instructions: "{order.deliveryInstructions}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
                    Items ({order.items?.length}):{' '}
                    <strong>
                      {order.items?.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </strong>{' '}
                    • Total: <strong style={{ color: '#059669' }}>₹{order.totalAmount}</strong> (
                    {order.paymentMethod})
                  </div>

                  {/* Driver Action Workflow Buttons */}
                  {!isDelivered && !isCancelled && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {order.status === 'ORDER_PLACED' || order.status === 'CONFIRMED' ? (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            disabled={actionLoading}
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                          >
                            <CheckCircle2 size={18} /> Accept Delivery
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            disabled={actionLoading}
                            className="btn btn-danger"
                          >
                            <XCircle size={18} /> Reject
                          </button>
                        </>
                      ) : order.status === 'PREPARING' ? (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PACKED')}
                          disabled={actionLoading}
                          className="btn btn-primary btn-block"
                        >
                          <Package size={18} /> Mark Bag Packed & Ready at Store
                        </button>
                      ) : order.status === 'PACKED' ? (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                          disabled={actionLoading}
                          className="btn btn-accent btn-block"
                          style={{ fontWeight: '800' }}
                        >
                          <Bike size={18} /> Pick Up & Start "Out for Delivery"
                        </button>
                      ) : order.status === 'OUT_FOR_DELIVERY' ? (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          disabled={actionLoading}
                          className="btn btn-primary btn-block btn-lg"
                          style={{ fontWeight: '800' }}
                        >
                          <CheckCircle2 size={22} /> Confirm Delivered to Customer
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
            }}
          >
            <Bike size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '6px' }}>
              No active deliveries assigned
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              New orders placed in your delivery radius will pop up here instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPartnerPortal;
