import React, { useState, useEffect } from 'react';
import { Download, X, Zap, Star, ShieldCheck } from 'lucide-react';

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if user hasn't dismissed recently
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instruction for browsers without beforeinstallprompt (e.g. iOS Safari)
      alert(
        'To install QuickCart on iOS/Safari: Tap the Share icon (↑) and select "Add to Home Screen".'
      );
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-install-content">
        <div className="pwa-app-icon">
          <Zap size={22} fill="#ffffff" color="#ffffff" />
        </div>
        <div className="pwa-app-info">
          <div className="pwa-title">
            QuickCart App
            <span className="pwa-rating">
              <Star size={12} fill="#f59e0b" color="#f59e0b" /> 4.9
            </span>
          </div>
          <div className="pwa-desc">Install for fast 10-min grocery delivery & live GPS alerts</div>
        </div>
      </div>

      <div className="pwa-actions">
        <button onClick={handleInstallClick} className="btn-pwa-install">
          <Download size={15} /> Install App
        </button>
        <button onClick={handleDismiss} className="btn-pwa-dismiss" title="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
