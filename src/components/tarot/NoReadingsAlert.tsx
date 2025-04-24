import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, X } from 'lucide-react';
import '@/styles/reading-history.css';

interface NoReadingsAlertProps {
  className?: string;
  showTodayReading?: boolean;
}

const NoReadingsAlert: React.FC<NoReadingsAlertProps> = ({ 
  className = '',
  showTodayReading = false
}) => {
  const { t } = useTranslation();
  
  return (
    <Alert className={`bg-gradient-to-r from-indigo-400/20 via-fuchsia-400/20 to-cyan-400/20 border-fuchsia-400/30 animate-gradient-x backdrop-blur-sm ${className}`}>
      <InfoIcon className="h-4 w-4 text-fuchsia-500 animate-pulse" />
      <AlertTitle className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 font-bold">
        {showTodayReading 
          ? t('tarot.todayReadingDone') 
          : t('tarot.readingsExhausted')}
      </AlertTitle>
      <AlertDescription className="text-fuchsia-700/70">
        <p className="mb-2">
          {showTodayReading 
            ? t('tarot.todayReadingDoneDescription') 
            : t('tarot.readingsExhaustedDescription')}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <a 
            href="https://x.com/FudFate" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 hover:from-fuchsia-500/20 hover:to-cyan-500/20 border-fuchsia-500/30 hover:border-cyan-500/50 transition-all duration-300"
            >
              <X className="h-3 w-3 text-fuchsia-600" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 font-medium">@FUDfate</span>
            </Button>
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default NoReadingsAlert;
