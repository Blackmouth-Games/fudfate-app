
import React from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import { useEnvironment } from '@/hooks/useEnvironment';

interface IntentionFormProps {
  className?: string;
}

const IntentionForm: React.FC<IntentionFormProps> = ({ className = '' }) => {
  const { intention, setIntention, startReading, loading, setSelectedCards, setFinalMessage } = useTarot();
  const { connected, userData } = useWallet();
  const { t } = useTranslation();
  const { webhooks } = useEnvironment();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      toast.error(t('tarot.connectWalletFirst'));
      return;
    }
    
    if (!intention.trim()) {
      toast.error(t('tarot.enterIntention'));
      return;
    }

    if (!userData?.userId) {
      toast.error("User ID not available. Please reconnect your wallet.");
      return;
    }
    
    // Check if the user has already done a reading today
    if (userData.runsToday === false) {
      toast.error("You have already done a reading today. Please come back tomorrow.");
      return;
    }
    
    try {
      // Call the reading webhook
      const response = await fetch(webhooks.reading, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: userData.userId,
          question: intention,
          runs_today: userData.runsToday
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Webhook response:", data);
      
      // Process the received data for tarot reading
      if (data.message) {
        setFinalMessage(data.message);
        
        // Process selected_cards if they are returned from the webhook
        if (Array.isArray(data.selected_cards) && data.selected_cards.length > 0) {
          // Get cards from the deck based on the selected card indices
          import('@/data/tarotCards').then(({ default: tarotCards }) => {
            const selectedDeckCards = tarotCards.filter(card => card.deck === 'deck1');
            
            // Map the received card indices to actual card objects
            const processedCards = data.selected_cards.map((cardIndex: number) => {
              const card = selectedDeckCards[cardIndex] || {
                id: `card-${cardIndex}`,
                name: `Card ${cardIndex}`,
                image: `/img/cards/carddeck1/deck1_${cardIndex}_TheDegen.png`,
                description: "No description available"
              };
              
              return {
                id: card.id || `card-${cardIndex}`,
                name: card.name || `Card ${cardIndex}`,
                image: card.image || `/img/cards/carddeck1/deck1_${cardIndex}_TheDegen.png`,
                interpretation: "The cosmic energies are aligning with your question.",
                revealed: true
              };
            });
            
            setSelectedCards(processedCards);
          });
        } else if (data.cards) {
          // Fallback to previous format for backward compatibility
          const processedCards = data.cards.map((card: any, index: number) => ({
            id: card.id || `card-${index}`,
            name: card.name || `Card ${index + 1}`,
            image: card.image || `/img/cards/carddeck1/deck1_${index}_TheDegen.png`,
            interpretation: card.interpretation || "No interpretation available",
            revealed: true
          }));
          
          setSelectedCards(processedCards);
        }
        
        // Continue with the tarot reading flow
        await startReading();
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error fetching tarot reading:", error);
      toast.error("Failed to get your tarot reading. Please try again.");
      
      // Fall back to the regular reading process if the webhook fails
      await startReading();
    }
  };

  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-center text-gray-800">
              <GlitchText text={t('tarot.askTheTarot')} />
            </h3>
            <p className="text-gray-600 text-sm text-center">
              {t('tarot.focusOnQuestion')}
            </p>
          </div>
          
          <Input
            value={intention}
            onChange={(e) => {
              // Limit to 160 characters
              if (e.target.value.length <= 160) {
                setIntention(e.target.value);
              }
            }}
            placeholder={t('tarot.questionPlaceholder')}
            className="border-amber-200 placeholder:text-gray-400"
            maxLength={160}
          />
          
          <div className="text-xs text-right text-gray-500">
            {intention.length}/160 {t('tarot.characters')}
          </div>
          
          {userData && userData.runsToday === false && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              You have already done a reading today. Use the developer tools to enable readings for testing.
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-medium transition-all"
            disabled={loading || !intention.trim() || (userData?.runsToday === false)}
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.loading')}
              </span>
            ) : (
              <span className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('tarot.readCards')}
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IntentionForm;
