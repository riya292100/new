import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addressApi, orderApi } from '../services/api';
import { Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import CheckoutAddressSelector from '../components/checkout/CheckoutAddressSelector';
import CheckoutPaymentMethods from '../components/checkout/CheckoutPaymentMethods';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary';

const CheckoutPage = () => {
  const { cart, appliedCoupon, removeCoupon, setCouponModalOpen, finalPayableAmount, clearCart } =
    useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    receiverName: user?.fullName || '',
    receiverPhone: user?.phone || '',
    streetAddress: '',
    apartmentUnit: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    isDefault: true,
  });

  const [selectedInstruction, setSelectedInstruction] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedTip, setSelectedTip] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    addressApi
      .getAddresses()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setAddresses(res.data);
          const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressForm(true);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user addresses:', err);
      });
  }, [user, navigate]);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressApi.createAddress(newAddress);
      if (res?.data) {
        setAddresses([res.data, ...addresses]);
        setSelectedAddressId(res.data.id);
        setShowNewAddressForm(false);
        addToast('Delivery address saved', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to save address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addToast('Please select or add a delivery address', 'error');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      addToast('Your cart is empty', 'error');
      navigate('/');
      return;
    }

    setPlacingOrder(true);
    try {
      const deliveryNotes = [selectedInstruction, customInstructions].filter(Boolean).join('; ');

      const orderPayload = {
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        deliveryInstructions: deliveryNotes || null,
        tipAmount: selectedTip,
      };

      const res = await orderApi.createOrder(orderPayload);
      if (res?.data) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (_e) {
          console.error('Error:', _e);
        }

        addToast('Order placed successfully!', 'success');
        navigate(`/track/${res.data.orderNumber}`);
      }
    } catch (err) {
      addToast(err.message || 'Failed to place order. Please retry.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      {/* 15-Min Delivery Badge */}
      <div
        style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          color: '#065f46',
        }}
      >
        <Clock size={24} color="#059669" />
        <div>
          <strong style={{ fontSize: '0.95rem' }}>⚡ 10-15 Minute Express Delivery Active</strong>
          <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px' }}>
            Dark store fulfillment hub nearest to your location is ready to pack immediately.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
        }}
      >
        {/* Left Column: Address & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <CheckoutAddressSelector
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            showNewAddressForm={showNewAddressForm}
            setShowNewAddressForm={setShowNewAddressForm}
            newAddress={newAddress}
            setNewAddress={setNewAddress}
            onCreateAddress={handleCreateAddress}
          />

          <CheckoutPaymentMethods
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <CheckoutOrderSummary
            cart={cart}
            appliedCoupon={appliedCoupon}
            removeCoupon={removeCoupon}
            setCouponModalOpen={setCouponModalOpen}
            selectedTip={selectedTip}
            setSelectedTip={setSelectedTip}
            finalPayableAmount={finalPayableAmount}
            placingOrder={placingOrder}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
