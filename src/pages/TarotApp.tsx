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
import CookieConsent from '@/components/CookieConsent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, History, Layers } from 'lucide-react';
import { toast } from 'sonner';
import GlitchLogo from '@/components/GlitchLogo';
import Footer from '@/components/Footer';

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
        toast.error(t('errors.deckLoadFailed'), {
          position: 'bottom-center',
        });
      }
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

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <a 
              href="https://app-fudfate.blackmouthgames.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img 
                src="/img/logos/FUDFATE_logo.png" 
                alt="FUDFATE" 
                className="h-12"
              />
            </a>
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

      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
        {!connected ? (
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
        ) : (
          <div className="max-w-4xl mx-auto my-8 w-full">
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

      <Footer />
      
      <CookieConsent />
    </div>
  );
};

export default TarotApp;
