
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
import NoReadingsAlert from '@/components/tarot/NoReadingsAlert';
import { useTranslation } from 'react-i18next';

const TarotApp: React.FC = () => {
  const { t } = useTranslation();
  const { connected, userData } = useWallet();
  
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
  const [todayReadingData, setTodayReadingData] = useState<any>(null);

  // Check if user has a reading from today
  useEffect(() => {
    if (connected && userData && historyData.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      
      const todayReading = historyData.find(reading => {
        const readingDate = new Date(reading.reading_date || reading.date).toISOString().split('T')[0];
        return readingDate === today;
      });
      
      if (todayReading) {
        setShowTodayReading(true);
        setTodayReadingData(todayReading);
      } else {
        setShowTodayReading(false);
        setTodayReadingData(null);
      }
    }
  }, [connected, userData, historyData]);

  // Allow navigation to decks and history even if no readings available
  const handleNavigationChange = (tab: string) => {
    handleTabChange(tab);
  };

  const handleViewHistory = () => {
    handleTabChange('history');
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <TarotHeader 
        connected={connected} 
        activeTab={activeTab} 
        onTabChange={handleNavigationChange}
      />

      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
        {!connected ? (
          <WelcomeScreen />
        ) : (
          <>
            {userData && !userData.runsToday && activeTab === 'reading' && (
              <NoReadingsAlert 
                className="mb-6" 
                showTodayReading={showTodayReading} 
                onViewHistory={handleViewHistory}
              />
            )}

            <TarotMainContent 
              activeTab={activeTab}
              historyData={historyData}
              isLoadingHistory={isLoadingHistory}
              availableDecks={availableDecks}
              isLoadingDecks={isLoadingDecks}
              todayReadingData={todayReadingData}
              showTodayReading={showTodayReading}
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
