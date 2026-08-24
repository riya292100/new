import React from 'react';
import PropTypes from 'prop-types';
import { Smartphone, CreditCard, Banknote, ShieldCheck } from 'lucide-react';

const CheckoutPaymentMethods = ({ paymentMethod, setPaymentMethod }) => {
  const methods = [
    {
      key: 'UPI',
      label: 'UPI (Instant Refund)',
      desc: 'Google Pay, PhonePe, Paytm, QR',
      icon: <Smartphone size={20} color="#059669" />,
    },
    {
      key: 'CREDIT_CARD',
      label: 'Credit / Debit Card',
      desc: 'Visa, Mastercard, RuPay',
      icon: <CreditCard size={20} color="#2563eb" />,
    },
    {
      key: 'CASH_ON_DELIVERY',
      label: 'Cash on Delivery',
      desc: 'Pay with Cash / UPI on arrival',
      icon: <Banknote size={20} color="#d97706" />,
    },
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #e2e8f0',
      }}
    >
      <h3
        style={{
          fontSize: '1.15rem',
          color: '#0f172a',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <ShieldCheck size={20} color="#059669" /> Choose Payment Method
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {methods.map((m) => {
          const isSelected = paymentMethod === m.key;
          return (
            <label
              key={m.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '14px',
                border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                background: isSelected ? '#f0fdf4' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: isSelected ? '#ffffff' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {m.icon}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{m.desc}</div>
                </div>
              </div>

              <input
                type="radio"
                name="paymentMethod"
                value={m.key}
                checked={isSelected}
                onChange={() => setPaymentMethod(m.key)}
                style={{ accentColor: '#059669', width: '18px', height: '18px' }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
};

CheckoutPaymentMethods.propTypes = {
  paymentMethod: PropTypes.string.isRequired,
  setPaymentMethod: PropTypes.func.isRequired,
};

export default CheckoutPaymentMethods;
