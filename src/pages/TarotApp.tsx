
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import WalletConnector from '@/components/wallet/WalletConnector';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GlitchText from '@/components/GlitchText';
import GlitchLogo from '@/components/GlitchLogo';

const TarotApp: React.FC = () => {
  const { connected } = useWallet();
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
        <div className="text-center max-w-2xl mx-auto my-8">
          <GlitchText
            text={t('tarot.connectWalletToStart')}
            className="text-2xl font-bold mb-6 text-gray-800"
            goldEffect={true}
          />
          <p className="text-gray-600 max-w-md mx-auto text-center mb-8">
            {t('tarot.connectWalletDescription')}
          </p>
          <WalletConnector />
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
