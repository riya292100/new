import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, Tag, ShoppingBag, User, Package, Utensils, Shirt, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { cart, setCartDrawerOpen } = useCart();
  const { user, openAuthModal } = useAuth();

  const totalItems = cart?.totalItems || 0;

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive && location.pathname === '/' ? 'active' : ''}`
        }
      >
        <Home size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/clothes"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive || location.pathname.startsWith('/clothes') || location.pathname.startsWith('/fashion') ? 'active' : ''}`
        }
      >
        <Shirt size={22} />
        <span>Clothes</span>
      </NavLink>

      <NavLink
        to="/category/all"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive && !location.search.includes('deal=true') ? 'active' : ''}`
        }
      >
        <Grid size={22} />
        <span>Categories</span>
      </NavLink>

      <NavLink
        to="/dining"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive || location.pathname.startsWith('/restaurant') ? 'active' : ''}`
        }
      >
        <Utensils size={22} />
        <span>Dining</span>
      </NavLink>

      <NavLink
        to="/quickcash"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive || location.pathname.startsWith('/quickcash') || location.pathname.startsWith('/loyalty') ? 'active' : ''}`
        }
      >
        <Zap size={22} color="#059669" />
        <span>QuickCash</span>
      </NavLink>

      {/* Cart Drawer Trigger */}
      <button
        type="button"
        onClick={() => setCartDrawerOpen(true)}
        className="bottom-nav-item cart-trigger"
      >
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={22} />
          {totalItems > 0 && <span className="cart-badge-counter">{totalItems}</span>}
        </div>
        <span>Cart</span>
      </button>

      {user ? (
        <NavLink
          to="/orders"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={22} />
          <span>Orders</span>
        </NavLink>
      ) : (
        <button type="button" onClick={() => openAuthModal('login')} className="bottom-nav-item">
          <User size={22} />
          <span>Login</span>
        </button>
      )}
    </nav>
  );
};

BottomNav.propTypes = {};

export default BottomNav;
