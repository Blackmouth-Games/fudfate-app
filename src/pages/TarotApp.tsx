
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/hooks/useEnvironment';
import WalletConnector from '@/components/wallet/WalletConnector';
import GlitchText from '@/components/GlitchText';
import IntentionForm from '@/components/tarot/IntentionForm';
import DeckSelector from '@/components/tarot/DeckSelector';
import ReadingHistory from '@/components/tarot/ReadingHistory';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from 'sonner';
import GlitchLogo from '@/components/GlitchLogo';
import Footer from '@/components/Footer';
import CommitSHA from '@/components/CommitSHA';
import DevToolPanel from '@/components/dev/DevToolPanel';
import TarotHeader from '@/components/tarot/TarotHeader';
import { fetchAvailableDecks } from '@/utils/wallet-connection-utils';
import { convertApiDeckToInternal, DeckInfo } from '@/utils/deck-utils';

const TarotApp: React.FC = () => {
  const { connected, userData } = useWallet();
  const { t } = useTranslation();
  const { webhooks, environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState('reading');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<DeckInfo[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);

  // Fetch decks when user connects
  useEffect(() => {
    if (connected && userData?.userId) {
      fetchUserDecks();
    }
  }, [connected, userData]);

  const fetchUserDecks = async () => {
    if (!userData?.userId) return;
    
    setIsLoadingDecks(true);
    try {
      const decksData = await fetchAvailableDecks(webhooks.deck, userData.userId, environment);
      
      if (Array.isArray(decksData) && decksData.length > 0) {
        // Convert API deck format to internal format
        const formattedDecks = decksData.map(deck => convertApiDeckToInternal(deck));
        setAvailableDecks(formattedDecks);
        console.log("Available decks:", formattedDecks);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error(t('errors.deckLoadFailed'), {
        position: 'bottom-center',
      });
    } finally {
      setIsLoadingDecks(false);
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    if (value === 'decks' && userData?.userId && availableDecks.length === 0) {
      await fetchUserDecks();
    } else if (value === 'history' && userData?.userId) {
      setIsLoadingHistory(true);
      try {
        console.log("Calling history webhook with userid:", userData.userId);
        const response = await fetch(webhooks.history, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: new Date().toISOString(),
            userid: userData.userId
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("History webhook response:", data);
        
        if (data && Array.isArray(data.readings)) {
          setHistoryData(data.readings);
        } else if (data && Array.isArray(data)) {
          setHistoryData(data);
        } else {
          console.warn("Unexpected history data format:", data);
          setHistoryData([]);
        }
      } catch (error) {
        console.error('Error calling history webhook:', error);
        toast.error(t('errors.historyLoadFailed'), {
          position: 'bottom-center',
        });
        setHistoryData([]);
      } finally {
        setIsLoadingHistory(false);
      }
    }
  };

  // Component to show when not connected
  const renderWelcomeScreen = () => (
    <div className="flex flex-col items-center max-w-2xl w-full mx-auto">
      <GlitchLogo 
        imageUrl="/img/logos/FUDFATE_logo.png" 
        size="large"
        className="mb-8"
      />
      
      <div className="text-center mb-8">
        <GlitchText
          text={t('tarot.cryptoFortuneAwaits')}
          className="text-3xl md:text-4xl font-bold font-pixel tracking-wider uppercase"
          goldEffect={true}
        />
      </div>
      
      <div className="flex flex-col gap-4 items-center max-w-sm w-full">
        <WalletConnector showButtons={true} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <TarotHeader 
        connected={connected} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
        {!connected ? (
          renderWelcomeScreen()
        ) : (
          <div className="max-w-4xl mx-auto my-8 w-full">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="reading" className="mt-0">
                <IntentionForm className="w-full" />
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <ReadingHistory 
                  className="w-full" 
                  readings={historyData} 
                  isLoading={isLoadingHistory} 
                />
              </TabsContent>
              
              <TabsContent value="decks" className="mt-0">
                <DeckSelector 
                  className="w-full" 
                  availableDecks={availableDecks}
                  isLoading={isLoadingDecks}
                />
              </TabsContent>
            </Tabs>
          </div>
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
    </div>
  );
};

export default TarotApp;
