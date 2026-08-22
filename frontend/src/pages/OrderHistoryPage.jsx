import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, ArrowRight, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      orderApi
        .getUserOrders()
        .then((res) => {
          if (res?.data) setOrders(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div
      className="container"
      style={{ paddingTop: '24px', paddingBottom: '60px', maxWidth: '840px' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>My Orders & Deliveries</h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Track real-time orders or view past delivery history
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const isCancelled = order.status === 'CANCELLED';
            return (
              <div
                key={order.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                      Order #{order.orderNumber}
                    </span>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], {
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

                {/* Items Thumbnails */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    overflowX: 'auto',
                    padding: '4px 0',
                  }}
                >
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#f8fafc',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        border: '1px solid #f1f5f9',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={item.productImage}
                        alt=""
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>
                        {item.productName.substring(0, 18)}... (x{item.quantity})
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer and Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Total: <strong style={{ color: '#0f172a' }}>₹{order.totalAmount}</strong> (
                    {order.items?.length} items)
                  </div>

                  <Link
                    to={`/track/${order.orderNumber}`}
                    className="btn btn-outline-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Track Live <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          <Package size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '8px' }}>
            No orders placed yet
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
            Your ordered groceries and daily essentials will appear here.
          </p>
          <Link to="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
