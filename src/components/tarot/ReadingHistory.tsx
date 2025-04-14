
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Share2, Twitter } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CompletedReading from './CompletedReading';
import { ReadingCard } from '@/types/tarot';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import CardDetailsDialog from './CardDetailsDialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false);
  const [selectedCardDetails, setSelectedCardDetails] = useState<any>(null);
  
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
  };

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

  // View card details
  const viewCardDetails = (card: any) => {
    setSelectedCardDetails(card);
    setIsCardDetailsOpen(true);
  };

  // Hide the selected reading view
  const hideReading = () => {
    setSelectedReading(null);
    setViewingCards([]);
  };

  // Check if user has no more readings for today
  const hasNoMoreReadingsToday = userData && !userData.runsToday;

  // If the user has no more readings today but has a reading from today, show it
  if (hasNoMoreReadingsToday && todayReading && !selectedReading) {
    viewReading(todayReading);
  }

  // Share reading functions
  const shareOnTwitter = (reading: Reading) => {
    const cardIds = Array.isArray(reading.cards) ? 
      reading.cards.map(c => {
        if (typeof c === 'number') return c;
        if (typeof c === 'string') return parseInt(c, 10);
        return 0; // Default value if parsing fails
      }) : [];
    
    const cardNames = cardIds.map(id => getCardName(id, 0)).join(', ');
    
    const text = t('tarot.shareText', {
      cards: cardNames,
      intention: reading.question && reading.question.length > 30 
        ? reading.question.substring(0, 30) + '...' 
        : reading.question || '',
      message: reading.result 
        ? `"${reading.result.substring(0, 60)}${reading.result.length > 60 ? '...' : ''}"` 
        : ''
    });
    
    const url = 'https://app-fudfate.blackmouthgames.com/';
    const hashtags = 'FUDfate,Tarot,Crypto';
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
    
    window.open(twitterUrl, '_blank');
  };

  const copyToClipboard = (reading: Reading) => {
    const cardIds = Array.isArray(reading.cards) ? 
      reading.cards.map(c => {
        if (typeof c === 'number') return c;
        if (typeof c === 'string') return parseInt(c, 10);
        return 0; // Default value if parsing fails
      }) : [];
    
    const cardNames = cardIds.map(id => getCardName(id, 0)).join(', ');
    
    const text = t('tarot.shareClipboardText', {
      cards: cardNames,
      intention: reading.question || '',
      interpretation: reading.result || reading.response || ''
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

  // If we're viewing a reading, show the completed reading view
  if (selectedReading) {
    return (
      <Card className={`border-amber-400/50 shadow-md ${className}`}>
        <CardContent className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-amber-800">
              {selectedReading.question || t('tarot.noQuestion')}
            </h3>
            <Button variant="outline" onClick={hideReading}>
              {t('tarot.backToHistory')}
            </Button>
          </div>
          
          <CompletedReading 
            finalMessage={selectedReading.result || selectedReading.response || t('tarot.noMessageAvailable')}
            selectedCards={viewingCards}
            resetReading={resetReading}
            hideResetButton={true}
          />
          
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(selectedReading)}
              className="w-full sm:w-auto flex items-center gap-2 border-amber-300 hover:bg-amber-50"
            >
              <Share2 className="h-4 w-4" />
              {t('tarot.copyReading')}
            </Button>
            
            <Button
              onClick={() => shareOnTwitter(selectedReading)}
              className="w-full sm:w-auto flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#0c85d0]"
            >
              <Twitter className="h-4 w-4" />
              {t('tarot.shareOnX')}
            </Button>
          </div>
          
          <CardDetailsDialog 
            open={isCardDetailsOpen} 
            onOpenChange={setIsCardDetailsOpen}
            cardDetails={selectedCardDetails}
          />
        </CardContent>
      </Card>
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
                {formattedReadings.slice(0, 7).map((reading) => {
                  const formattedDate = new Date(reading.date).toLocaleDateString();
                  
                  const cardIds = Array.isArray(reading.cards) ? 
                    reading.cards.map(c => {
                      if (typeof c === 'number') return c;
                      if (typeof c === 'string') return parseInt(c, 10);
                      return 0; // Default value if parsing fails
                    }) : [];
                  
                  return (
                    <div 
                      key={reading.id} 
                      className="border border-amber-200 rounded-lg p-4 hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-amber-800">{formattedDate}</h4>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewReading(reading)}
                            >
                              {t('tarot.view')}
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(reading)}
                              title={t('tarot.copyReading')}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => shareOnTwitter(reading)}
                              title={t('tarot.shareOnX')}
                              className="text-[#1DA1F2]"
                            >
                              <Twitter className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="font-medium text-gray-700">
                          {reading.question || t('tarot.noQuestion')}
                        </p>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-1">{t('tarot.cards')}:</p>
                          <div className="flex overflow-x-auto pb-2 gap-1">
                            {cardIds.map((cardId, index) => (
                              <HoverCard key={`${reading.id}-card-${index}`}>
                                <HoverCardTrigger asChild>
                                  <div className="w-8 h-12 shrink-0 cursor-pointer history-card">
                                    <AspectRatio ratio={5/8}>
                                      <img 
                                        src={getCardImagePath(cardId)} 
                                        alt={`Card ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          console.warn(`Failed to load card image: ${getCardImagePath(cardId)}`);
                                          (e.target as HTMLImageElement).src = '/img/cards/deck_1/0_TheDegen.jpg';
                                        }}
                                      />
                                    </AspectRatio>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="p-0 hover-card-content w-40">
                                  <div className="w-40 h-64">
                                    <AspectRatio ratio={5/8}>
                                      <img 
                                        src={getCardImagePath(cardId)} 
                                        alt={`Card ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </AspectRatio>
                                  </div>
                                  <div className="p-2 text-center bg-amber-50">
                                    <p className="text-sm font-medium text-amber-800">
                                      {getCardName(cardId, index)}
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-1">{t('tarot.response')}:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {reading.result || reading.response || 
                             <span className="text-gray-400 italic">{t('tarot.noResponse')}</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
