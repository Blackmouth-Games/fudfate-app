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
import { useTranslation } from 'react-i18next';
import { useEnvironment } from '@/hooks/useEnvironment';

const TarotApp: React.FC = () => {
  const { connected, userData } = useWallet();
  const { t } = useTranslation();
  const { environment } = useEnvironment();
  const isDevelopment = environment === 'development';
  
  const {
    activeTab,
    historyData,
    isLoadingHistory,
    availableDecks,
    isLoadingDecks,
    handleTabChange
  } = useTarotData();

  const [showTodayReading, setShowTodayReading] = useState(false);
  const [hasLoadedReading, setHasLoadedReading] = useState(false);

  useEffect(() => {
    if (connected && historyData.length > 0 && !hasLoadedReading) {
      const today = new Date().toISOString().split('T')[0];
      
      const todayReading = historyData.find(reading => {
        try {
          const readingDate = reading.reading_date || reading.date;
          // Validate if the date is parseable
          if (!readingDate || typeof readingDate !== 'string' || isNaN(new Date(readingDate).getTime())) {
            console.warn('Invalid date format in reading:', reading);
            return false;
          }
          const formattedDate = new Date(readingDate).toISOString().split('T')[0];
          return formattedDate === today;
        } catch (error) {
          console.error('Error parsing date:', error, reading);
          return false;
        }
      });

      // If user has readings and no runs left today
      const hasNoMoreReadings = userData && !userData.runsToday;
      
      if (hasNoMoreReadings) {
        // If a reading from today exists, show it
        if (todayReading) {
          setShowTodayReading(true);
          handleTabChange('history');
        } else if (historyData.length > 0) {
          // If no reading today but has previous readings, show history
          handleTabChange('history');
        }
        setHasLoadedReading(true);
      }
    }
  }, [connected, userData, historyData, hasLoadedReading, handleTabChange]);

  // Reset the loaded flag when user disconnects
  useEffect(() => {
    if (!connected) {
      setHasLoadedReading(false);
    }
  }, [connected]);

  // Get commit SHA from environment variable
  const commitSha = import.meta.env.VITE_COMMIT_SHA || '';

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
          <TarotMainContent 
            activeTab={activeTab}
            historyData={historyData}
            isLoadingHistory={isLoadingHistory}
            availableDecks={availableDecks}
            isLoadingDecks={isLoadingDecks}
          />
        )}
      </main>

      <Footer />
      <CommitSHA sha={commitSha} />
      {isDevelopment && <DevToolPanel routes={[
        { path: '/', name: 'Home' },
        { path: '/privacy-policy', name: 'Privacy Policy' },
        { path: '/cookies-policy', name: 'Cookies Policy' }
      ]} />}
      <WalletSecurityBanner />
    </div>
  );
};

export default TarotApp;
