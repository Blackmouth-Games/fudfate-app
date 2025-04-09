
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/hooks/useEnvironment';
import WalletConnector from '@/components/wallet/WalletConnector';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GlitchText from '@/components/GlitchText';
import IntentionForm from '@/components/tarot/IntentionForm';
import DeckSelector from '@/components/tarot/DeckSelector';
import ReadingHistory from '@/components/tarot/ReadingHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, History, Layers } from 'lucide-react';
import { toast } from 'sonner';
import GlitchLogo from '@/components/GlitchLogo';

const TarotApp: React.FC = () => {
  const { connected, userData } = useWallet();
  const { t } = useTranslation();
  const { webhooks } = useEnvironment();
  const [activeTab, setActiveTab] = useState('reading');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    if (value === 'decks' && userData?.userId) {
      try {
        console.log("Calling deck webhook with userid:", userData.userId);
        // Call the deck webhook when the decks tab is selected
        const response = await fetch(webhooks.deck, {
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
        console.log('Deck webhook response:', data);
        
      } catch (error) {
        console.error('Error calling deck webhook:', error);
        toast.error(t('errors.deckLoadFailed'));
      }
    } else if (value === 'history' && userData?.userId) {
      setIsLoadingHistory(true);
      try {
        console.log("Calling history webhook with userid:", userData.userId);
        // Call the history webhook when the history tab is selected
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
        
        // Process the history data from the response
        const data = await response.json();
        console.log("History webhook response:", data);
        
        if (data && Array.isArray(data.readings)) {
          setHistoryData(data.readings);
        } else if (data && Array.isArray(data)) {
          // Handle case where the API returns an array directly
          setHistoryData(data);
        } else {
          console.warn("Unexpected history data format:", data);
          setHistoryData([]);
        }
      } catch (error) {
        console.error('Error calling history webhook:', error);
        toast.error(t('errors.historyLoadFailed'));
        setHistoryData([]);
      } finally {
        setIsLoadingHistory(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Always show the logo */}
          <div className="flex items-center">
            <img 
              src="/img/logos/FUDFATE_logo.png" 
              alt="FUDFATE" 
              className="h-12"
            />
          </div>
          
          {connected && (
            <div className="flex-grow flex justify-center">
              <Tabs 
                defaultValue="reading" 
                value={activeTab}
                onValueChange={handleTabChange}
                className="max-w-xs"
              >
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="reading" className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('tarot.reading')}
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    {t('tarot.history')}
                  </TabsTrigger>
                  <TabsTrigger value="decks" className="flex items-center">
                    <Layers className="mr-2 h-4 w-4" />
                    {t('tarot.decks')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          
          <div className="flex items-center">
            <LanguageSwitcher />
            {connected && (
              <div className="ml-3">
                <WalletConnector showButtons={false} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
        {/* Connect Wallet Message */}
        {!connected ? (
          <div className="text-center max-w-2xl mx-auto my-8">
            <GlitchLogo 
              imageUrl="/img/logos/FUDFATE_logo.png" 
              className="mb-8"
              size="large"
            />
            
            <GlitchText
              text="CRYPTO FORTUNE AWAITS"
              className="text-3xl md:text-4xl font-bold mb-6 font-pixel tracking-wider uppercase"
              goldEffect={true}
            />
            
            <p className="text-lg text-gray-600 max-w-md mx-auto text-center mb-8 font-pixel">
              {t('tarot.connectWalletMessage')}
            </p>
            
            <div className="flex flex-col gap-4 items-center max-w-sm mx-auto">
              <WalletConnector showButtons={true} />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto my-8 w-full">
            {userData && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      {t('wallet.userId')}: <span className="font-mono text-gray-800">{userData.userId || t('wallet.notAvailable')}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('tarot.readingsAvailable')}: 
                      <span className={`font-bold ml-1 ${userData.runsToday ? 'text-green-600' : 'text-red-600'}`}>
                        {userData.runsToday ? t('common.yes') : t('common.no')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                <DeckSelector className="w-full" />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Footer - Now anchored to bottom */}
      <footer className="py-6 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            FUDFATE © {new Date().getFullYear()}. {t('footer.allRightsReserved')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TarotApp;
