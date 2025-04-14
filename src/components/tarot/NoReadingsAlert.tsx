
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, SendHorizontal, History } from 'lucide-react';
import { socialLinks } from '@/config/socialConfig';
import { useNavigate } from 'react-router-dom';

interface NoReadingsAlertProps {
  className?: string;
  showTodayReading?: boolean;
  onViewHistory?: () => void;
}

const NoReadingsAlert: React.FC<NoReadingsAlertProps> = ({ 
  className = '',
  showTodayReading = false,
  onViewHistory
}) => {
  const { t } = useTranslation();
  
  return (
    <Alert className={`bg-amber-50 border-amber-200 ${className}`}>
      <InfoIcon className="h-4 w-4 text-amber-800" />
      <AlertTitle className="text-amber-800">
        {showTodayReading 
          ? t('tarot.todayReadingDone') 
          : t('tarot.readingsExhausted')}
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          {showTodayReading 
            ? t('tarot.todayReadingDoneDescription') 
            : t('tarot.readingsExhaustedDescription')}
        </p>
        <div className="flex flex-wrap gap-2 mt-4 justify-between">
          <a 
            href={socialLinks.telegram}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <SendHorizontal className="h-3 w-3" />
              <span>Telegram</span>
            </Button>
          </a>
          
          {onViewHistory && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onViewHistory}
              className="flex items-center gap-1 border-amber-300 hover:bg-amber-50"
            >
              <History className="h-3 w-3" />
              <span>{t('tarot.viewHistory')}</span>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default NoReadingsAlert;
