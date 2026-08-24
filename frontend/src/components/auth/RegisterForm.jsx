import React from 'react';
import PropTypes from 'prop-types';
import { Mail, Lock, User, Phone, ShoppingBag, Bike } from 'lucide-react';

const RegisterForm = ({
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  selectedRole,
  setSelectedRole,
  loading,
  onSubmit,
  onSwitchToLogin,
}) => {
  return (
    <div>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label
            htmlFor="register-fullname"
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '4px',
            }}
          >
            Full Name
          </label>
          <div style={{ position: 'relative' }}>
            <User
              size={18}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              id="register-fullname"
              type="text"
              className="input-control"
              placeholder="e.g. Sarah Jenkins"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label
            htmlFor="register-email"
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '4px',
            }}
          >
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={18}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              id="register-email"
              type="email"
              className="input-control"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label
            htmlFor="register-phone"
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '4px',
            }}
          >
            10-Digit Mobile Number
          </label>
          <div style={{ position: 'relative' }}>
            <Phone
              size={18}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              id="register-phone"
              type="tel"
              className="input-control"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label
            htmlFor="register-password"
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '4px',
            }}
          >
            Create Secure Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={18}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              id="register-password"
              type="password"
              className="input-control"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        {/* Role Picker */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '8px',
            }}
          >
            Register As:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: selectedRole === 'customer' ? '2px solid #059669' : '1px solid #e2e8f0',
                background: selectedRole === 'customer' ? '#ecfdf5' : '#ffffff',
                color: selectedRole === 'customer' ? '#065f46' : '#64748b',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ShoppingBag size={16} /> Customer
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('driver')}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: selectedRole === 'driver' ? '2px solid #059669' : '1px solid #e2e8f0',
                background: selectedRole === 'driver' ? '#ecfdf5' : '#ffffff',
                color: selectedRole === 'driver' ? '#065f46' : '#64748b',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Bike size={16} /> Delivery Partner
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
          style={{
            padding: '14px',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {loading ? 'Creating Account...' : 'Create My Account'}
        </button>
      </form>

      <p
        style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748b',
          marginTop: '18px',
        }}
      >
        Already registered?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#059669',
            fontWeight: '700',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

RegisterForm.propTypes = {
  fullName: PropTypes.string.isRequired,
  setFullName: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  phone: PropTypes.string.isRequired,
  setPhone: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  selectedRole: PropTypes.string.isRequired,
  setSelectedRole: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSwitchToLogin: PropTypes.func.isRequired,
};

export default RegisterForm;
