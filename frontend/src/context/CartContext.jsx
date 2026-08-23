import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi, couponApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import logger from '../utils/logger';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    itemTotal: 0,
    mrpTotal: 0,
    savings: 0,
    deliveryFee: 0,
    platformFee: 5,
    taxAmount: 0,
    grandTotal: 0,
    freeDeliveryUnlocked: false,
    amountNeededForFreeDelivery: 0,
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchCart = useCallback(async () => {
    if (!user || import.meta.env.MODE === 'test') return;
    try {
      const res = await cartApi.getCart();
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      logger.warn('CartContext', 'Could not load cart', err);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    setLoading(true);
    try {
      const res = await cartApi.addToCart(product.id, quantity);
      if (res?.data) {
        setCart(res.data);
        addToast(`Added ${product.name} to cart`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Could not add to cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartApi.updateQuantity(itemId, quantity);
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartApi.removeItem(itemId);
      if (res?.data) {
        setCart(res.data);
        addToast('Item removed from cart', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await couponApi.validateCoupon(code, cart.itemTotal);
      if (res?.data?.isValid) {
        setAppliedCoupon(res.data);
        addToast(res.data.message, 'success');
        setCouponModalOpen(false);
      } else {
        addToast(res?.data?.message || 'Invalid coupon', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to validate coupon', 'error');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon removed', 'info');
  };

  const getItemQuantity = (productId) => {
    if (!cart?.items) return 0;
    const found = cart.items.find((i) => i.productId === productId);
    return found ? found.quantity : 0;
  };

  const getItemCartId = (productId) => {
    if (!cart?.items) return null;
    const found = cart.items.find((i) => i.productId === productId);
    return found ? found.id : null;
  };

  // Compute final payable amount factoring applied coupon
  const finalPayableAmount = Math.max(
    0,
    (cart?.grandTotal || 0) - (appliedCoupon?.discountAmount || 0)
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartDrawerOpen,
        setCartDrawerOpen,
        couponModalOpen,
        setCouponModalOpen,
        appliedCoupon,
        finalPayableAmount,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        fetchCart,
        getItemQuantity,
        getItemCartId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
