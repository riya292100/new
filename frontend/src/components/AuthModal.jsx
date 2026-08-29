import React, { useState } from 'react';
import { X, Zap, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEMO_USERS } from '../utils/demoConfig';
import { validateSchema, loginSchema, registerSchema, sanitizeInput } from '../utils/validation';
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

    if (isLogin) {
      const valResult = validateSchema(loginSchema, { email, password });
      if (!valResult.isValid) {
        addToast(Object.values(valResult.errors)[0], 'error');
        return;
      }
    } else {
      const valResult = validateSchema(registerSchema, {
        fullName,
        email,
        phone,
        password,
      });
      if (!valResult.isValid) {
        addToast(Object.values(valResult.errors)[0], 'error');
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
      logger.error('AuthModal', 'Authentication submission failure', err);
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
      <div className="glass-card qc-modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Close authentication modal"
          onClick={closeAuthModal}
          className="qc-modal-close-btn"
        >
          <X size={18} color="#64748b" />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="qc-modal-icon-badge">
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
