
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Share2, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { useTarot } from '@/contexts/TarotContext';

interface ShareReadingProps {
  className?: string;
}

const ShareReading: React.FC<ShareReadingProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { intention, selectedCards, interpretation } = useTarot();

  const shareOnTwitter = () => {
    if (!interpretation) return;
    
    const cardNames = selectedCards
      .slice(0, 3)
      .map(card => card.name)
      .join(', ');
    
    const text = t('tarot.shareText', {
      cards: cardNames,
      intention: intention.length > 30 ? intention.substring(0, 30) + '...' : intention,
    });
    
    const url = 'https://app-fudfate.blackmouthgames.com/';
    const hashtags = 'FUDfate,Tarot,Crypto';
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
    
    window.open(twitterUrl, '_blank');
  };

  const copyToClipboard = () => {
    if (!interpretation) return;
    
    const cardNames = selectedCards
      .slice(0, 3)
      .map(card => card.name)
      .join(', ');
    
    const text = t('tarot.shareClipboardText', {
      cards: cardNames,
      intention: intention,
      interpretation: interpretation.summary || ''
    });
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(t('tarot.copiedToClipboard'));
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        toast.error(t('tarot.copyFailed'));
      });
  };

  if (!interpretation) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 mt-4 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="w-full sm:w-auto flex items-center gap-1.5"
      >
        <Share2 className="h-4 w-4" />
        {t('tarot.copyReading')}
      </Button>
      
      <Button
        size="sm"
        onClick={shareOnTwitter}
        className="w-full sm:w-auto flex items-center gap-1.5 bg-[#1DA1F2] hover:bg-[#0c85d0]"
      >
        <Twitter className="h-4 w-4" />
        {t('tarot.shareOnX')}
      </Button>
    </div>
  );
};

export default ShareReading;
