import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import logger from '../utils/logger';
import { Package, Search, ChevronRight, RotateCcw } from 'lucide-react';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { user } = useAuth();
  const { addToCart, setCartDrawerOpen } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    if (user) {
      orderApi
        .getUserOrders()
        .then((res) => {
          if (res?.data) setOrders(res.data);
        })
        .catch((err) => {
          logger.error('OrderHistoryPage', 'Failed to fetch order history', err);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleReorder = async (order) => {
    if (!order.items || order.items.length === 0) return;
    try {
      for (const item of order.items) {
        await addToCart(
          {
            id: item.productId,
            name: item.productName,
            price: item.unitPrice,
            imageUrl: item.productImage,
          },
          item.quantity
        );
      }
      addToast(`Reordered ${order.items.length} items from #${order.orderNumber}`, 'success');
      setCartDrawerOpen(true);
    } catch (err) {
      addToast('Failed to reorder some items', 'error');
      logger.error('OrderHistoryPage', 'Reorder failed', err);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchQuery ||
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items?.some((i) => i.productName?.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchesStatus = !['DELIVERED', 'CANCELLED'].includes(order.status);
      } else if (statusFilter === 'DELIVERED') {
        matchesStatus = order.status === 'DELIVERED';
      } else if (statusFilter === 'CANCELLED') {
        matchesStatus = order.status === 'CANCELLED';
      }

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div
      className="container"
      style={{ paddingTop: '24px', paddingBottom: '60px', maxWidth: '840px' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>My Orders & Deliveries</h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Track real-time orders, search items, or reorder past deliveries
        </p>
      </div>

      {/* Filter and Search Controls */}
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
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '12px' }}
          />
          <input
            type="text"
            className="input-control"
            placeholder="Search orders or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className="btn btn-sm"
              style={{
                background: statusFilter === tab ? '#059669' : '#f1f5f9',
                color: statusFilter === tab ? '#ffffff' : '#475569',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const isCancelled = order.status === 'CANCELLED';
            return (
              <div key={order.id} className="qc-order-card">
                {/* Header */}
                <div className="qc-order-header">
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
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Total: <strong style={{ color: '#0f172a' }}>₹{order.totalAmount}</strong> (
                    {order.items?.length} items)
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleReorder(order)}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={14} /> Reorder
                    </button>
                    <Link
                      to={`/track/${order.orderNumber}`}
                      className="btn btn-outline-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Track Live <ChevronRight size={16} />
                    </Link>
                  </div>
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
            No orders match your criteria
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
            Try resetting your search query or filter settings.
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Groceries
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
