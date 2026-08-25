import React from 'react';
import PropTypes from 'prop-types';
import { RefreshCw } from 'lucide-react';

export default function QuickCashLedger({ transactions, loading, filterType, onFilterChange }) {
  const filtered = transactions.filter((tx) => {
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

  return (
    <div className="quickcash-ledger-card">
      <div className="quickcash-ledger-header">
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
              type="button"
              onClick={() => onFilterChange(type)}
              className={`quickcash-tab-btn ${filterType === type ? 'active' : 'inactive'}`}
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
      ) : filtered.length === 0 ? (
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
          {filtered.map((tx, idx) => {
            const isCredit =
              tx.type === 'CREDIT_CASHBACK' ||
              tx.type === 'CREDIT_WELCOME_BONUS' ||
              tx.type === 'CREDIT_PROMO' ||
              tx.type === 'CREDIT_REFUND';

            return (
              <div key={tx.id || idx} className="quickcash-tx-row">
                <div className="quickcash-tx-left">
                  <div
                    className={`quickcash-tx-icon-badge ${isCredit ? 'quickcash-tx-icon-credit' : 'quickcash-tx-icon-debit'}`}
                  >
                    {isCredit ? '↓' : '↑'}
                  </div>
                  <div>
                    <div className="quickcash-tx-desc">
                      {tx.description || (isCredit ? 'Credit Added' : 'Debit Purchase')}
                    </div>
                    <div className="quickcash-tx-date">
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
                    className={`quickcash-tx-amount ${isCredit ? 'quickcash-tx-amount-credit' : 'quickcash-tx-amount-debit'}`}
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
  );
}

QuickCashLedger.propTypes = {
  transactions: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  filterType: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};
