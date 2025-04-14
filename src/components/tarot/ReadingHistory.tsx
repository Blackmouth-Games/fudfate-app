
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
}

const ReadingHistory: React.FC<ReadingHistoryProps> = ({ 
  className = '', 
  readings = [], 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const { userData } = useWallet();
  const { resetReading } = useTarot();
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [viewingCards, setViewingCards] = useState<ReadingCard[]>([]);

  useEffect(() => {
    // Log readings data to help with debugging
    console.log("ReadingHistory - readings data:", readings);
  }, [readings]);
  
  // Format the readings data to match our expected format
  const formattedReadings: Reading[] = readings && readings.length > 0 
    ? readings.map((reading: any) => {
        let parsedCards: number[] = [];
        
        // Parse the cards array which might be a string like "[11, 0, 5]"
        if (typeof reading.cards === 'string') {
          try {
            parsedCards = JSON.parse(reading.cards);
          } catch (e) {
            console.error("Error parsing cards JSON:", e);
            // If parse fails, try to extract numbers from the string using regex
            const cardMatches = reading.cards.match(/\d+/g);
            if (cardMatches) {
              parsedCards = cardMatches.map(Number);
            }
          }
        } else if (Array.isArray(reading.cards)) {
          parsedCards = reading.cards;
        }
        
        return {
          id: reading.id || String(Math.random()),
          date: reading.reading_date || reading.date || new Date().toISOString(),
          question: reading.question || reading.intention || '',
          cards: parsedCards,
          result: reading.result || reading.message || '',
          response: reading.response || '',
          user_id: reading.user_id || reading.userid || userData?.userId || '',
          selected_cards: reading.selected_cards || []
        };
      })
    : [];

  // Find today's reading if it exists
  const todayReading = formattedReadings.find(reading => {
    const readingDate = new Date(reading.date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return readingDate === today;
  });

  // Helper function to get card name from card ID
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

  // Get card image path from card ID
  const getCardImagePath = (cardId: number): string => {
    if (cardId >= 0 && cardId <= 21) {
      return `/img/cards/deck_1/${cardId}_${getCardName(cardId, 0).replace(/\s+/g, '')}.jpg`;
    }
    return '/img/cards/deck_1/0_TheDegen.jpg';
  };

  // View a reading's details
  const viewReading = (reading: Reading) => {
    setSelectedReading(reading);
    
    // Convert cards array to ReadingCard format
    const readingCards: ReadingCard[] = Array.isArray(reading.cards) 
      ? reading.cards.map((cardId, index) => {
          let cardNumber: number;
          
          // Handle different card ID types
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
            image: `/img/cards/deck_1/${cardNumber}_${getCardName(cardNumber, index).replace(/\s+/g, '')}.jpg`,
            description: "",
            revealed: true
          };
        })
      : [];
    
    setViewingCards(readingCards);
    console.log("Set viewing cards to:", readingCards);
  };

  // Hide the selected reading view and allow going back to history
  const hideReading = () => {
    setSelectedReading(null);
    setViewingCards([]);
  };

  // Implementation of the missing functions
  const copyToClipboard = (reading: Reading) => {
    if (!reading) return;
    
    const cardIds = Array.isArray(reading.cards) ? reading.cards : [];
    const cardNames = cardIds.map((cardId, index) => {
      return getCardName(
        typeof cardId === 'number' ? cardId : 
        typeof cardId === 'string' ? parseInt(cardId, 10) : index, 
        index
      );
    }).join(', ');
    
    let shareMessage = reading.result || reading.response || '';
    
    // Truncate if too long
    if (shareMessage.length > 280) {
      shareMessage = shareMessage.substring(0, 277) + '...';
    }
    
    const text = t('tarot.shareClipboardText', {
      cards: cardNames,
      intention: reading.question || '',
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

  const shareOnTwitter = (reading: Reading) => {
    if (!reading) return;
    
    const cardIds = Array.isArray(reading.cards) ? reading.cards : [];
    const cardNames = cardIds.map((cardId, index) => {
      return getCardName(
        typeof cardId === 'number' ? cardId : 
        typeof cardId === 'string' ? parseInt(cardId, 10) : index, 
        index
      );
    }).join(', ');
    
    let shareMessage = reading.result || reading.response || '';
    const maxMsgLength = 180; // Allow room for the URL, hashtags, and token
    
    // Truncate message if needed
    if (shareMessage.length > maxMsgLength) {
      shareMessage = shareMessage.substring(0, maxMsgLength) + '...';
    }
    
    const intention = reading.question || '';
    const formattedIntention = intention.length > 30 ? intention.substring(0, 30) + '...' : intention;
    
    const text = t('tarot.shareText', {
      cards: cardNames,
      intention: formattedIntention,
      message: shareMessage ? `"${shareMessage}"` : ''
    });
    
    const url = 'https://app.fudfate.xyz/';
    const token = '$FDft';
    const hashtags = 'FUDfate,Tarot,Crypto';
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}&via=${encodeURIComponent(token)}`;
    
    window.open(twitterUrl, '_blank');
  };

  // Always allow viewing history, regardless of today's reading status
  return (
    <TooltipProvider>
      {selectedReading ? (
        <ReadingDetails
          reading={selectedReading}
          viewingCards={viewingCards}
          onBack={hideReading}
          onCopyToClipboard={copyToClipboard}
          onShareOnTwitter={shareOnTwitter}
          resetReading={resetReading}
          className={className}
        />
      ) : (
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
      )}
    </TooltipProvider>
  );
};

export default ReadingHistory;
