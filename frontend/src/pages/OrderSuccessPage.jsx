import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, ArrowRight, PackageCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });
  }, []);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '640px' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '40px 32px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.06)',
        }}
      >
        {/* Animated Check Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)',
          }}
        >
          <PackageCheck size={44} />
        </div>

        <span className="badge badge-featured" style={{ marginBottom: '12px' }}>
          ⚡ Order Confirmed
        </span>

        <h1 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '8px' }}>
          Order Placed Successfully!
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
          Your order <strong>#{orderNumber}</strong> has been received by our dark store team and is being packed.
        </p>

        {/* 15 Mins ETA Card */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginBottom: '32px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
              Estimated Delivery
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <Clock size={20} /> 12–15 Mins
            </div>
          </div>
          <div style={{ width: '1px', height: '40px', background: '#cbd5e1' }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
              Delivery Mode
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <Zap size={18} color="#f59e0b" /> Contactless Express
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            to={`/track/${orderNumber}`}
            className="btn btn-primary btn-lg btn-block"
            style={{ fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Track Live Delivery Status <ArrowRight size={20} />
          </Link>
          <Link
            to="/"
            className="btn btn-outline btn-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
