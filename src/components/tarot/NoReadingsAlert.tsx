
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, SendHorizontal } from 'lucide-react';
import { socialLinks } from '@/config/socialConfig';

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
        <div className="flex flex-wrap gap-2 mt-4">
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
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default NoReadingsAlert;
