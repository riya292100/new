import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import wsService from '../services/websocket';
import LiveRadarMap from '../components/LiveRadarMap';
import {
  CheckCircle2, Clock, MapPin, Package, Bike, Phone, MessageSquare,
  ShieldCheck, AlertTriangle, ArrowLeft, RefreshCw, XCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const TIMELINE_STAGES = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Order received by QuickCart' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Verified by fulfillment hub' },
  { key: 'PREPARING', label: 'Preparing', desc: 'Items being picked from dark store' },
  { key: 'PACKED', label: 'Packed & Ready', desc: 'Bag sealed for dispatch' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Rider on the way with your bag' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over at your door' },
];

const OrderTrackingPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { addToast } = useToast();

  const fetchOrder = async () => {
    try {
      const res = await orderApi.trackOrder(orderNumber);
      if (res?.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.warn('Track order failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Polling fallback every 6 seconds
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [orderNumber]);

  // STOMP WebSocket Live Updates
  useEffect(() => {
    if (order?.id) {
      const unsubscribe = wsService.subscribeToOrder(order.id, (updatedOrder) => {
        setOrder(updatedOrder);
        addToast(`Order status updated: ${updatedOrder.status}`, 'info');
      });
      return () => unsubscribe && unsubscribe();
    }
  }, [order?.id, addToast]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      const res = await orderApi.cancelOrder(order.id);
      if (res?.data) {
        setOrder(res.data);
        addToast('Order cancelled successfully', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Could not cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="#059669" style={{ margin: '0 auto 16px' }} />
        <h3>Connecting to live dark store GPS...</h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2>Order #{orderNumber} not found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '16px' }}>
          View My Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const currentStageIndex = isCancelled ? -1 : TIMELINE_STAGES.findIndex((s) => s.key === order.status);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/orders"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Live Order #{order.orderNumber}</h1>
              <span className={`badge ${isCancelled ? 'badge-discount' : 'badge-featured'}`}>
                {order.status}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 15 Mins Delivery
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrder}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Refresh Status
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* Left Column: Live Radar Map & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Live Radar Map Tracker */}
          <LiveRadarMap
            orderStatus={order.status}
            partnerLocation={{ lat: order.partnerLatitude, lng: order.partnerLongitude }}
            customerAddress={order.address}
          />

          {/* 6-Stage Visual Timeline */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '20px' }}>
              Delivery Progress Timeline
            </h3>

            {isCancelled ? (
              <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <XCircle size={22} />
                <div>
                  <strong>Order was cancelled</strong>
                  <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>Inventory restored and any refund initiated.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', paddingLeft: '8px' }}>
                {TIMELINE_STAGES.map((stage, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div key={stage.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative' }}>
                      {/* Circle Indicator */}
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isDone ? '#059669' : '#f1f5f9',
                          color: isDone ? '#ffffff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          flexShrink: 0,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.25)' : 'none',
                          zIndex: 2,
                        }}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: isCurrent ? '800' : '600', color: isCurrent ? '#059669' : isDone ? '#0f172a' : '#94a3b8' }}>
                          {stage.label} {isCurrent && '— in progress'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: isDone ? '#64748b' : '#cbd5e1', marginTop: '2px' }}>
                          {stage.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Delivery Partner & Order Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Delivery Partner Card */}
          {order.deliveryPartnerName && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                Your Express Delivery Hero
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                  }}>
                    <Bike size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#0f172a' }}>{order.deliveryPartnerName}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {order.vehicleNumber || 'Electric Scooter (Eco)'} • ⭐ {order.partnerRating || '4.9'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`tel:${order.deliveryPartnerPhone || '9876543211'}`}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                    }}
                    title="Call Partner"
                  >
                    <Phone size={18} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Destination Address */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={18} color="#059669" /> Delivery Address
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.4' }}>
              <strong>{order.address?.label || 'Home'}</strong>: {order.address?.streetAddress}, {order.address?.city} - {order.address?.pincode}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Contact: {order.customerName} ({order.customerPhone})
            </p>
            {order.deliveryInstructions && (
              <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#475569' }}>
                Note: {order.deliveryInstructions}
              </div>
            )}
          </div>

          {/* Items In Order */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '14px' }}>
              Ordered Items ({order.items?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={item.productImage} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity} • {item.unitQuantity}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>
                Total Paid ({order.paymentMethod})
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#059669' }}>
                ₹{order.totalAmount}
              </span>
            </div>

            {/* Cancel Button */}
            {!isCancelled && order.status !== 'OUT_FOR_DELIVERY' && order.status !== 'DELIVERED' && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="btn btn-danger btn-block btn-sm"
                style={{ marginTop: '16px' }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
