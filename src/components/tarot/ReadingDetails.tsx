import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, X } from "lucide-react";
import CompletedReading from './CompletedReading';
import { ReadingCard } from '@/types/tarot';
import CardDetailsDialog from './CardDetailsDialog';

interface Reading {
  id: string;
  date: string;
  question: string;
  cards: number[] | string | any[];
  result?: string;
  response?: string;
}

interface ReadingDetailsProps {
  reading: Reading;
  viewingCards: ReadingCard[];
  onBack: () => void;
  onCopyToClipboard: (reading: Reading) => void;
  onShareOnTwitter: (reading: Reading) => void;
  resetReading: () => void;
  className?: string;
}

const ReadingDetails: React.FC<ReadingDetailsProps> = ({
  reading,
  viewingCards,
  onBack: handleBackClick,
  onCopyToClipboard,
  onShareOnTwitter,
  resetReading,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isCardDetailsOpen, setIsCardDetailsOpen] = React.useState(false);
  const [selectedCardDetails, setSelectedCardDetails] = React.useState<ReadingCard | null>(null);
  
  // View card details
  const viewCardDetails = (card: any) => {
    setSelectedCardDetails(card);
    setIsCardDetailsOpen(true);
  };
  
  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-amber-800">
            {reading.question || t('tarot.noQuestion')}
          </h3>
          <Button variant="outline" onClick={handleBackClick}>
            {t('tarot.backToHistory')}
          </Button>
        </div>
        
        <CompletedReading 
          finalMessage={reading.result || reading.response || t('tarot.noMessageAvailable')}
          selectedCards={viewingCards}
          resetReading={resetReading}
          hideResetButton={true}
        />
        
        <CardDetailsDialog 
          open={isCardDetailsOpen} 
          onOpenChange={setIsCardDetailsOpen}
          cardDetails={selectedCardDetails}
        />
      </CardContent>
    </Card>
  );
};

export default ReadingDetails;
