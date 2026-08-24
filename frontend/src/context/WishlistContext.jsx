import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';
import { wishlistApi } from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('quickcart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('quickcart_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to sync wishlist to localStorage', e);
    }
  }, [wishlist]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some((item) => String(item.id) === String(productId));
  };

  const toggleWishlist = async (product) => {
    if (!product || !product.id) return;
    const exists = isInWishlist(product.id);

    if (exists) {
      setWishlist((prev) => prev.filter((item) => String(item.id) !== String(product.id)));
      if (addToast) addToast(`Removed ${product.name || 'item'} from Wishlist`, 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      if (addToast) addToast(`Added ${product.name || 'item'} to Wishlist! ❤️`, 'success');
    }

    try {
      // Background sync if backend endpoint available
      await wishlistApi.toggleWishlist(product.id);
    } catch {
      // Gracefully silent fallback to local state
    }
  };

  const removeFromWishlist = (productId) => {
    if (!productId) return;
    setWishlist((prev) => prev.filter((item) => String(item.id) !== String(productId)));
    if (addToast) addToast('Removed from Wishlist', 'info');
  };

  const moveToCart = async (product) => {
    if (!product) return;
    try {
      await addToCart(product, 1);
      setWishlist((prev) => prev.filter((item) => String(item.id) !== String(product.id)));
      if (addToast) addToast(`Moved ${product.name || 'item'} to your cart! 🛒`, 'success');
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to move to cart', 'error');
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (addToast) addToast('Wishlist cleared', 'info');
  };

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

WishlistProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
