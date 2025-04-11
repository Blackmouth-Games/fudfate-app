
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import CompletedReading from './CompletedReading';
import { ReadingCard } from '@/types/tarot';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import CardDetailsDialog from './CardDetailsDialog';

interface Reading {
  id: string;
  date: string;
  question: string;
  cards: string[];
  result: string;
  selected_cards?: any[];
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
    ? readings.map((reading: any) => ({
        id: reading.id || String(Math.random()),
        date: reading.date || new Date().toISOString().split('T')[0],
        question: reading.intention || reading.question || '',
        cards: Array.isArray(reading.cards) ? reading.cards : [],
        result: reading.result || reading.message || '',
        selected_cards: reading.selected_cards || []
      }))
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
    
    // Convert cards to ReadingCard format
    const readingCards: ReadingCard[] = reading.selected_cards?.map((card, index) => ({
      id: String(card.id || index),
      name: card.name || `Card ${index + 1}`,
      image: card.image || `/img/cards/deck_1/${index}_TheDegen.jpg`,
      description: card.description || "",
      revealed: true
    })) || [];
    
    setViewingCards(readingCards);
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
            finalMessage={selectedReading.result}
            selectedCards={viewingCards}
            resetReading={resetReading}
          />
          
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
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : formattedReadings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tarot.date')}</TableHead>
                  <TableHead>{t('tarot.question')}</TableHead>
                  <TableHead>{t('tarot.cards')}</TableHead>
                  <TableHead>{t('tarot.result')}</TableHead>
                  <TableHead>{t('tarot.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedReadings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium">{reading.date}</TableCell>
                    <TableCell>{reading.question}</TableCell>
                    <TableCell>{Array.isArray(reading.cards) ? reading.cards.join(', ') : ''}</TableCell>
                    <TableCell className="max-w-xs truncate">{reading.result}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewReading(reading)}
                      >
                        {t('tarot.view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
  );
};

export default ReadingHistory;
