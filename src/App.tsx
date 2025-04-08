
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import i18n from './i18n';
import TarotApp from './pages/TarotApp';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { WalletProvider } from './contexts/WalletContext';
import { TarotProvider } from './contexts/TarotContext';
import DevTool from './components/DevTool';

// Create React Query client
const queryClient = new QueryClient();

// Routes configuration for DevTool
const routes = [
  { path: '/', name: 'Home' },
  { path: '/app', name: 'Tarot App' },
];

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <WalletProvider>
          <TarotProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/app" element={<TarotApp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <DevTool routes={routes} />
            </Router>
            <Toaster position="top-center" />
          </TarotProvider>
        </WalletProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
