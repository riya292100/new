import React from 'react';

export default function QuickCashPerks() {
  const perks = [
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
  ];

  return (
    <div className="quickcash-perks-section">
      <h3 className="quickcash-perks-title">Why QuickCash is India&apos;s Best Loyalty Program</h3>
      <div className="quickcash-perks-grid">
        {perks.map((perk, idx) => (
          <div key={idx} className="quickcash-perk-card">
            <div className="quickcash-perk-icon">{perk.icon}</div>
            <h4 className="quickcash-perk-title">{perk.title}</h4>
            <p className="quickcash-perk-desc">{perk.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
