
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TarotApp from '@/pages/TarotApp';
import NotFound from '@/pages/NotFound';
import CookiesPolicy from '@/pages/CookiesPolicy';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import DevTool from '@/components/DevTool';

// Routes configuration for DevTool
const routes = [
  { path: '/', name: 'Tarot App' },
  { path: '/cookies', name: 'Cookies Policy' },
  { path: '/privacy', name: 'Privacy Policy' },
];

const AppRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<TarotApp />} />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="/cookies" element={<CookiesPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <DevTool routes={routes} />
    </>
  );
};

export default AppRoutes;
