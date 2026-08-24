import React from 'react';
import PropTypes from 'prop-types';
import { Mail, Lock, Zap } from 'lucide-react';
import DemoCredentialsBar from './DemoCredentialsBar';

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
  onQuickFill,
  onSwitchToRegister,
}) => {
  return (
    <div>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="login-email"
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '6px',
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
              id="login-email"
              type="email"
              className="input-control"
              placeholder="e.g. customer@quickcart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="login-password"
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Password
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
              id="login-password"
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
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
          {loading ? (
            'Authenticating...'
          ) : (
            <>
              <Zap size={18} /> Sign In & Continue
            </>
          )}
        </button>
      </form>

      <DemoCredentialsBar onQuickFill={onQuickFill} />

      <p
        style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748b',
          marginTop: '18px',
        }}
      >
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          style={{
            background: 'none',
            border: 'none',
            color: '#059669',
            fontWeight: '700',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          Create an Account
        </button>
      </p>
    </div>
  );
};

LoginForm.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onQuickFill: PropTypes.func.isRequired,
  onSwitchToRegister: PropTypes.func.isRequired,
};

export default LoginForm;
