import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTarot } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import GlitchText from '@/components/GlitchText';
import { Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import PreparingReading from './PreparingReading';
import CardSelection from './CardSelection';
import CardReading from './CardReading';
import ShareReading from './ShareReading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
        return (Number(userData?.runsToday) > 0) ? (
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
                <div className="relative">
                  <Input
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder={t('tarot.enterYourQuestion')}
                    className="pr-8 text-center"
                  />
                  {intention && (
                    <button 
                      type="button" 
                      onClick={clearIntention}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="pt-2 flex justify-center">
                  <Button 
                    type="submit" 
                    disabled={intention.trim().length < 3 || loading}
                    className="px-4 py-1.5 h-auto text-sm flex items-center gap-1.5"
                  >
                    <Sparkles size={14} /> {t('tarot.seekGuidance')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null;
    }
  };

  return (
    <div className={className}>
      {renderPhaseContent()}
    </div>
  );
};

export default IntentionForm;
