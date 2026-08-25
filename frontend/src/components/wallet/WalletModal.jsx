import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { walletApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WalletModal({ isOpen, onClose, user: propUser }) {
  let authUser = null;
  let openAuthModal = null;
  try {
    const auth = useAuth();
    if (auth) {
      authUser = auth.user;
      openAuthModal = auth.openAuthModal;
    }
  } catch (_e) {
    // Graceful fallback for standalone tests or outside AuthProvider
  }
  const user = propUser || authUser;
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingFunds, setAddingFunds] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchWalletData = async () => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);

    // Check localStorage cached wallet first
    let cached = null;
    try {
      const stored = localStorage.getItem('quickcart_demo_wallet');
      if (stored) cached = JSON.parse(stored);
    } catch (_e) {
      console.error('Error parsing stored wallet:', _e);
    }

    try {
      const res = await walletApi.getWallet();
      if (res.data?.success && res.data?.data) {
        setWallet(res.data.data);
        setTransactions(res.data.data.recentTransactions || []);
        localStorage.setItem('quickcart_demo_wallet', JSON.stringify(res.data.data));
        setLoading(false);
        return;
      }
    } catch (_e) {
      console.warn('Backend wallet fetch skipped or unauthenticated, using local state');
    }

    const fallbackWallet = cached || {
      balance: 100.0,
      totalEarned: 100.0,
      totalSpent: 0.0,
      cashbackRatePercentage: 5.0,
    };
    setWallet(fallbackWallet);
    setTransactions([
      {
        id: Date.now(),
        amount: fallbackWallet.balance || 100.0,
        type: 'CREDIT_WELCOME_BONUS',
        description: '🎉 Welcome to QuickCart! ₹100 QuickCash credited.',
        createdAt: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchWalletData();
  }, [isOpen]);

  const handleAddFunds = async (amount) => {
    setAddingFunds(true);
    setSuccessMsg('');
    setError(null);

    const newTx = {
      id: Date.now(),
      amount: Number(amount),
      type: 'CREDIT_PROMO',
      description: `🎁 QuickCash ₹${amount} Instant Demo Credit`,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await walletApi.addDemoFunds(amount, `QuickCash ₹${amount} Demo Reward`);
      if (res.data?.success && res.data?.data) {
        setWallet(res.data.data);
        setTransactions(res.data.data.recentTransactions || []);
        localStorage.setItem('quickcart_demo_wallet', JSON.stringify(res.data.data));
        window.dispatchEvent(
          new CustomEvent('quickcash-updated', { detail: { balance: res.data.data.balance } })
        );
        setSuccessMsg(`🎉 Added ₹${amount} QuickCash credits to your wallet!`);
        return;
      }
    } catch (_e) {
      console.warn('Backend addDemoFunds skipped, applying to local wallet');
    }

    setWallet((prev) => {
      const updatedBalance = (prev?.balance || 0) + Number(amount);
      const updatedWallet = {
        ...prev,
        balance: updatedBalance,
        totalEarned: (prev?.totalEarned || 0) + Number(amount),
      };
      localStorage.setItem('quickcart_demo_wallet', JSON.stringify(updatedWallet));
      window.dispatchEvent(
        new CustomEvent('quickcash-updated', { detail: { balance: updatedBalance } })
      );
      return updatedWallet;
    });
    setTransactions((prev) => [newTx, ...prev]);
    setSuccessMsg(`🎉 Added ₹${amount} QuickCash credits to your wallet!`);
    setAddingFunds(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md text-2xl shadow-inner">
              ⚡
            </div>
            <div>
              <h2 id="wallet-modal-title" className="text-xl font-bold tracking-tight">
                QuickCash & Loyalty Wallet
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                {user?.fullName || 'QuickCart Member'} • 5% Cashback Rewards
              </p>
            </div>
          </div>

          {/* Balance Display Card */}
          <div className="mt-4 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">
                  Available QuickCash Balance
                </span>
                <div className="text-3xl font-extrabold tracking-tight mt-0.5">
                  ₹{Number(wallet?.balance || 0).toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-sm">
                  ⭐ 5% Cashback Tier
                </span>
                <p className="text-[11px] text-emerald-100 mt-1">1 QuickCash = ₹1</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/15 text-xs text-emerald-100">
              <div>
                <span className="opacity-80">Lifetime Earned: </span>
                <span className="font-bold text-white">
                  ₹{Number(wallet?.totalEarned || 0).toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="opacity-80">Lifetime Spent: </span>
                <span className="font-bold text-white">
                  ₹{Number(wallet?.totalSpent || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Quick Demo Recharge Section */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <span>🎁</span> Instant Demo Credits
              </h3>
              <span className="text-[11px] text-emerald-700 font-medium">1-Click Recharge</span>
            </div>
            <p className="text-xs text-emerald-700 mb-3">
              Add instant demo loyalty rewards to test checkout redemption and cashback!
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  disabled={addingFunds || loading}
                  onClick={() => handleAddFunds(amt)}
                  className="py-2 px-3 rounded-xl bg-white border border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition shadow-sm active:scale-95 disabled:opacity-50"
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* How QuickCash Works */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-base mb-1">🛒</div>
              <div className="text-[11px] font-bold text-slate-800">5% Cashback</div>
              <div className="text-[10px] text-slate-500">Auto-credited on delivery</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-base mb-1">⚡</div>
              <div className="text-[11px] font-bold text-slate-800">100% Redeemable</div>
              <div className="text-[10px] text-slate-500">Use on groceries & clothes</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-base mb-1">🔒</div>
              <div className="text-[11px] font-bold text-slate-800">Never Expires</div>
              <div className="text-[10px] text-slate-500">Zero expiry on credits</div>
            </div>
          </div>

          {/* Recent Transactions Ledger */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>📋</span> Transaction History
              </h3>
              <span className="text-xs text-slate-500">
                {transactions.length} record{transactions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading ledger transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs">
                No wallet transactions yet. Place an order or claim a demo reward!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {transactions.map((tx, idx) => {
                  const isCredit =
                    tx.type === 'CREDIT_CASHBACK' ||
                    tx.type === 'CREDIT_WELCOME_BONUS' ||
                    tx.type === 'CREDIT_PROMO' ||
                    tx.type === 'CREDIT_REFUND';
                  return (
                    <div
                      key={tx.id || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCredit
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isCredit ? '↓' : '↑'}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {tx.description || (isCredit ? 'Credit Added' : 'Debit Purchase')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {tx.createdAt
                              ? new Date(tx.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recent'}
                            {tx.referenceOrderNumber && ` • Ref #${tx.referenceOrderNumber}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs font-extrabold ${
                            isCredit ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isCredit ? '+' : '-'}₹{Number(tx.amount || 0).toFixed(2)}
                        </div>
                        {tx.balanceAfter !== undefined && (
                          <div className="text-[10px] text-slate-400">
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
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">QuickCart Loyalty Guarantee 🛡️</span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

WalletModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
};
