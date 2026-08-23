import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CouponModal from './components/CouponModal';
import AuthModal from './components/AuthModal';
import RoleSwitcher from './components/RoleSwitcher';
import BottomNav from './components/BottomNav';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import OfflineNotice from './components/OfflineNotice';
import ErrorBoundary from './components/ErrorBoundary';

import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import DeliveryPartnerPortal from './pages/DeliveryPartnerPortal';
import AdminDashboard from './pages/AdminDashboard';
import DiningDiscoveryPage from './pages/DiningDiscoveryPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import BookingsPage from './pages/BookingsPage';

// Protected route guard
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, switchDemoRole, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #059669',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto',
          }}
        />
        <p style={{ marginTop: '16px', color: '#64748b' }}>Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="container"
        style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '460px' }}
      >
        <div
          className="glass-card"
          style={{ padding: '32px', borderRadius: '24px', background: '#ffffff' }}
        >
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '8px' }}>
            Sign in to continue
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '24px' }}>
            Please log in with your credentials or switch to a demo role to view this page.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() =>
                switchDemoRole(
                  requiredRole === 'ROLE_ADMIN'
                    ? 'ADMIN'
                    : requiredRole === 'ROLE_DELIVERY_PARTNER'
                      ? 'DELIVERY'
                      : 'CUSTOMER'
                )
              }
              className="btn btn-primary btn-block"
            >
              1-Click Demo Login as{' '}
              {requiredRole === 'ROLE_ADMIN'
                ? 'Admin'
                : requiredRole === 'ROLE_DELIVERY_PARTNER'
                  ? 'Delivery Partner'
                  : 'Customer'}
            </button>
            <button onClick={() => openAuthModal('login')} className="btn btn-outline btn-block">
              Open Regular Login Modal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return (
      <div
        className="container"
        style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '480px' }}
      >
        <div
          className="glass-card"
          style={{ padding: '32px', borderRadius: '24px', background: '#ffffff' }}
        >
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '8px' }}>
            Role Authorization Required
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '24px' }}>
            This portal requires{' '}
            <strong>{requiredRole === 'ROLE_ADMIN' ? 'Administrator' : 'Delivery Partner'}</strong>{' '}
            privileges.
          </p>
          <button
            onClick={() => switchDemoRole(requiredRole === 'ROLE_ADMIN' ? 'ADMIN' : 'DELIVERY')}
            className="btn btn-accent btn-block"
          >
            Switch to {requiredRole === 'ROLE_ADMIN' ? 'Admin' : 'Delivery Partner'} Demo View
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const AppContent = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top role-switcher demo bar */}
      <RoleSwitcher />

      {/* Network Offline / Reconnected Banner */}
      <OfflineNotice />

      {/* 1-Click PWA / Mobile Install Banner */}
      <PwaInstallPrompt />

      {/* Sticky Header */}
      <Header />

      {/* Slide-in Cart Drawer */}
      <CartDrawer />

      {/* Coupon Modal */}
      <CouponModal />

      {/* Auth Modal */}
      <AuthModal />

      {/* Main Page Routes */}
      <main style={{ flex: 1, paddingBottom: '70px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/dining" element={<DiningDiscoveryPage />} />
          <Route path="/restaurants" element={<DiningDiscoveryPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success/:orderNumber"
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track/:orderNumber"
            element={
              <ProtectedRoute>
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-partner"
            element={
              <ProtectedRoute requiredRole="ROLE_DELIVERY_PARTNER">
                <DeliveryPartnerPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner"
            element={
              <ProtectedRoute requiredRole="ROLE_DELIVERY_PARTNER">
                <DeliveryPartnerPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partnerapp"
            element={
              <ProtectedRoute requiredRole="ROLE_DELIVERY_PARTNER">
                <DeliveryPartnerPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute requiredRole="ROLE_DELIVERY_PARTNER">
                <DeliveryPartnerPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminportal"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Native App Bottom Navigation Bar (Mobile / Tablet) */}
      <BottomNav />

      {/* Footer */}
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
