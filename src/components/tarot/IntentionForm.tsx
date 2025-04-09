
import React from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
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
      
      // Process the received data for tarot reading
      if (data.fatemessage && data.cards) {
        setFinalMessage(data.fatemessage);
        
        // Process cards if they are returned from the webhook
        if (Array.isArray(data.cards) && data.cards.length > 0) {
          // Map the received cards to the format expected by the app
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
              <GlitchText text={t('tarot.yourIntention')} />
            </h3>
            <p className="text-gray-600 text-sm text-center">
              {t('tarot.intentionDescription')}
            </p>
          </div>
          
          <Textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder={t('tarot.intentionPlaceholder')}
            className="min-h-[100px] border-amber-200 placeholder:text-gray-400"
          />
          
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
                <span className="animate-spin mr-2">⋯</span>
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
