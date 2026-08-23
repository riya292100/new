import React, { useState } from 'react';
import { X, Zap, Lock, Mail, User, Phone, Shield, Bike, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEMO_USERS } from '../utils/demoConfig';
import { validateEmail, validatePassword, validatePhone, sanitizeInput } from '../utils/validation';

const AuthModal = () => {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register } =
    useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validations
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      addToast(emailVal.error, 'error');
      return;
    }

    const passVal = validatePassword(password);
    if (!passVal.isValid) {
      addToast(passVal.error, 'error');
      return;
    }

    if (!isLogin) {
      const phoneVal = validatePhone(phone);
      if (!phoneVal.isValid) {
        addToast(phoneVal.error, 'error');
        return;
      }
      if (!fullName.trim()) {
        addToast('Full name is required', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(sanitizeInput(email), password);
      } else {
        await register({
          fullName: sanitizeInput(fullName),
          email: sanitizeInput(email),
          phone: sanitizeInput(phone),
          password,
          roles: [selectedRole],
        });
      }
    } catch (err) { console.error('Error:', err); } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (type) => {
    const demoUser = DEMO_USERS[type];
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(demoUser.password);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '24px',
          padding: '28px',
          background: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} color="#64748b" />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Zap size={24} fill="#ffffff" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#0f172a' }}>
            {isLogin ? 'Welcome to QuickCart' : 'Create an Account'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {isLogin
              ? 'Instant 10-30 min grocery delivery at your doorstep'
              : 'Join thousands getting superfast deliveries every day'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: isLogin ? '#ffffff' : 'transparent',
              color: isLogin ? '#059669' : '#64748b',
              boxShadow: isLogin ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: !isLogin ? '#ffffff' : 'transparent',
              color: !isLogin ? '#059669' : '#64748b',
              boxShadow: !isLogin ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            Register
          </button>
        </div>

        {/* 1-Click Demo Quick Fill Buttons */}
        {isLogin && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              ⚡ 1-Click Demo Credentials
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('customer')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#059669',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <ShoppingBag size={12} /> Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('driver')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#d97706',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Bike size={12} /> Driver
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('admin')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6366f1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Shield size={12} /> Admin
              </button>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          {!isLogin && (
            <>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '14px', top: '13px' }}
                  />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="input-control"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '14px', top: '13px' }}
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="input-control"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  Account Type
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="input-control"
                >
                  <option value="customer">Customer (Order Groceries)</option>
                  <option value="delivery_partner">Delivery Partner (Deliver Orders)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '4px',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '14px', top: '13px' }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@quickcart.com"
                className="input-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '4px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '14px', top: '13px' }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In & Continue' : 'Create My Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
