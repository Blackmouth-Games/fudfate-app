
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import useTarotData from '@/hooks/useTarotData';
import TarotHeader from '@/components/tarot/TarotHeader';
import WelcomeScreen from '@/components/tarot/WelcomeScreen';
import TarotMainContent from '@/components/tarot/TarotMainContent';
import Footer from '@/components/Footer';
import CommitSHA from '@/components/CommitSHA';
import DevToolPanel from '@/components/dev/DevToolPanel';
import WalletSecurityBanner from '@/components/wallet/WalletSecurityBanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Twitter, Discord } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const TarotApp: React.FC = () => {
  const { connected, userData } = useWallet();
  const { t } = useTranslation();
  
  // Use the custom hook for data fetching and tab state
  const {
    activeTab,
    historyData,
    isLoadingHistory,
    availableDecks,
    isLoadingDecks,
    handleTabChange
  } = useTarotData();

  const [showTodayReading, setShowTodayReading] = useState(false);

  // Check if user has a reading from today
  useEffect(() => {
    if (connected && userData && !userData.runsToday && historyData.length > 0) {
      // Find today's reading if it exists
      const today = new Date().toISOString().split('T')[0];
      
      const todayReading = historyData.find(reading => {
        const readingDate = new Date(reading.reading_date || reading.date).toISOString().split('T')[0];
        return readingDate === today;
      });
      
      setShowTodayReading(!!todayReading);
      
      // If we have a reading from today, switch to history tab
      if (todayReading && activeTab !== 'history') {
        handleTabChange('history');
      }
    }
  }, [connected, userData, historyData, activeTab]);

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <TarotHeader 
        connected={connected} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
        {!connected ? (
          <WelcomeScreen />
        ) : (
          <>
            {userData && !userData.runsToday && !showTodayReading && (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <InfoIcon className="h-4 w-4 text-amber-800" />
                <AlertTitle className="text-amber-800">
                  {t('tarot.readingsExhausted')}
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  <p className="mb-2">
                    {t('tarot.readingsExhaustedDescription')}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Twitter className="h-3 w-3" />
                      <span>@FUDfate</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Discord className="h-3 w-3" />
                      <span>Discord</span>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <TarotMainContent 
              activeTab={activeTab}
              historyData={historyData}
              isLoadingHistory={isLoadingHistory}
              availableDecks={availableDecks}
              isLoadingDecks={isLoadingDecks}
            />
          </>
        )}
      </main>

      <Footer />
      <CommitSHA />
      <DevToolPanel 
        routes={[
          { path: '/', name: 'Home' },
          { path: '/privacy-policy', name: 'Privacy Policy' },
          { path: '/cookies-policy', name: 'Cookies Policy' }
        ]}
      />
      <WalletSecurityBanner />
    </div>
  );
};

export default TarotApp;
