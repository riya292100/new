import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addressApi, orderApi, couponApi } from '../services/api';
import {
  MapPin, Plus, CheckCircle2, ShieldCheck, Clock, CreditCard,
  Smartphone, Banknote, Tag, ArrowRight, Home, Briefcase, Building, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const INSTRUCTION_OPTIONS = [
  'Leave at door / security',
  "Don't ring doorbell",
  'Call before delivery',
  'Pet on premises',
];

const TIP_OPTIONS = [0, 10, 20, 30, 50];

const CheckoutPage = () => {
  const { cart, appliedCoupon, removeCoupon, setCouponModalOpen, finalPayableAmount } = useCart();
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

    addressApi.getAddresses()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setAddresses(res.data);
          const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressForm(true);
        }
      })
      .catch(() => {});
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
        paymentMethod: paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : paymentMethod === 'CARD' ? 'CARD' : paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'UPI',
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        deliveryInstructions: deliveryNotes,
        tipAmount: selectedTip,
      };

      const res = await orderApi.createOrder(orderPayload);
      if (res?.data) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        addToast('Order placed successfully!', 'success');
        navigate(`/order-success/${res.data.orderNumber}`);
      }
    } catch (err) {
      addToast(err.message || 'Could not place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const totalWithTip = finalPayableAmount + selectedTip;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '24px' }}>
        Checkout & Confirmation
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Left Side: Address, Instructions, Tips & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 1. Address Card */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="#059669" /> 1. Select Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#059669',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={16} /> {showNewAddressForm ? 'Cancel' : 'Add New Address'}
              </button>
            </div>

            {/* Inline Add Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleCreateAddress} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Receiver Name"
                    value={newAddress.receiverName}
                    onChange={(e) => setNewAddress({ ...newAddress, receiverName: e.target.value })}
                    className="input-control"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Receiver Phone"
                    value={newAddress.receiverPhone}
                    onChange={(e) => setNewAddress({ ...newAddress, receiverPhone: e.target.value.replace(/\D/g, '') })}
                    className="input-control"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Street Address, Building, Floor"
                  value={newAddress.streetAddress}
                  onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                  className="input-control"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Apartment/Flat #"
                    value={newAddress.apartmentUnit}
                    onChange={(e) => setNewAddress({ ...newAddress, apartmentUnit: e.target.value })}
                    className="input-control"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="input-control"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="input-control"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                  Save & Deliver Here
                </button>
              </form>
            )}

            {/* Saved Addresses Radio List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                      background: isSelected ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected ? '#059669' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {addr.label?.toLowerCase() === 'home' ? <Home size={16} /> : addr.label?.toLowerCase() === 'work' ? <Briefcase size={16} /> : <Building size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
                          {addr.label} • {addr.receiverName} ({addr.receiverPhone})
                        </span>
                        {isSelected && <CheckCircle2 size={18} color="#059669" />}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
                        {addr.streetAddress}, {addr.apartmentUnit ? `${addr.apartmentUnit}, ` : ''}{addr.city} - {addr.pincode}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Delivery Instructions */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#059669" /> 2. Delivery Instructions
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {INSTRUCTION_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setSelectedInstruction(selectedInstruction === opt ? '' : opt)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: selectedInstruction === opt ? '1.5px solid #059669' : '1px solid #e2e8f0',
                    background: selectedInstruction === opt ? '#ecfdf5' : '#f8fafc',
                    color: selectedInstruction === opt ? '#059669' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Any landmark or gate security code..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="input-control"
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* 3. Delivery Partner Tip */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '6px' }}>
              3. Delivery Partner Tip
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
              100% of the tip goes directly to your express delivery driver
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {TIP_OPTIONS.map((tip) => (
                <button
                  type="button"
                  key={tip}
                  onClick={() => setSelectedTip(tip)}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    borderRadius: '12px',
                    border: selectedTip === tip ? '2px solid #059669' : '1px solid #e2e8f0',
                    background: selectedTip === tip ? '#ecfdf5' : '#f8fafc',
                    color: selectedTip === tip ? '#059669' : '#334155',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  {tip === 0 ? 'No Tip' : `₹${tip}`}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Payment Method Selection */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="#059669" /> 4. Select Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '12px',
                  border: paymentMethod === 'UPI' ? '2px solid #059669' : '1px solid #e2e8f0',
                  background: paymentMethod === 'UPI' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                />
                <Smartphone size={20} color="#059669" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                    Instant UPI (Google Pay, PhonePe, Paytm, CRED)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Fast 1-click test checkout simulation</div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '12px',
                  border: paymentMethod === 'RAZORPAY' ? '2px solid #059669' : '1px solid #e2e8f0',
                  background: paymentMethod === 'RAZORPAY' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="RAZORPAY"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                />
                <CreditCard size={20} color="#059669" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                    Razorpay / Stripe Gateway (Cards & NetBanking)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Sandbox test mode integration</div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '12px',
                  border: paymentMethod === 'COD' ? '2px solid #059669' : '1px solid #e2e8f0',
                  background: paymentMethod === 'COD' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <Banknote size={20} color="#059669" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                    Cash on Delivery (COD)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Pay cash or UPI to rider at doorstep</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Items Preview & Final Bill */}
        <div>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              position: 'sticky',
              top: '80px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '16px' }}>
              Order Summary ({cart.totalItems} items)
            </h3>

            {/* Items Mini List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              {cart.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={item.productImage} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity} • {item.unitQuantity}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>₹{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon Trigger */}
            <div style={{ marginBottom: '16px' }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', padding: '10px 14px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} /> Code '{appliedCoupon.code}' (-₹{appliedCoupon.discountAmount})
                  </div>
                  <button onClick={removeCoupon} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCouponModalOpen(true)}
                  style={{ width: '100%', padding: '10px', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: '12px', color: '#b45309', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Tag size={16} /> Apply Coupon for Discount
                </button>
              )}
            </div>

            {/* Bill Calculation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Item Total</span>
                <span>₹{cart.itemTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Fee</span>
                <span>{cart.deliveryFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${cart.deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Platform Fee</span>
                <span>₹{cart.platformFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Taxes & GST</span>
                <span>₹{cart.taxAmount}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                  <span>Coupon Savings</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
              {selectedTip > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', fontWeight: '600' }}>
                  <span>Delivery Partner Tip</span>
                  <span>+₹{selectedTip}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Grand Total</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669' }}>₹{totalWithTip}</span>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="btn btn-primary btn-block btn-lg"
              style={{ padding: '14px', fontWeight: '800' }}
            >
              {placingOrder ? 'Processing Order...' : `Pay ₹${totalWithTip} & Place Order`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8', marginTop: '12px' }}>
              <ShieldCheck size={14} color="#059669" /> Safe & 100% Encrypted Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
