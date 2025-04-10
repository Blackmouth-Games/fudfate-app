
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEnvironment } from '@/hooks/useEnvironment';
import { Environment } from '@/config/webhooks';

const ConfigTab: React.FC = () => {
  const [environment, setEnvironment] = React.useState<Environment>('production');
  const { webhooks } = useEnvironment();

  // Load stored values
  React.useEffect(() => {
    const savedEnvironment = localStorage.getItem('appEnvironment') as Environment | null;
    if (savedEnvironment && (savedEnvironment === 'development' || savedEnvironment === 'production')) {
      setEnvironment(savedEnvironment);
    }
  }, []);

  // Save environment to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('appEnvironment', environment);
    // Broadcast the environment change
    window.dispatchEvent(new CustomEvent('environment-changed', { detail: { environment } }));
  }, [environment]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs font-medium block">Environment</Label>
        <RadioGroup 
          value={environment} 
          onValueChange={(value) => setEnvironment(value as Environment)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="development" id="development" className="scale-75" />
            <Label htmlFor="development" className="cursor-pointer text-xs">Dev</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="production" id="production" className="scale-75" />
            <Label htmlFor="production" className="cursor-pointer text-xs">Prod</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="p-2 bg-gray-50 rounded-md text-xs space-y-1">
        <details className="text-xs">
          <summary className="cursor-pointer font-medium text-gray-700">API Webhooks</summary>
          <div className="mt-1 space-y-1 text-[10px]">
            <div>
              <span className="font-medium">Login:</span> 
              <code className="block mt-0.5 text-[10px] break-all bg-gray-100 p-0.5 rounded">{webhooks.login}</code>
            </div>
            <div>
              <span className="font-medium">Reading:</span>
              <code className="block mt-0.5 text-[10px] break-all bg-gray-100 p-0.5 rounded">{webhooks.reading}</code>
            </div>
            <div>
              <span className="font-medium">Deck:</span>
              <code className="block mt-0.5 text-[10px] break-all bg-gray-100 p-0.5 rounded">{webhooks.deck}</code>
            </div>
            <div>
              <span className="font-medium">History:</span>
              <code className="block mt-0.5 text-[10px] break-all bg-gray-100 p-0.5 rounded">{webhooks.history}</code>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ConfigTab;
