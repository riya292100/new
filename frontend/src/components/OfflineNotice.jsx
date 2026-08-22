import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineNotice = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showRestored) {
    return (
      <div className="network-banner network-online">
        <Wifi size={16} /> Internet restored. Connected to live dark store network.
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="network-banner network-offline">
        <WifiOff size={16} /> You are currently offline. Viewing cached essentials catalog.
      </div>
    );
  }

  return null;
};

export default OfflineNotice;
