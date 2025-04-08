
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import i18n from './i18n';
import TarotApp from './pages/TarotApp';
import NotFound from './pages/NotFound';
import { WalletProvider } from './contexts/WalletContext';
import { TarotProvider } from './contexts/TarotContext';

// Create React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <WalletProvider>
          <TarotProvider>
            <Router>
              <Routes>
                <Route path="/" element={<TarotApp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster richColors position="top-center" />
          </TarotProvider>
        </WalletProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
