
import React from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface IntentionFormProps {
  className?: string;
}

const IntentionForm: React.FC<IntentionFormProps> = ({ className = '' }) => {
  const { intention, setIntention, startReading, loading } = useTarot();
  const { connected } = useWallet();
  const { t } = useTranslation();

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
    
    await startReading();
  };

  return (
    <Card className={`bg-black/30 border-purple-500/30 ${className}`}>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-center">
              {t('tarot.yourIntention')}
            </h3>
            <p className="text-gray-300 text-sm text-center">
              {t('tarot.intentionDescription')}
            </p>
          </div>
          
          <Textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder={t('tarot.intentionPlaceholder')}
            className="min-h-[100px] bg-black/20 border-purple-500/40 placeholder:text-gray-500"
          />
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 transition-all"
            disabled={loading || !intention.trim()}
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
