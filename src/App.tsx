
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import i18n from './i18n';
import TarotApp from './pages/TarotApp';
import NotFound from './pages/NotFound';
import CookiesPolicy from './pages/CookiesPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { WalletProvider } from './contexts/WalletContext';
import { TarotProvider } from './contexts/TarotContext';
import DevTool from './components/DevTool';
import CookieConsent from './components/CookieConsent';

// Create React Query client with appropriate settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Routes configuration for DevTool
const routes = [
  { path: '/', name: 'Tarot App' },
  { path: '/cookies', name: 'Cookies Policy' },
  { path: '/privacy', name: 'Privacy Policy' },
];

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <WalletProvider>
            <TarotProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<TarotApp />} />
                  <Route path="/app" element={<Navigate to="/" replace />} />
                  <Route path="/cookies" element={<CookiesPolicy />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <DevTool routes={routes} />
                <CookieConsent />
              </Router>
              <Toaster position="bottom-center" />
            </TarotProvider>
          </WalletProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
