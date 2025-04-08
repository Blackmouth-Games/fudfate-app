
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
import GlitchText from '@/components/GlitchText';

const TarotApp: React.FC = () => {
  const { phase } = useTarot();
  const { connected } = useWallet();
  const { t } = useTranslation();

  // Render the appropriate component based on the current phase
  const renderPhaseContent = () => {
    if (!connected) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <img 
            src="/lovable-uploads/883079be-f153-495c-a79e-7d1b25786a25.png" 
            alt="Tarot Card" 
            className="w-40 h-auto mb-8"
          />
          <GlitchText
            text={t('tarot.connectWalletToStart')}
            className="text-2xl font-bold mb-6 text-gray-800"
            goldEffect={true}
          />
          <p className="text-gray-600 max-w-md text-center mb-8">
            {t('tarot.connectWalletDescription')}
          </p>
          <WalletConnector />
        </div>
      );
    }

    switch (phase) {
      case 'intention':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IntentionForm />
            <DeckSelector />
          </div>
        );
      case 'preparing':
        return <PreparingReading className="max-w-2xl mx-auto" />;
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
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/57f2c984-3c67-4d32-9e32-2e326ad6a137.png" 
              alt="FUDFATE" 
              className="h-12"
            />
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-gray-800">
            <GlitchText text={t('tarot.appTitle')} goldEffect={true} />
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('tarot.appDescription')}
          </p>
        </div>
        
        {/* Reading Content */}
        <div className="max-w-4xl mx-auto">
          {renderPhaseContent()}
        </div>
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
