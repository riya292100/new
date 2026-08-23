import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, log to an error monitoring service (e.g. Sentry)
    if (import.meta.env.VITE_SENTRY_DSN) {
      // Simulate Sentry integration
      console.error('Sending error to Sentry [DSN configured]:', error);
    } else {
      console.error('Uncaught error (Sentry not configured):', error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#ef4444',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#0f172a',
                marginBottom: '8px',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: '0.92rem',
                color: '#64748b',
                marginBottom: '28px',
                lineHeight: 1.6,
              }}
            >
              We encountered an unexpected error while loading this view. You can reload the page or
              return to the storefront.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <Home size={16} /> Back to Store
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
