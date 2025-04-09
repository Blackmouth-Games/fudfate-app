
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import WalletConnector from '@/components/wallet/WalletConnector';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GlitchText from '@/components/GlitchText';
import GlitchLogo from '@/components/GlitchLogo';
import IntentionForm from '@/components/tarot/IntentionForm';
import DeckSelector from '@/components/tarot/DeckSelector';
import ReadingHistory from '@/components/tarot/ReadingHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, History, Layers } from 'lucide-react';

const TarotApp: React.FC = () => {
  const { connected, userData } = useWallet();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <img 
              src="/img/logos/FUDFATE_logo.png" 
              alt="FUDFATE" 
              className="h-12"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <WalletConnector />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {/* Hero Logo */}
        <GlitchLogo 
          imageUrl="/img/logos/FUDFATE_logo.png" 
          alt="FUDFATE Logo"
          className="my-12"
        />
        
        {/* Connect Wallet Message */}
        {!connected ? (
          <div className="text-center max-w-2xl mx-auto my-8">
            <GlitchText
              text={t('tarot.connectWalletTitle')}
              className="text-3xl font-bold mb-6 text-gray-800 font-pixel"
              goldEffect={true}
            />
            <p className="text-lg text-gray-600 max-w-md mx-auto text-center mb-8 font-pixel">
              {t('tarot.connectWalletMessage')}
            </p>
            <WalletConnector />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto my-8 w-full">
            {userData && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      User ID: <span className="font-mono text-gray-800">{userData.userId}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Readings Available: 
                      <span className={`font-bold ml-1 ${userData.runsToday ? 'text-green-600' : 'text-red-600'}`}>
                        {userData.runsToday ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Tabs defaultValue="reading" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
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
              
              <TabsContent value="reading" className="mt-0">
                <IntentionForm className="w-full" />
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <ReadingHistory className="w-full" />
              </TabsContent>
              
              <TabsContent value="decks" className="mt-0">
                <DeckSelector className="w-full" />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            FUDFATE © 2025. {t('footer.allRightsReserved')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TarotApp;
