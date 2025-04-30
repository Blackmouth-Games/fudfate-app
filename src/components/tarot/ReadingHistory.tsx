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
import GlitchText from '@/components/GlitchText';
import '@/styles/reading-history.css';

interface Reading {
  id: string;
  date: string;
  question: string;
  cards: (number | string)[];
  result?: string;
  response?: string;
  interpretation?: string;
  selected_cards?: ReadingCard[];
  user_id?: string;
  reading_date?: string;
  webhookResponse?: {
    message: string;
    selected_cards: number[];
    question?: string;
  };
}

interface ReadingHistoryProps {
  className?: string;
  readings?: Reading[];
  isLoading?: boolean;
  resetReading?: () => void;
}

const ReadingHistory: React.FC<ReadingHistoryProps> = ({ 
  className = '', 
  readings = [], 
  isLoading = false,
  resetReading
}) => {
  const { t } = useTranslation();
  const { userData } = useWallet();
  const { resetReading: tarotResetReading } = useTarot();
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [viewingCards, setViewingCards] = useState<ReadingCard[]>([]);

  useEffect(() => {
    // Log readings data to help with debugging
    console.log("ReadingHistory - readings data:", readings);
  }, [readings]);
  
  // Format the readings data to match our expected format
  const formattedReadings: Reading[] = Array.isArray(readings) && readings.length > 0 && Object.keys(readings[0]).length > 0
    ? readings
      .map((reading: any) => {
        // Skip empty objects
        if (!reading || Object.keys(reading).length === 0) {
          return null;
        }

        let parsedCards: (number | string)[] = [];
        
        // Parse the cards array which might be a string like "[11, 0, 5]"
        if (typeof reading.cards === 'string') {
          try {
            parsedCards = JSON.parse(reading.cards);
            console.log("Parsed cards from string:", parsedCards);
          } catch (e) {
            console.error("Error parsing cards JSON:", e);
            // If parse fails, try to extract numbers from the string using regex
            const cardMatches = reading.cards.match(/\d+/g);
            if (cardMatches) {
              parsedCards = cardMatches.map(Number);
              console.log("Extracted card numbers using regex:", parsedCards);
            }
          }
        } else if (Array.isArray(reading.cards)) {
          parsedCards = reading.cards;
          console.log("Using array cards directly:", parsedCards);
        }

        // Handle webhook response data
        let webhookData = undefined;
        if (reading.webhookResponse) {
          console.log("Processing webhook response:", reading.webhookResponse);
          webhookData = {
            message: reading.webhookResponse.message || '',
            selected_cards: Array.isArray(reading.webhookResponse.selected_cards) 
              ? reading.webhookResponse.selected_cards.map(Number)
              : parsedCards,
            question: reading.webhookResponse.question || reading.question || reading.intention || ''
          };
          console.log("Processed webhook data:", webhookData);
        } else if (reading.selected_cards || reading.interpretation) {
          // If we have selected_cards or interpretation but no webhookResponse, create one
          console.log("Creating webhook data from selected_cards or interpretation");
          webhookData = {
            message: reading.interpretation || reading.result || reading.response || '',
            selected_cards: Array.isArray(reading.selected_cards) 
              ? reading.selected_cards.map(card => 
                  typeof card === 'number' ? card : parseInt(String(card), 10)
                ).filter(num => !isNaN(num))
              : parsedCards,
            question: reading.question || reading.intention || ''
          };
          console.log("Created webhook data:", webhookData);
        }
        
        const formattedReading = {
          id: reading.id || String(Math.random()),
          date: reading.reading_date || reading.date || new Date().toISOString(),
          question: reading.question || reading.intention || '',
          cards: parsedCards,
          result: reading.result || reading.message || '',
          response: reading.response || '',
          interpretation: reading.interpretation || '',
          user_id: reading.user_id || reading.userid || userData?.userId || '',
          selected_cards: reading.selected_cards || [],
          webhookResponse: webhookData
        } as Reading;

        console.log("Formatted reading:", formattedReading);
        return formattedReading;
      })
      .filter((reading): reading is NonNullable<typeof reading> => reading !== null)
      // Remove duplicates based on ID
      .filter((reading, index, self) => 
        index === self.findIndex((r) => r.id === reading.id)
      )
      .sort((a, b) => {
        // Sort by date in descending order (most recent first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
    : [];

  // Find today's reading if it exists
  const todayReading = formattedReadings.find(reading => {
    const readingDate = new Date(reading.date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return readingDate === today;
  });

  // Helper function to get card name from card ID
  const getCardName = (cardId: string | number, fallbackIndex?: number): string => {
    console.log("getCardName called with:", { cardId, fallbackIndex });
    const numericId = typeof cardId === 'string' ? parseInt(cardId, 10) : cardId;
    console.log("Converted to numericId:", numericId);
    
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
    
    const name = cardNames[numericId];
    console.log("Found name:", name);
    return name || (fallbackIndex !== undefined ? `Card ${fallbackIndex + 1}` : `Card ${numericId}`);
  };

  // Get card image path from card ID
  const getCardImagePath = (cardId: string | number): string => {
    console.log("getCardImagePath called with:", cardId);
    const numericId = typeof cardId === 'string' ? parseInt(cardId, 10) : cardId;
    console.log("Converted to numericId:", numericId);
    
    if (numericId >= 0 && numericId <= 21) {
      const path = `/img/cards/deck_1/${numericId}_${getCardName(numericId).replace(/\s+/g, '')}.jpg`;
      console.log("Generated path:", path);
      return path;
    }
    console.log("Falling back to default card");
    return '/img/cards/deck_1/0_TheDegen.jpg';
  };

  // View a reading's details
  const viewReading = (reading: Reading) => {
    console.log("=== Debug Reading Data ===");
    console.log("Full reading object:", reading);
    console.log("Webhook response:", reading.webhookResponse);
    console.log("Original cards:", reading.cards);
    console.log("Question:", reading.webhookResponse?.question || reading.question);
    
    setSelectedReading(reading);
    
    // Always try to use webhook cards first
    let cardsToUse: number[] = [];
    
    // First priority: webhook response selected_cards
    if (reading.webhookResponse?.selected_cards) {
      cardsToUse = reading.webhookResponse.selected_cards;
      console.log("Using webhook selected cards:", cardsToUse);
    }
    // Second priority: reading.cards if they are numbers
    else if (Array.isArray(reading.cards)) {
      cardsToUse = reading.cards.map(cardId => {
        if (typeof cardId === 'number') return cardId;
        if (typeof cardId === 'string') {
          const parsed = parseInt(cardId, 10);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      });
      console.log("Using reading.cards:", cardsToUse);
    }
    
    // Convert to ReadingCard format
    const readingCards: ReadingCard[] = cardsToUse.map((cardId: number) => {
      const cardName = getCardName(cardId);
      const imagePath = `/img/cards/deck_1/${cardId}_${cardName.replace(/\s+/g, '')}.jpg`;
      console.log("Creating card:", { cardId, cardName, imagePath });
      
      return {
        id: String(cardId),
        name: cardName,
        image: imagePath,
        description: "",
        revealed: true
      };
    });
    
    console.log("Final reading cards:", readingCards);
    setViewingCards(readingCards);
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
    const token = '$FDft @fudfate';
    const hashtags = 'FUDfate,Tarot,Crypto';
    
    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}&via=${encodeURIComponent(token)}`;
    
    window.open(twitterUrl, '_blank');
  };

  // Always allow viewing history, regardless of today's reading status
  return (
    <TooltipProvider>
      {selectedReading ? (
        <ReadingDetails
          reading={{
            ...selectedReading,
            question: selectedReading.webhookResponse?.question || selectedReading.question
          }}
          viewingCards={viewingCards}
          onBack={hideReading}
          onCopyToClipboard={copyToClipboard}
          onShareOnTwitter={shareOnTwitter}
          resetReading={resetReading || tarotResetReading}
          className={className}
        />
      ) : (
        <Card className="relative z-10 border-[#3ADDD9] border-2 shadow-md animate-border-glow">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <GlitchText 
                text={t('tarot.readingHistory')} 
                tag="h3"
                className="text-xl font-bold text-gray-800"
                intensity="normal"
                neonEffect="purple"
              />
            </div>

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
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Alert variant="default" className="bg-gradient-to-r from-purple-50 via-amber-50 to-pink-50 border-amber-200 animate-gradient-x">
                  <InfoIcon className="h-5 w-5 text-amber-500 animate-pulse" />
                  <AlertTitle className="text-amber-800 mb-2 font-semibold">{t('tarot.noReadingsTitle')}</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    {t('tarot.noReadingsDescription')}
                  </AlertDescription>
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
