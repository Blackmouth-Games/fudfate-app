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
import DevToolPanel from '@/components/dev/DevToolPanel';
import CookieConsent from './components/CookieConsent';
import AppRoutes from './routes/AppRoutes';
import CursorParticles from './components/CursorParticles';
import NewsBar from './components/NewsBar';

// Create React Query client with appropriate settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <WalletProvider>
            <TarotProvider>
              <CursorParticles />
              <NewsBar />
              <Router>
                <AppRoutes />
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
