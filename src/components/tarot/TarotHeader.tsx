import React from 'react';
import { Sparkles, History, Layers } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import WalletBalance from '@/components/wallet/WalletBalance';
import WalletConnector from '@/components/wallet/WalletConnector';
import TokenInlineBalance from '@/components/wallet/TokenInlineBalance';
import { Link } from 'react-router-dom';
import { TOKENS_TO_SHOW } from '@/config/tokensToShow';

interface TarotHeaderProps {
  connected: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
}

const TarotHeader: React.FC<TarotHeaderProps> = ({ 
  connected, 
  activeTab, 
  onTabChange 
}) => {
  const { t } = useTranslation();

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop: todo en una línea, móvil: columnas */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-0 md:relative">
          {/* Logo y lenguaje juntos en móvil, separados en desktop */}
          <div className="flex items-center md:flex-none md:w-auto">
            <Link to="/">
              <img 
                src="/img/logos/FUDFATE_logo.png" 
                alt="FUDFATE" 
                className="h-12"
              />
            </Link>
            {/* Idioma solo visible aquí en móvil */}
            <div className="ml-2 md:hidden">
              <LanguageSwitcher />
            </div>
          </div>
          {/* Menú centrado en desktop, debajo en móvil */}
          {connected && (
            <div className="order-2 md:order-none md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex justify-center w-full md:w-auto">
              <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger 
                    value="reading" 
                    className="flex items-center"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('tarot.reading')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="flex items-center"
                  >
                    <History className="mr-2 h-4 w-4" />
                    {t('tarot.history')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="decks" 
                    className="flex items-center"
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    {t('tarot.decks')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          {/* Tokens y wallet a la derecha del menú, idioma al final en desktop */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2 md:ml-auto md:order-3">
            {connected && (
              <div className="flex flex-row items-center gap-2">
                {TOKENS_TO_SHOW.map(mint => (
                  <TokenInlineBalance key={mint} mintAddress={mint} />
                ))}
                <WalletConnector showButtons={false} />
              </div>
            )}
            {/* Idioma solo visible aquí en desktop */}
            <div className="hidden md:block md:ml-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TarotHeader;
