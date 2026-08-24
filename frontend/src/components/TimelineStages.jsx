import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle } from 'lucide-react';

export const TIMELINE_STAGES = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Order received by QuickCart' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Verified by fulfillment hub' },
  { key: 'PREPARING', label: 'Preparing', desc: 'Items being picked from dark store' },
  { key: 'PACKED', label: 'Packed & Ready', desc: 'Bag sealed for dispatch' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Rider on the way with your bag' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over at your door' },
];

const TimelineStages = ({ status = 'ORDER_PLACED' }) => {
  const isCancelled = status === 'CANCELLED';
  const currentStageIndex = isCancelled ? -1 : TIMELINE_STAGES.findIndex((s) => s.key === status);

  if (isCancelled) {
    return (
      <div
        style={{
          background: '#fef2f2',
          padding: '16px',
          borderRadius: '12px',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <XCircle size={22} />
        <div>
          <strong>Order was cancelled</strong>
          <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>
            Inventory restored and any refund initiated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        position: 'relative',
        paddingLeft: '8px',
      }}
    >
      {TIMELINE_STAGES.map((stage, idx) => {
        const isDone = idx <= currentStageIndex;
        const isCurrent = idx === currentStageIndex;
        return (
          <div
            key={stage.key}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative' }}
          >
            {/* Circle Indicator */}
            <div
              data-testid={`stage-indicator-${stage.key}`}
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
              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: isCurrent ? '800' : '600',
                  color: isCurrent ? '#059669' : isDone ? '#0f172a' : '#94a3b8',
                }}
              >
                {stage.label} {isCurrent && '— in progress'}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: isDone ? '#64748b' : '#cbd5e1',
                  marginTop: '2px',
                }}
              >
                {stage.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

TimelineStages.propTypes = {
  status: PropTypes.string,
};

export default TimelineStages;
