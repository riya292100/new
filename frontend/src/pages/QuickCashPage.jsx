import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { walletApi } from '../services/api';
import {
  Sparkles,
  Zap,
  Gift,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Percent,
} from 'lucide-react';

export default function QuickCashPage() {
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [wallet, setWallet] = useState(() => {
    try {
      const cached = localStorage.getItem('quickcart_demo_wallet');
      if (cached) return JSON.parse(cached);
    } catch (_e) {
      console.error('Error loading stored wallet:', _e);
    }
    return {
      balance: 100.0,
      totalEarned: 100.0,
      totalSpent: 0.0,
      cashbackRatePercentage: 5.0,
      tierName: 'Silver Member (5%)',
      nextTierThreshold: 500.0,
      tierProgressPercentage: 20.0,
    };
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingFunds, setAddingFunds] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [calcOrderAmount, setCalcOrderAmount] = useState(1200);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await walletApi.getWallet();
      if (res?.data?.data) {
        setWallet(res.data.data);
        setTransactions(res.data.data.recentTransactions || []);
        localStorage.setItem('quickcart_demo_wallet', JSON.stringify(res.data.data));
        setLoading(false);
        return;
      }
    } catch (_e) {
      console.warn('Using local demo wallet for QuickCash page');
    }

    // Default demo state if unauthenticated or offline
    let cached = null;
    try {
      const stored = localStorage.getItem('quickcart_demo_wallet');
      if (stored) cached = JSON.parse(stored);
    } catch (_e) {
      console.error('Error loading stored wallet:', _e);
    }

    const fallback = cached || {
      balance: 100.0,
      totalEarned: 100.0,
      totalSpent: 0.0,
      cashbackRatePercentage: 5.0,
      tierName: 'Silver Member (5%)',
      nextTierThreshold: 500.0,
      tierProgressPercentage: 20.0,
    };
    setWallet(fallback);
    setTransactions([
      {
        id: 1,
        amount: 100.0,
        type: 'CREDIT_WELCOME_BONUS',
        description: '🎉 Welcome to QuickCart! ₹100 QuickCash credited.',
        balanceAfter: fallback.balance,
        createdAt: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchWallet();

    const handleUpdate = (e) => {
      if (e.detail?.balance !== undefined) {
        setWallet((prev) => ({ ...prev, balance: e.detail.balance }));
      }
    };

    window.addEventListener('quickcash-updated', handleUpdate);
    return () => window.removeEventListener('quickcash-updated', handleUpdate);
  }, [user]);

  const handleAddFunds = async (amount) => {
    setAddingFunds(true);
    const newTx = {
      id: Date.now(),
      amount: Number(amount),
      type: 'CREDIT_PROMO',
      description: `🎁 QuickCash ₹${amount} Instant Demo Credit`,
      balanceAfter: Number(wallet?.balance || 0) + Number(amount),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await walletApi.addDemoFunds(amount, `QuickCash ₹${amount} Instant Demo Reward`);
      if (res?.data?.data) {
        setWallet(res.data.data);
        setTransactions(res.data.data.recentTransactions || []);
        localStorage.setItem('quickcart_demo_wallet', JSON.stringify(res.data.data));
        window.dispatchEvent(
          new CustomEvent('quickcash-updated', { detail: { balance: res.data.data.balance } })
        );
        addToast(`🎉 Added ₹${amount} QuickCash credits to your wallet!`, 'success');
        return;
      }
    } catch (_e) {
      console.warn('Backend addDemoFunds skipped, applying to local wallet');
    }

    const updatedBalance = Number(wallet?.balance || 0) + Number(amount);
    const updatedEarned = Number(wallet?.totalEarned || 0) + Number(amount);
    const updatedWallet = {
      ...wallet,
      balance: updatedBalance,
      totalEarned: updatedEarned,
      tierProgressPercentage: Math.min(100, (updatedEarned / 500) * 100),
    };

    setWallet(updatedWallet);
    setTransactions((prev) => [newTx, ...prev]);
    localStorage.setItem('quickcart_demo_wallet', JSON.stringify(updatedWallet));
    window.dispatchEvent(
      new CustomEvent('quickcash-updated', { detail: { balance: updatedBalance } })
    );
    addToast(`🎉 Added ₹${amount} QuickCash credits to your wallet!`, 'success');
    setAddingFunds(false);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'CREDIT') {
      return (
        tx.type === 'CREDIT_CASHBACK' ||
        tx.type === 'CREDIT_WELCOME_BONUS' ||
        tx.type === 'CREDIT_PROMO' ||
        tx.type === 'CREDIT_REFUND'
      );
    }
    if (filterType === 'DEBIT') {
      return tx.type === 'DEBIT_ORDER_REDEMPTION';
    }
    return true;
  });

  const projectedCashback = (calcOrderAmount * 0.05).toFixed(2);
  const maxRedeem = Math.min(calcOrderAmount, Number(wallet?.balance || 0)).toFixed(2);
  const netPayable = Math.max(0, calcOrderAmount - maxRedeem).toFixed(2);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          borderRadius: '24px',
          padding: '32px',
          color: '#ffffff',
          boxShadow: '0 20px 30px -10px rgba(5, 150, 105, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.15)',
                padding: '6px 14px',
                borderRadius: '999px',
                backdropFilter: 'blur(8px)',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: '#a7f3d0',
                }}
              >
                QuickCash Loyalty & Rewards Hub
              </span>
            </div>
            <h1
              style={{
                fontSize: '2.2rem',
                fontWeight: '900',
                margin: 0,
                color: '#ffffff',
                lineHeight: 1.2,
              }}
            >
              Earn 5% Instant Cashback on Every Order
            </h1>
            <p
              style={{
                fontSize: '0.95rem',
                color: '#d1fae5',
                margin: '8px 0 0 0',
                maxWidth: '560px',
              }}
            >
              1 QuickCash = ₹1 INR. Redeem 100% of your wallet balance on groceries, fresh bakery,
              clothing, and dining table reservations with zero blackout dates.
            </p>
          </div>

          {/* Balance Card in Hero */}
          <div
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(12px)',
              borderRadius: '20px',
              padding: '20px 24px',
              minWidth: '260px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: '700' }}>
              AVAILABLE QUICKCASH BALANCE
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                margin: '4px 0 12px',
                color: '#ffffff',
              }}
            >
              ₹{Number(wallet?.balance || 0).toFixed(2)}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fbbf24',
                color: '#78350f',
                padding: '6px 12px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.82rem',
                width: 'fit-content',
              }}
            >
              <span>⭐ {wallet?.tierName || 'Silver Member (5%)'}</span>
            </div>
          </div>
        </div>

        {/* VIP Tier Progress Bar */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#d1fae5',
            }}
          >
            <span>
              Tier Progress: <strong>{wallet?.tierName || 'Silver Tier (5%)'}</strong>
            </span>
            <span>
              Total Cashback Earned: <strong>₹{Number(wallet?.totalEarned || 0).toFixed(2)}</strong>
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '10px',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(15, wallet?.tierProgressPercentage || 20))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                borderRadius: '999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          marginBottom: '32px',
        }}
      >
        {/* 1-Click Recharge Demo Credits */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
              color: '#065f46',
            }}
          >
            <Gift size={24} color="#059669" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
              1-Click Demo Recharge
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
            Instantly add demo QuickCash credits to experience checkout redemption and live ledger
            updates!
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { amt: 100, label: 'Welcome Bonus' },
              { amt: 250, label: 'Weekend Perk' },
              { amt: 500, label: 'High Roller VIP' },
            ].map(({ amt, label }) => (
              <button
                key={amt}
                disabled={addingFunds}
                onClick={() => handleAddFunds(amt)}
                style={{
                  padding: '14px 10px',
                  borderRadius: '16px',
                  background: '#ecfdf5',
                  border: '1.5px solid #a7f3d0',
                  color: '#065f46',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#047857' }}>
                  +₹{amt}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#065f46', marginTop: '4px' }}>
                  {label}
                </div>
              </button>
            ))}
          </div>

          {!user && (
            <div
              style={{
                marginTop: '20px',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Sign in to sync your balance to your cloud account
              </span>
              <button
                onClick={() => openAuthModal('login')}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Interactive Cashback Calculator */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
              color: '#0f172a',
            }}
          >
            <Percent size={24} color="#059669" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
              Cashback & Savings Calculator
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
            Simulate your grocery or fashion cart and see instant cashback & discount calculations:
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#475569',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Estimated Order Amount: ₹{calcOrderAmount}
            </label>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={calcOrderAmount}
              onChange={(e) => setCalcOrderAmount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
            />
          </div>

          <div
            style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                EARN 5% CASHBACK
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#059669' }}>
                +₹{projectedCashback}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                QUICKCASH REDEEM
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#d97706' }}>
                -₹{maxRedeem}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                NET PAYABLE
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>
                ₹{netPayable}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QuickCash Perks Grid */}
      <div style={{ marginBottom: '36px' }}>
        <h3
          style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}
        >
          Why QuickCash is India&apos;s Best Loyalty Program
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            {
              icon: '⚡',
              title: '5% Auto-Cashback',
              desc: 'Instant loyalty credits auto-deposited upon delivery for every order.',
            },
            {
              icon: '🛒',
              title: '100% Usable at Checkout',
              desc: 'Zero minimum basket size. Use every single rupee in your wallet directly.',
            },
            {
              icon: '🛡️',
              title: 'Never Expires',
              desc: 'Your credits are permanently yours. No 30-day expiration gimmicks.',
            },
            {
              icon: '🔄',
              title: 'Instant 1s Refunds',
              desc: 'Returns and cancellations credit back immediately to your wallet.',
            },
          ].map((perk, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{perk.icon}</div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: '800', margin: '0 0 6px 0' }}>
                {perk.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                {perk.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
              Ledger & Transaction History
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Real-time audit log of all your cashback earnings and order redemptions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  background: filterType === type ? '#047857' : '#f1f5f9',
                  color: filterType === type ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {type === 'ALL'
                  ? 'All Transactions'
                  : type === 'CREDIT'
                    ? 'Credits (+)'
                    : 'Debits (-)'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.85rem' }}>Loading QuickCash ledger...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '16px',
              color: '#64748b',
              fontSize: '0.9rem',
            }}
          >
            No transactions found for this filter. Place an order or claim a demo reward above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTransactions.map((tx, idx) => {
              const isCredit =
                tx.type === 'CREDIT_CASHBACK' ||
                tx.type === 'CREDIT_WELCOME_BONUS' ||
                tx.type === 'CREDIT_PROMO' ||
                tx.type === 'CREDIT_REFUND';

              return (
                <div
                  key={tx.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isCredit ? '#d1fae5' : '#ffe4e6',
                        color: isCredit ? '#047857' : '#e11d48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '1rem',
                      }}
                    >
                      {isCredit ? '↓' : '↑'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a' }}>
                        {tx.description || (isCredit ? 'Credit Added' : 'Debit Purchase')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                        {tx.referenceOrderNumber && ` • Order #${tx.referenceOrderNumber}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontWeight: '900',
                        fontSize: '0.98rem',
                        color: isCredit ? '#059669' : '#e11d48',
                      }}
                    >
                      {isCredit ? '+' : '-'}₹{Number(tx.amount || 0).toFixed(2)}
                    </div>
                    {tx.balanceAfter !== undefined && (
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                        Bal: ₹{Number(tx.balanceAfter).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Shopping CTAs */}
      <div
        style={{
          marginTop: '36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <Link
          to="/category"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            padding: '20px',
            borderRadius: '18px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 16px rgba(5, 150, 105, 0.25)',
          }}
        >
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Order Fresh Groceries</div>
            <div style={{ fontSize: '0.8rem', color: '#d1fae5', marginTop: '2px' }}>
              Earn 5% Instant QuickCash on delivery
            </div>
          </div>
          <ArrowRight size={22} />
        </Link>

        <Link
          to="/clothes"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            color: '#ffffff',
            padding: '20px',
            borderRadius: '18px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)',
          }}
        >
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Shop Trending Fashion</div>
            <div style={{ fontSize: '0.8rem', color: '#e0e7ff', marginTop: '2px' }}>
              Redeem 100% QuickCash on all styles
            </div>
          </div>
          <ArrowRight size={22} />
        </Link>
      </div>
    </div>
  );
}
