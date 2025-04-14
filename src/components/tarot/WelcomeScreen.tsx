
import React from 'react';
import { useTranslation } from 'react-i18next';
import GlitchLogo from '@/components/GlitchLogo';
import GlitchText from '@/components/GlitchText';
import WalletConnector from '@/components/wallet/WalletConnector';

const WelcomeScreen: React.FC = () => {
  const { t } = useTranslation();
  
  return (
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
};

export default WelcomeScreen;
