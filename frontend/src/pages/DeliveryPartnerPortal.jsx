import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDeliveryPartner } from '../hooks/useDeliveryPartner';
import { RefreshCw, Zap } from 'lucide-react';
import DriverStatsGrid from '../components/delivery/DriverStatsGrid';
import AssignedOrderCard from '../components/delivery/AssignedOrderCard';
import EmptyOrdersState from '../components/delivery/EmptyOrdersState';

const DeliveryPartnerPortal = () => {
  const { user } = useAuth();
  const {
    profile,
    assignedOrders,
    loading,
    actionLoading,
    refresh,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    updateLocation,
  } = useDeliveryPartner();

  const handleSimulateGPS = () => {
    // Simulated GPS pulse towards Koramangala
    const lat = 12.9352 + (Math.random() - 0.5) * 0.01;
    const lng = 77.6245 + (Math.random() - 0.5) * 0.01;
    updateLocation(lat, lng);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header Bar */}
      <div className="qc-driver-header-bar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--color-primary-light, #10b981)',
                boxShadow: '0 0 10px var(--color-primary-light, #10b981)',
              }}
            />
            <h1 style={{ fontSize: '1.75rem', color: 'var(--color-text-main, #0f172a)' }}>
              Delivery Partner Portal
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted, #64748b)' }}>
            Welcome back,{' '}
            <strong>{profile?.user?.fullName || user?.fullName || 'Express Rider'}</strong> •{' '}
            {profile?.vehicleType || 'Electric Scooter'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleSimulateGPS}
            className="btn btn-accent btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={14} /> Broadcast GPS Pulse
          </button>
          <button
            type="button"
            onClick={refresh}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} /> Refresh Live Feed
          </button>
        </div>
      </div>

      {/* Driver Stats Grid */}
      <DriverStatsGrid profile={profile} />

      {/* Assigned Orders Feed */}
      <div>
        <h3
          style={{
            fontSize: '1.3rem',
            color: 'var(--color-text-main, #0f172a)',
            marginBottom: '16px',
          }}
        >
          Active & Assigned Deliveries ({assignedOrders.length})
        </h3>

        {loading ? (
          <div className="skeleton" style={{ height: '200px', borderRadius: '20px' }} />
        ) : assignedOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {assignedOrders.map((order) => (
              <AssignedOrderCard
                key={order.id}
                order={order}
                actionLoading={actionLoading}
                onAcceptOrder={acceptOrder}
                onRejectOrder={rejectOrder}
                onUpdateOrderStatus={updateOrderStatus}
              />
            ))}
          </div>
        ) : (
          <EmptyOrdersState />
        )}
      </div>
    </div>
  );
};

export default DeliveryPartnerPortal;
