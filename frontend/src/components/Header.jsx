import React from 'react';
import PropTypes from 'prop-types';
import SearchAutocomplete from './SearchAutocomplete';
import BrandLogo from './header/BrandLogo';
import LocationPickerTrigger from './header/LocationPickerTrigger';
import NavCategoryLinks from './header/NavCategoryLinks';
import UserMenuDropdown from './header/UserMenuDropdown';
import CartNavButton from './header/CartNavButton';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { selectedLocation, setLocationModalOpen } = useLocation();
  const { cart, setCartDrawerOpen } = useCart();
  const { user, logout, openAuthModal, isAdmin, isDeliveryPartner } = useAuth();

  return (
    <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 900 }}>
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          gap: '16px',
        }}
      >
        {/* Brand & Location Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <BrandLogo />
          <LocationPickerTrigger
            selectedLocation={selectedLocation}
            onOpenModal={() => setLocationModalOpen(true)}
          />
        </div>

        {/* Center: Search Autocomplete & Shortcuts */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <SearchAutocomplete />
          <NavCategoryLinks />
        </div>

        {/* Right Actions: User Profile & Cart Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <UserMenuDropdown
            user={user}
            logout={logout}
            openAuthModal={openAuthModal}
            isAdmin={isAdmin}
            isDeliveryPartner={isDeliveryPartner}
          />
          <CartNavButton
            totalItems={cart?.totalItems || 0}
            totalPrice={cart?.totalPrice || 0}
            onOpenCart={() => setCartDrawerOpen(true)}
          />
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {};

export default Header;
