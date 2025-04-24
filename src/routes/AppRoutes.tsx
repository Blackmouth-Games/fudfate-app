import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TarotApp from '@/pages/TarotApp';
import NotFound from '@/pages/NotFound';
import CookiesPolicy from '@/pages/CookiesPolicy';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Congrats from '@/pages/Congrats';
import DevToolPanel from '@/components/dev/DevToolPanel';
import { useEnvironment } from '@/hooks/useEnvironment';

// Routes configuration for DevTool
const routes = [
  { path: '/', name: 'Tarot App' },
  { path: '/congrats', name: 'Congrats' },
  { path: '/cookies', name: 'Cookies Policy' },
  { path: '/privacy', name: 'Privacy Policy' },
];

const AppRoutes: React.FC = () => {
  const { environment } = useEnvironment();
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.port === '8080';

  return (
    <>
      <Routes>
        <Route path="/" element={<TarotApp />} />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="/congrats" element={<Congrats />} />
        <Route path="/cookies" element={<CookiesPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {isDevelopment && <DevToolPanel routes={routes} />}
    </>
  );
};

export default AppRoutes;
