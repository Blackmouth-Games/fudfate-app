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
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <Link to="/">
            <img 
              src="/img/logos/FUDFATE_logo.png" 
              alt="FUDFATE" 
              className="h-12"
            />
          </Link>
        </div>
        
        {connected && (
          <div className="flex-grow flex justify-center">
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
        
        <div className="flex items-center gap-3">
          {connected && (
            <div className="flex items-center gap-2">
              {TOKENS_TO_SHOW.map(mint => (
                <TokenInlineBalance key={mint} mintAddress={mint} />
              ))}
              <WalletConnector showButtons={false} />
            </div>
          )}
          {connected && <WalletBalance />}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default TarotHeader;
