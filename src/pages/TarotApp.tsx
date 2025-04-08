
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTarot, ReadingPhase } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import WalletConnector from '@/components/wallet/WalletConnector';
import DeckSelector from '@/components/tarot/DeckSelector';
import IntentionForm from '@/components/tarot/IntentionForm';
import PreparingReading from '@/components/tarot/PreparingReading';
import CardSelection from '@/components/tarot/CardSelection';
import CardReading from '@/components/tarot/CardReading';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Separator } from '@/components/ui/separator';

const TarotApp: React.FC = () => {
  const { phase } = useTarot();
  const { connected } = useWallet();
  const { t } = useTranslation();

  // Render the appropriate component based on the current phase
  const renderPhaseContent = () => {
    switch (phase) {
      case 'intention':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IntentionForm />
            <DeckSelector />
          </div>
        );
      case 'preparing':
        return <PreparingReading />;
      case 'selection':
        return <CardSelection />;
      case 'reading':
      case 'complete':
        return <CardReading />;
      default:
        return <IntentionForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131822] to-[#0a0a16] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">
              FUDFATE
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <WalletConnector />
            <LanguageSwitcher className="text-sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* App Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600">
            {t('tarot.appTitle')}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {t('tarot.appDescription')}
          </p>
        </div>

        {/* Connection Status */}
        {!connected && phase === 'intention' && (
          <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-lg mb-8 text-center">
            <p>{t('tarot.connectWalletMessage')}</p>
          </div>
        )}
        
        {/* Reading Content */}
        <div className="max-w-4xl mx-auto">
          {renderPhaseContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-purple-500/20 bg-black/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            FUDFATE © 2025. {t('footer.allRightsReserved')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TarotApp;
