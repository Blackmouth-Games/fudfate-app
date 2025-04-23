import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@/contexts/WalletContext';
import WalletConnector from '@/components/wallet/WalletConnector';
import GlitchLogo from '@/components/GlitchLogo';
import GlitchText from '@/components/GlitchText';
import AnimatedSection from '@/components/AnimatedSection';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Congrats: React.FC = () => {
  const navigate = useNavigate();
  const { connected, userData } = useWallet();
  const { t } = useTranslation();

  // Redirect to index if wallet is connected and we have user data
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const bypassRedirect = searchParams.get('bypass') === 'true';
    if (connected && userData && !bypassRedirect) {
      navigate('/');
    }
  }, [connected, userData, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <AnimatedSection animation="fade-in" className="text-center max-w-md w-full mx-auto">
        {/* Logo with glitch effect */}
        <GlitchLogo 
          imageUrl="/img/logos/FUDFATE_logo.png" 
          size="large"
          className="mb-8"
        />

        {/* Web3 Tarot Experience text */}
        <h2 className="text-cyan-400 text-xl mb-12 font-pixel">
          {t('congrats.title')}
        </h2>

        {/* Join Whitelist text with glitch effect */}
        <GlitchText
          text={t('congrats.joinWhitelist')}
          className="text-2xl font-pixel mb-8"
          goldEffect={true}
          intensity="digital"
        >
          <div className="flex items-center justify-center gap-2">
            <span role="img" aria-label="rocket">🚀</span>
            <span className="text-center">{t('congrats.joinWhitelist')}</span>
            <span role="img" aria-label="moon">🌙</span>
          </div>
        </GlitchText>

        {/* Congrats text with glitch effect */}
        <GlitchText
          text={t('congrats.congratsMessage')}
          className="text-xl font-pixel mb-8"
          color="#9b87f5"
          neonEffect="purple"
        />

        {/* Stay tuned text */}
        <p className="text-gray-600 mb-12 text-center font-pixel">
          {t('congrats.stayTuned')}
        </p>

        {/* Wallet Connection */}
        <div className="flex justify-center w-full">
          <div className="w-full">
            <WalletConnector />
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Congrats; 