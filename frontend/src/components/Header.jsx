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
import styles from './Header.module.css';

const Header = () => {
  const { selectedLocation, setLocationModalOpen } = useLocation();
  const { cart, setCartDrawerOpen } = useCart();
  const { user, logout, openAuthModal, isAdmin, isDeliveryPartner } = useAuth();

  return (
    <header className={`glass-header ${styles.header}`}>
      <div className={`container ${styles.container}`}>
        {/* Brand & Location Trigger */}
        <div className={styles.brandGroup}>
          <BrandLogo />
          <LocationPickerTrigger
            selectedLocation={selectedLocation}
            onOpenModal={() => setLocationModalOpen(true)}
          />
        </div>

        {/* Center: Search Autocomplete & Shortcuts */}
        <div className={styles.centerGroup}>
          <SearchAutocomplete />
          <NavCategoryLinks />
        </div>

        {/* Right Actions: User Profile & Cart Button */}
        <div className={styles.rightGroup}>
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
