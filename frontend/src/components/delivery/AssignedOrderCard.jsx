import React from 'react';
import PropTypes from 'prop-types';
import { Bike, CheckCircle2, XCircle, MapPin, Phone, Package } from 'lucide-react';

const AssignedOrderCard = ({
  order,
  actionLoading = false,
  onAcceptOrder,
  onRejectOrder,
  onUpdateOrderStatus,
}) => {
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div data-testid={`assigned-order-${order.id}`} className="qc-order-card">
      {/* Order Banner */}
      <div className="qc-order-header">
        <div>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
            Order #{order.orderNumber}
          </span>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Estimated Delivery:{' '}
            {order.estimatedDeliveryTime
              ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '10–15 Mins'}
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
          <div style={{ fontWeight: '700', color: '#0f172a' }}>{order.customerName}</div>
          {order.customerPhone && (
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
          )}
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
            <MapPin size={14} color="#059669" style={{ display: 'inline', marginRight: '4px' }} />
            {order.address?.streetAddress || 'Address not specified'}, {order.address?.city || ''}{' '}
            {order.address?.pincode ? `- ${order.address.pincode}` : ''}
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
        Items ({order.items?.length || 0}):{' '}
        <strong>
          {order.items?.map((i) => `${i.productName} (x${i.quantity})`).join(', ') ||
            'Standard items'}
        </strong>{' '}
        • Total: <strong style={{ color: '#059669' }}>₹{order.totalAmount}</strong> (
        {order.paymentMethod || 'PREPAID'})
      </div>

      {/* Driver Action Workflow Buttons */}
      {!isDelivered && !isCancelled && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {order.status === 'ORDER_PLACED' || order.status === 'CONFIRMED' ? (
            <>
              <button
                data-testid="accept-delivery-btn"
                onClick={() => onAcceptOrder(order.id)}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                <CheckCircle2 size={18} /> Accept Delivery
              </button>
              <button
                data-testid="reject-delivery-btn"
                onClick={() => onRejectOrder(order.id)}
                disabled={actionLoading}
                className="btn btn-danger"
              >
                <XCircle size={18} /> Reject
              </button>
            </>
          ) : order.status === 'PREPARING' ? (
            <button
              data-testid="mark-packed-btn"
              onClick={() => onUpdateOrderStatus(order.id, 'PACKED')}
              disabled={actionLoading}
              className="btn btn-primary btn-block"
            >
              <Package size={18} /> Mark Bag Packed & Ready at Store
            </button>
          ) : order.status === 'PACKED' ? (
            <button
              data-testid="start-delivery-btn"
              onClick={() => onUpdateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
              disabled={actionLoading}
              className="btn btn-accent btn-block"
              style={{ fontWeight: '800' }}
            >
              <Bike size={18} /> Pick Up & Start "Out for Delivery"
            </button>
          ) : order.status === 'OUT_FOR_DELIVERY' ? (
            <button
              data-testid="confirm-delivered-btn"
              onClick={() => onUpdateOrderStatus(order.id, 'DELIVERED')}
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
};

AssignedOrderCard.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    orderNumber: PropTypes.string,
    status: PropTypes.string,
    estimatedDeliveryTime: PropTypes.string,
    customerName: PropTypes.string,
    customerPhone: PropTypes.string,
    deliveryInstructions: PropTypes.string,
    totalAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    paymentMethod: PropTypes.string,
    address: PropTypes.shape({
      streetAddress: PropTypes.string,
      city: PropTypes.string,
      pincode: PropTypes.string,
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        productName: PropTypes.string,
        quantity: PropTypes.number,
      })
    ),
  }).isRequired,
  actionLoading: PropTypes.bool,
  onAcceptOrder: PropTypes.func.isRequired,
  onRejectOrder: PropTypes.func.isRequired,
  onUpdateOrderStatus: PropTypes.func.isRequired,
};

export default AssignedOrderCard;
