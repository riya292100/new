import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { walletApi } from '../services/api';
import QuickCashHero from '../components/quickcash/QuickCashHero';
import QuickCashRechargeStation from '../components/quickcash/QuickCashRechargeStation';
import QuickCashCalculator from '../components/quickcash/QuickCashCalculator';
import QuickCashPerks from '../components/quickcash/QuickCashPerks';
import QuickCashLedger from '../components/quickcash/QuickCashLedger';
import '../styles/quickcash.css';

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
        setAddingFunds(false);
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

  return (
    <div className="container quickcash-page-container">
      <QuickCashHero wallet={wallet} />

      <div className="quickcash-grid-2col">
        <QuickCashRechargeStation
          user={user}
          addingFunds={addingFunds}
          onAddFunds={handleAddFunds}
          onOpenAuth={() => openAuthModal('login')}
        />
        <QuickCashCalculator
          orderAmount={calcOrderAmount}
          onOrderAmountChange={setCalcOrderAmount}
          walletBalance={wallet?.balance}
        />
      </div>

      <QuickCashPerks />

      <QuickCashLedger
        transactions={transactions}
        loading={loading}
        filterType={filterType}
        onFilterChange={setFilterType}
      />

      {/* Shopping CTAs */}
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
