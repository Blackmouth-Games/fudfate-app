
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const { t } = useTranslation();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    
    // Fix for duplicate banner issue - only show if no consent stored
    if (!consent) {
      // Wait a moment before showing the banner
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-black/80 backdrop-blur-sm z-[100] border-t-2 border-accent/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <h3 className="text-white font-bold mb-1">{t('cookies.title')}</h3>
          <p className="text-gray-300 text-sm">{t('cookies.description')}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <Link to="/cookies" className="bg-transparent text-white px-4 py-2 rounded border border-white/30 hover:bg-white/10 transition-colors">
            {t('cookies.settings')}
          </Link>
          <button
            onClick={handleDecline}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            {t('cookies.decline')}
          </button>
          <button
            onClick={handleAccept}
            className="bg-accent text-black font-bold px-4 py-2 rounded hover:bg-accent/90 transition-colors"
          >
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
