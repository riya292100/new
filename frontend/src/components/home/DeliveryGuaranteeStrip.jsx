import React from 'react';
import { Zap, Clock, ShieldCheck, Tag } from 'lucide-react';

const DeliveryGuaranteeStrip = () => {
  return (
    <div
      data-testid="delivery-guarantee-strip"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '36px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <Zap size={22} />
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
            Instant Delivery in 10–30 Minutes
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>From nearest local dark store</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
          }}
        >
          <Clock size={20} />
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
            Live GPS Tracking
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Real-time rider radar</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
            100% Quality Assured
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Direct farm & brand sourcing</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
          }}
        >
          <Tag size={20} />
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
            Best Value Prices
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Up to 40% OFF everyday</div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryGuaranteeStrip;
