
import React from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Stars } from 'lucide-react';
import GlitchText from '@/components/GlitchText';

interface PreparingReadingProps {
  className?: string;
}

const PreparingReading: React.FC<PreparingReadingProps> = ({ className = '' }) => {
  const { introMessage, loading } = useTarot();
  const { t } = useTranslation();

  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="py-8 px-4 sm:px-6">
        {loading && !introMessage ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="animate-spin text-4xl text-amber-400">✧</div>
            <h3 className="text-xl font-bold text-gray-800">
              <GlitchText text={t('tarot.invokingEnergies')} />
            </h3>
            <p className="text-gray-600">{t('tarot.preparingYourReading')}</p>
          </div>
        ) : (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex justify-center">
              <Sparkles className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              <GlitchText text={t('tarot.cosmicMessageReceived')} />
            </h3>
            <p className="text-gray-700 italic">"{introMessage}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreparingReading;
