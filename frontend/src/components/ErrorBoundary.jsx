import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import logger from '../utils/logger';

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

    // Report structured error to centralized logger
    logger.error('ErrorBoundary', 'Uncaught component error in render tree', error, {
      componentStack: errorInfo?.componentStack,
    });

    // Optional error tracking integration (e.g. Sentry) when DSN is configured
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    if (sentryDsn && typeof window !== 'undefined' && window.Sentry) {
      try {
        window.Sentry.captureException(error, { extra: errorInfo });
      } catch (err) {
        logger.warn('ErrorBoundary', 'Failed to dispatch error to Sentry', err);
      }
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              error: this.state.error,
              resetError: this.handleReset,
            })
          : this.props.fallback;
      }

      return (
        <div className="qc-error-boundary-wrap">
          <div className="qc-error-boundary-card">
            <div className="qc-error-icon-box">
              <AlertTriangle size={32} />
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--color-text-main, #0f172a)',
                marginBottom: '8px',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--color-text-muted, #64748b)',
                marginBottom: '28px',
                lineHeight: 1.6,
              }}
            >
              We encountered an unexpected error while loading this view. You can reload the page or
              return to the storefront.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
  onReset: PropTypes.func,
};

export default ErrorBoundary;
