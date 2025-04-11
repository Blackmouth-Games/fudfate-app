
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Share2, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { useTarot } from '@/contexts/TarotContext';
import { motion } from 'framer-motion';

interface ShareReadingProps {
  className?: string;
}

const ShareReading: React.FC<ShareReadingProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { intention, selectedCards, interpretation, finalMessage, webhookResponse } = useTarot();

  const getWebhookMessage = (): string => {
    if (finalMessage) return finalMessage;
    
    if (webhookResponse) {
      if (Array.isArray(webhookResponse) && webhookResponse.length > 0) {
        if (webhookResponse[0].message) return webhookResponse[0].message;
        
        if (webhookResponse[0].returnwebhoock) {
          try {
            const parsedData = JSON.parse(webhookResponse[0].returnwebhoock);
            if (parsedData && parsedData.message) return parsedData.message;
          } catch (e) {
            console.error("Error parsing webhook message for sharing:", e);
          }
        }
      } else if (typeof webhookResponse === 'object' && webhookResponse !== null) {
        if (webhookResponse.message) return webhookResponse.message;
        
        if (webhookResponse.returnwebhoock) {
          try {
            const parsedData = JSON.parse(webhookResponse.returnwebhoock);
            if (parsedData && parsedData.message) return parsedData.message;
          } catch (e) {
            console.error("Error parsing webhook message for sharing:", e);
          }
        }
      }
    }
    
    return interpretation?.summary || "";
  };

  const shareOnTwitter = () => {
    if (!selectedCards.length) return;
    
    const cardNames = selectedCards
      .map(card => card.name)
      .join(', ');
    
    const shareMessage = getWebhookMessage();
    
    const text = t('tarot.shareText', {
      cards: cardNames,
      intention: intention.length > 30 ? intention.substring(0, 30) + '...' : intention,
      message: shareMessage ? `"${shareMessage.substring(0, 60)}${shareMessage.length > 60 ? '...' : ''}"` : ''
    });
    
    const url = 'https://app-fudfate.blackmouthgames.com/';
    const hashtags = 'FUDfate,Tarot,Crypto';
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
    
    window.open(twitterUrl, '_blank');
  };

  const copyToClipboard = () => {
    if (!selectedCards.length) return;
    
    const cardNames = selectedCards
      .map(card => card.name)
      .join(', ');
    
    const shareMessage = getWebhookMessage();
    
    const text = t('tarot.shareClipboardText', {
      cards: cardNames,
      intention: intention,
      interpretation: shareMessage || ''
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

  return (
    <motion.div 
      className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <Button
        variant="outline"
        onClick={copyToClipboard}
        className="w-full sm:w-auto flex items-center gap-2 border-amber-300 hover:bg-amber-50"
      >
        <Share2 className="h-4 w-4" />
        {t('tarot.copyReading')}
      </Button>
      
      <Button
        onClick={shareOnTwitter}
        className="w-full sm:w-auto flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#0c85d0]"
      >
        <Twitter className="h-4 w-4" />
        {t('tarot.shareOnX')}
      </Button>
    </motion.div>
  );
};

export default ShareReading;
