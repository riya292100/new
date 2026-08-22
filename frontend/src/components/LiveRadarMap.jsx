import React, { useState, useEffect } from 'react';
import { Bike, MapPin, Store, Navigation, ShieldCheck } from 'lucide-react';

const LiveRadarMap = ({ orderStatus, partnerLocation, customerAddress }) => {
  const [progress, setProgress] = useState(0.2); // 0 (Store) to 1.0 (Customer)

  useEffect(() => {
    if (orderStatus === 'OUT_FOR_DELIVERY') {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 0.95 ? 0.95 : prev + 0.05));
      }, 2000);
      return () => clearInterval(interval);
    } else if (orderStatus === 'DELIVERED') {
      setProgress(1.0);
    } else if (orderStatus === 'PREPARING' || orderStatus === 'PACKED') {
      setProgress(0.15);
    } else {
      setProgress(0.05);
    }
  }, [orderStatus]);

  // Interpolated SVG coordinates
  const startX = 60;
  const startY = 180;
  const endX = 360;
  const endY = 50;

  // Bezier curve path
  const currentX = startX + (endX - startX) * progress;
  const currentY = startY + (endY - startY) * progress + Math.sin(progress * Math.PI) * -30;

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '20px',
        padding: '20px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 15px 35px -5px rgba(15, 23, 42, 0.4)',
      }}
    >
      {/* Top Map Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 12px #10b981',
          }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#34d399' }}>
            Live GPS Tracking Active
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Dark Store #QC-14 • 1.4 km
        </span>
      </div>

      {/* Interactive Map Visual */}
      <div style={{ position: 'relative', width: '100%', height: '220px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', overflow: 'hidden' }}>
        {/* SVG Grid and Route Line */}
        <svg style={{ width: '100%', height: '100%' }}>
          {/* Subtle Grid Lines */}
          <line x1="0" y1="50" x2="420" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="0" y1="110" x2="420" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="0" y1="170" x2="420" y2="170" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="100" y1="0" x2="100" y2="220" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="200" y1="0" x2="200" y2="220" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="300" y1="0" x2="300" y2="220" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Route path (Grey background) */}
          <path
            d={`M ${startX} ${startY} Q 200 80 ${endX} ${endY}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="4"
            strokeDasharray="6 6"
          />

          {/* Traveled Route path (Vibrant emerald glow) */}
          <path
            d={`M ${startX} ${startY} Q 200 80 ${currentX} ${currentY}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
          />
        </svg>

        {/* Store Origin Marker */}
        <div style={{ position: 'absolute', left: `${startX - 18}px`, top: `${startY - 18}px`, zIndex: 5 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
          }}>
            <Store size={18} />
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', textAlign: 'center', marginTop: '2px', color: '#94a3b8' }}>
            Dark Store
          </div>
        </div>

        {/* Customer Destination Marker */}
        <div style={{ position: 'absolute', left: `${endX - 18}px`, top: `${endY - 18}px`, zIndex: 5 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)',
          }}>
            <MapPin size={18} />
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', textAlign: 'center', marginTop: '2px', color: '#94a3b8' }}>
            Your Home
          </div>
        </div>

        {/* Moving Delivery Partner Bike Marker */}
        <div
          style={{
            position: 'absolute',
            left: `${currentX - 22}px`,
            top: `${currentY - 22}px`,
            zIndex: 10,
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="radar-wave" style={{ top: '-8px', left: '-8px' }} />
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.8)',
              border: '2px solid #ffffff',
            }}
          >
            <Bike size={22} />
          </div>
          <div style={{
            background: '#0f172a',
            color: '#fbbf24',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: '800',
            textAlign: 'center',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}>
            {orderStatus === 'DELIVERED' ? 'Arrived' : 'On the way'}
          </div>
        </div>
      </div>

      {/* Bottom Live Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '12px', fontSize: '0.8rem', textAlign: 'center' }}>
        <div>
          <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>ESTIMATED TIME</span>
          <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>
            {orderStatus === 'DELIVERED' ? 'Delivered' : '10-14 Mins'}
          </strong>
        </div>
        <div>
          <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>RIDER DISTANCE</span>
          <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>
            {orderStatus === 'DELIVERED' ? '0.0 km' : `${(1.4 * (1 - progress)).toFixed(1)} km`}
          </strong>
        </div>
        <div>
          <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>SAFETY CHECK</span>
          <strong style={{ color: '#60a5fa', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <ShieldCheck size={14} /> Contactless
          </strong>
        </div>
      </div>
    </div>
  );
};

export default LiveRadarMap;
