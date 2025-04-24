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
    interpretation, selectedCards, setPhase
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
            <CardReading 
              selectedCards={selectedCards}
              onComplete={() => {
                setPhase('complete');
                // Trigger interpretation generation here if needed
              }}
              onReset={() => {
                resetReading();
                setPhase('initial');
              }}
            />
            {interpretation && <ShareReading />}
          </>
        );
      default:
        if (!userData?.runsToday) {
          return <NoReadingsAlert className="mb-6" />;
        }
        return (
          <Card className="relative z-10 border-[#3ADDD9] border-2 shadow-md animate-border-glow">
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
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative max-w-2xl mx-auto">
                  <Textarea
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder={t('tarot.intentionPlaceholder')}
                    className="h-[48px] resize-none overflow-hidden border border-[#3ADDD9]/30 focus:border-[#3ADDD9] focus:ring-1 focus:ring-[#3ADDD9]/30 rounded-xl pr-10 text-lg placeholder:text-gray-400 shadow-sm"
                    rows={1}
                  />
                  {intention && (
                    <button
                      type="button"
                      onClick={clearIntention}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xl"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <div className="relative inline-block">
                    <button
                      type="submit"
                      disabled={loading || intention.trim().length < 3}
                      className={`bg-[#3ADDD9] hover:bg-[#2BCBC7] text-white h-11 px-10 text-lg font-medium rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${
                        loading || intention.trim().length < 3 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <GlitchText 
                        text={loading ? t('tarot.starting') : t('tarot.start')}
                        className="text-white font-semibold tracking-wide"
                        goldEffect={true}
                      />
                    </button>
                  </div>
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
