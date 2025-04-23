import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import GlitchText from '@/components/GlitchText';
import PreparingReading from './PreparingReading';
import CardSelection from './CardSelection';
import CardReading from './CardReading';
import ShareReading from './ShareReading';
import NoReadingsAlert from '@/components/tarot/NoReadingsAlert';

const IntentionForm: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { userData } = useWallet();
  const { 
    intention, setIntention, 
    phase, startReading, resetReading,
    interpretation
  } = useTarot();
  
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (intention.trim().length < 3) {
      toast.error(t('tarot.intentionTooShort'));
      return;
    }
    
    setLoading(true);
    try {
      await startReading();
      toast.success(t('tarot.readingStarted'));
    } catch (error) {
      console.error('Error starting reading:', error);
      toast.error(t('errors.readingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const clearIntention = () => {
    setIntention('');
  };

  const renderPhaseContent = () => {
    switch (phase) {
      case 'preparing':
        return <PreparingReading />;
      case 'selection':
        return <CardSelection />;
      case 'reading':
      case 'complete':
        return (
          <>
            <CardReading />
            {interpretation && <ShareReading />}
          </>
        );
      default:
        if (!userData?.runsToday) {
          return <NoReadingsAlert className="mb-6" />;
        }
        return (
          <Card className="border-amber-400/50 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="mb-2 overflow-visible">
                  <GlitchText 
                    text={t('tarot.askTheTarot')} 
                    className="text-xl font-medium text-gray-800"
                    goldEffect
                  />
                </div>
                <p className="text-gray-600 text-sm">
                  {t('tarot.focusOnYourQuestion')}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder={t('tarot.intentionPlaceholder')}
                  className="min-h-[100px] resize-none border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
                
                <div className="flex justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearIntention}
                    className="border-amber-300 hover:bg-amber-50"
                  >
                    {t('tarot.clear')}
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={loading || intention.trim().length < 3}
                    className="bg-[#3ADDD9] hover:bg-[#2BCBC7] text-white"
                  >
                    {loading ? t('tarot.starting') : t('tarot.start')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className={className}>
      {renderPhaseContent()}
    </div>
  );
};

export default IntentionForm;
