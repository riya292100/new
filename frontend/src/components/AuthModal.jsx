import React, { useState } from 'react';
import { X, Zap, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEMO_USERS } from '../utils/demoConfig';
import { validateEmail, validatePassword, validatePhone, sanitizeInput } from '../utils/validation';
import logger from '../utils/logger';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

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
    } catch (err) {
      logger.error('Authentication Error:', err);
      const msg = err?.message || 'Authentication failed. Please check your credentials.';
      addToast(msg, 'error');
    } finally {
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
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} color="#64748b" />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            {isLogin ? <Zap size={26} color="#059669" /> : <UserPlus size={26} color="#059669" />}
          </div>
          <h2 style={{ fontSize: '1.45rem', color: '#0f172a', fontWeight: '800' }}>
            {isLogin ? 'Welcome to QuickCart' : 'Create an Account'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {isLogin
              ? 'Access 10-minute grocery delivery & table reservations'
              : 'Sign up to track deliveries in real time'}
          </p>
        </div>

        {/* Form Body */}
        {isLogin ? (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            onSubmit={handleSubmit}
            onQuickFill={handleQuickDemoFill}
            onSwitchToRegister={() => openAuthModal('register')}
          />
        ) : (
          <RegisterForm
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            password={password}
            setPassword={setPassword}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            loading={loading}
            onSubmit={handleSubmit}
            onSwitchToLogin={() => openAuthModal('login')}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
