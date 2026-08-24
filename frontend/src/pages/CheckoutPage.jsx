import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addressApi, orderApi } from '../services/api';
import { Zap, Truck, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
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
  const [deliverySpeed, setDeliverySpeed] = useState('EXPRESS_1_HOUR'); // EXPRESS_1_HOUR or STANDARD_2_DAY
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    receiverName: user?.fullName || 'Riya Gope',
    receiverPhone: user?.phone || '9876543212',
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
      const deliveryNotes = [
        `Delivery Tier: ${deliverySpeed === 'EXPRESS_1_HOUR' ? '⚡ 1-Hour SuperFast' : '📦 Standard Pan-India'}`,
        selectedInstruction,
        customInstructions,
      ]
        .filter(Boolean)
        .join('; ');

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

        addToast('Order placed successfully! QuickCart rider assigned.', 'success');
        navigate(`/track/${res.data.orderNumber}`);
      }
    } catch (err) {
      addToast(err.message || 'Failed to place order. Please retry.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1-Hour Delivery Pan-India Active Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Zap className="w-6 h-6 fill-current text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              ⚡ 1-Hour SuperFast Pan-India Delivery Hub Active
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
              Dark store fulfillment center is ready to pack and dispatch your order within 10 minutes.
            </p>
          </div>
        </div>
        <span className="hidden md:inline-flex items-center gap-1 bg-amber-400 text-gray-950 px-3 py-1 rounded-xl text-xs font-black">
          <ShieldCheck className="w-4 h-4" /> 100% On-Time Guarantee
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery Speed, Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Delivery Speed Selector Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Choose Delivery Speed Tier
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Pan-India Enabled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 1-Hour SuperFast Option */}
              <div
                onClick={() => setDeliverySpeed('EXPRESS_1_HOUR')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  deliverySpeed === 'EXPRESS_1_HOUR'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4 fill-current text-amber-500" /> 1-Hour Express
                  </div>
                  {deliverySpeed === 'EXPRESS_1_HOUR' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="text-lg font-black text-gray-900 mt-2">45 - 60 Minutes</div>
                <div className="text-xs text-gray-600 mt-1">Dispatched directly from nearest dark store hub</div>
                <div className="text-xs font-bold text-emerald-700 mt-2">₹49 (Free above ₹499)</div>
              </div>

              {/* Standard 2-3 Day Option */}
              <div
                onClick={() => setDeliverySpeed('STANDARD_2_DAY')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  deliverySpeed === 'STANDARD_2_DAY'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider">
                    <Truck className="w-4 h-4" /> Standard Delivery
                  </div>
                  {deliverySpeed === 'STANDARD_2_DAY' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="text-lg font-black text-gray-900 mt-2">2 - 3 Business Days</div>
                <div className="text-xs text-gray-600 mt-1">National surface network with live tracking</div>
                <div className="text-xs font-bold text-emerald-700 mt-2">FREE Delivery</div>
              </div>
            </div>
          </div>

          {/* Address Selector */}
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

          {/* Payment Methods */}
          <CheckoutPaymentMethods
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </div>

        {/* Right Column: Order Summary & Pay */}
        <div className="lg:col-span-5">
          <div className="sticky top-28">
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
    </div>
  );
};

export default CheckoutPage;
