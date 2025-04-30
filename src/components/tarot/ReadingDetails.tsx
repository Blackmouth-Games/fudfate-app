import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, X } from "lucide-react";
import CompletedReading from './CompletedReading';
import { ReadingCard } from '@/types/tarot';
import CardDetailsDialog from './CardDetailsDialog';
import ShareReading from './ShareReading';

interface Reading {
  id: string;
  date: string;
  question: string;
  cards: number[] | string | any[];
  result?: string;
  response?: string;
  interpretation?: string;
  selected_cards?: ReadingCard[];
  webhookResponse?: {
    message: string;
    selected_cards: number[];
    question?: string;
  };
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

const debug = (type: 'info' | 'error' | 'warn' | 'debug', ...args: any[]) => {
  const styles = {
    info: 'color: #00b894; font-weight: bold;',
    error: 'color: #d63031; font-weight: bold;',
    warn: 'color: #fdcb6e; font-weight: bold;',
    debug: 'color: #0984e3; font-weight: bold;'
  };
  
  console.log(`%c[ReadingDetails] ${type.toUpperCase()}:`, styles[type], ...args);
};

const debugCards = (cards: ReadingCard[]) => {
  console.group('History Item Selected Cards');
  console.log('Position\tCard ID\t\tName\t\tImage Path\t\tStatus');
  console.log('─────────────────────────────────────────────────────────────────────────');
  
  cards.forEach((card, index) => {
    console.log(
      `${index + 1}\t\t${card.id}\t\t${card.name}\t\t${card.image}\t\tHistory`
    );
  });
  
  console.groupEnd();
};

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

  // Get the message in order of priority
  const getMessage = () => {
    debug('info', 'Getting message with data:', {
      webhookMessage: reading.webhookResponse?.message,
      result: reading.result,
      response: reading.response,
      interpretation: reading.interpretation
    });

    const message = reading.webhookResponse?.message || 
                   reading.result || 
                   reading.response || 
                   reading.interpretation;

    if (message && message.trim()) {
      debug('info', 'Using message:', message);
      return message;
    }
    
    debug('warn', 'No message found, using default');
    return t('tarot.noMessageAvailable');
  };

  // Get the cards to display
  const getDisplayCards = () => {
    debug('info', 'Getting display cards for history item:', {
      readingId: reading.id,
      question: reading.question,
      date: reading.date,
      viewingCards: viewingCards.map(c => ({ id: c.id, name: c.name }))
    });

    return viewingCards;
  };

  const displayCards = getDisplayCards();
  const message = getMessage();

  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-amber-800">
            {reading.webhookResponse?.question || reading.question || t('tarot.noQuestion')}
          </h3>
          <Button variant="outline" onClick={handleBackClick}>
            {t('tarot.backToHistory')}
          </Button>
        </div>
        
        <CompletedReading 
          finalMessage={message}
          selectedCards={displayCards}
          resetReading={resetReading}
          hideResetButton={true}
          onCopyToClipboard={() => onCopyToClipboard(reading)}
          onShareOnTwitter={() => onShareOnTwitter(reading)}
          source="history"
          question={reading.question}
        />
        
        <div className="hidden">
          <ShareReading 
            className="w-full"
            readingData={{
              intention: reading.question,
              selectedCards: displayCards,
              interpretation: message,
              finalMessage: message
            }}
            source="history"
          />
        </div>
        
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
