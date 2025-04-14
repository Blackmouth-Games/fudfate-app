
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReadingCard } from '@/types/tarot';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';
import ReadingListItem from './ReadingListItem';
import ReadingDetails from './ReadingDetails';

interface Reading {
  id: string;
  date: string;
  question: string;
  cards: number[] | string | any[];
  result?: string;
  response?: string;
  selected_cards?: any[];
  user_id?: string;
  reading_date?: string;
}

interface ReadingHistoryProps {
  className?: string;
  readings?: any[];
  isLoading?: boolean;
  todayReadingData?: any;
  showTodayReading?: boolean;
}

const ReadingHistory: React.FC<ReadingHistoryProps> = ({ 
  className = '', 
  readings = [], 
  isLoading = false,
  todayReadingData,
  showTodayReading = false
}) => {
  const { t } = useTranslation();
  const { userData } = useWallet();
  const { resetReading } = useTarot();
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [viewingCards, setViewingCards] = useState<ReadingCard[]>([]);

  useEffect(() => {
    console.log("ReadingHistory - readings data:", readings);
  }, [readings]);
  
  // Helper function to safely create a Date object
  const safeParseDate = (dateStr: string | undefined | null): Date | null => {
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      // Check if date is valid by testing if it's NaN
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch (e) {
      console.error("Error parsing date:", e, dateStr);
      return null;
    }
  };
  
  const formattedReadings: Reading[] = readings && readings.length > 0 
    ? readings.map((reading: any) => {
        let parsedCards: number[] = [];
        
        if (typeof reading.cards === 'string') {
          try {
            parsedCards = JSON.parse(reading.cards);
          } catch (e) {
            console.error("Error parsing cards JSON:", e);
            const cardMatches = reading.cards.match(/\d+/g);
            if (cardMatches) {
              parsedCards = cardMatches.map(Number);
            }
          }
        } else if (Array.isArray(reading.cards)) {
          parsedCards = reading.cards;
        }
        
        // Safely parse date, use current date as fallback if invalid
        const readingDate = safeParseDate(reading.reading_date || reading.date) || new Date();
        
        return {
          id: reading.id || String(Math.random()),
          date: readingDate.toISOString(),
          question: reading.question || reading.intention || '',
          cards: parsedCards,
          result: reading.result || reading.message || '',
          response: reading.response || '',
          user_id: reading.user_id || reading.userid || userData?.userId || '',
          selected_cards: reading.selected_cards || []
        };
      })
    : [];

  const todayReading = React.useMemo(() => {
    if (todayReadingData) {
      return todayReadingData;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    return formattedReadings.find(reading => {
      try {
        const readingDate = new Date(reading.date).toISOString().split('T')[0];
        return readingDate === today;
      } catch (e) {
        console.error("Error comparing dates:", e, reading.date);
        return false;
      }
    });
  }, [formattedReadings, todayReadingData]);

  const getCardName = (cardId: number, fallbackIndex: number): string => {
    const cardNames: Record<number, string> = {
      0: "The Degen",
      1: "The Miner",
      2: "The Oracle",
      3: "The Whale",
      4: "The Exchange",
      5: "The WhitePaper",
      6: "The Fork",
      7: "The Launchpad",
      8: "The SmartContract",
      9: "The PrivateKey",
      10: "The Airdrop",
      11: "The Holdler",
      12: "The Stablecoin",
      13: "The Rugpull",
      14: "The Wallet",
      15: "The FOMO",
      16: "The Hacker",
      17: "The NFT",
      18: "The Moon",
      19: "The Memecoin",
      20: "The Halving",
      21: "The DAO"
    };
    
    return cardNames[cardId] || `Card ${fallbackIndex + 1}`;
  };

  const getCardImagePath = (cardId: number): string => {
    if (cardId >= 0 && cardId <= 21) {
      return `/img/cards/deck_1/${cardId}_${getCardName(cardId, 0).replace(/\s+/g, '')}.jpg`;
    }
    return '/img/cards/deck_1/0_TheDegen.jpg';
  };

  const viewReading = (reading: Reading) => {
    console.log("Viewing reading:", reading);
    setSelectedReading(reading);
    
    const readingCards: ReadingCard[] = Array.isArray(reading.cards) 
      ? reading.cards.map((cardId, index) => {
          let cardNumber: number;
          
          if (typeof cardId === 'number') {
            cardNumber = cardId;
          } else if (typeof cardId === 'string') {
            cardNumber = parseInt(cardId, 10);
            if (isNaN(cardNumber)) cardNumber = index;
          } else {
            cardNumber = index;
          }
              
          return {
            id: String(cardNumber),
            name: getCardName(cardNumber, index),
            image: getCardImagePath(cardNumber),
            description: "",
            revealed: true
          };
        })
      : [];
    
    setViewingCards(readingCards);
    console.log("Set viewing cards to:", readingCards);
  };

  const hideReading = () => {
    console.log("Hiding reading details");
    setSelectedReading(null);
    setViewingCards([]);
  };

  const hasNoMoreReadingsToday = userData && !userData.runsToday;

  useEffect(() => {
    if (hasNoMoreReadingsToday && (todayReading || showTodayReading) && !selectedReading) {
      if (todayReading) {
        viewReading(todayReading);
      }
    }
  }, [todayReading, hasNoMoreReadingsToday, selectedReading, showTodayReading]);

  const shareOnTwitter = (reading: Reading) => {
    const cardIds = Array.isArray(reading.cards) ? 
      reading.cards.map(c => {
        if (typeof c === 'number') return c;
        if (typeof c === 'string') return parseInt(c, 10);
        return 0;
      }) : [];
    
    const cardNames = cardIds.map(id => getCardName(id, 0)).join(', ');
    
    let message = reading.result || reading.response || '';
    const maxMsgLength = 180;
    if (message.length > maxMsgLength) {
      message = message.substring(0, maxMsgLength) + '...';
    }
    
    const text = t('tarot.shareText', {
      cards: cardNames,
      intention: reading.question && reading.question.length > 30 
        ? reading.question.substring(0, 30) + '...' 
        : reading.question || '',
      message: message ? `"${message}"` : ''
    });
    
    const url = 'https://app.fudfate.xyz/';
    const token = '$FDft';
    const hashtags = 'FUDfate,Tarot,Crypto';
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}&via=${encodeURIComponent(token)}`;
    
    window.open(twitterUrl, '_blank');
  };

  const copyToClipboard = (reading: Reading) => {
    const cardIds = Array.isArray(reading.cards) ? 
      reading.cards.map(c => {
        if (typeof c === 'number') return c;
        if (typeof c === 'string') return parseInt(c, 10);
        return 0;
      }) : [];
    
    const cardNames = cardIds.map(id => getCardName(id, 0)).join(', ');
    
    let message = reading.result || reading.response || '';
    const maxMsgLength = 280;
    if (message.length > maxMsgLength) {
      message = message.substring(0, maxMsgLength) + '...';
    }
    
    const text = t('tarot.shareClipboardText', {
      cards: cardNames,
      intention: reading.question || '',
      interpretation: message
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

  if (selectedReading) {
    return (
      <ReadingDetails
        reading={selectedReading}
        viewingCards={viewingCards}
        onBack={hideReading}
        onCopyToClipboard={copyToClipboard}
        onShareOnTwitter={shareOnTwitter}
        resetReading={resetReading}
        className={className}
      />
    );
  }

  return (
    <TooltipProvider>
      <Card className={`border-amber-400/50 shadow-md ${className}`}>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-amber-800 mb-4">
            {t('tarot.readingHistory')}
          </h3>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : formattedReadings.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {formattedReadings.slice(0, 7).map((reading) => (
                  <ReadingListItem
                    key={reading.id}
                    reading={reading}
                    onView={viewReading}
                    onShare={copyToClipboard}
                    onTwitterShare={shareOnTwitter}
                    getCardName={getCardName}
                    getCardImagePath={getCardImagePath}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-6">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>{t('tarot.noReadingsTitle')}</AlertTitle>
                <AlertDescription>{t('tarot.noReadingsAvailable')}</AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ReadingHistory;
