import React from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Environment } from '@/config/webhooks';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const ConfigTab: React.FC = () => {
  const { environment, setEnvironment, webhooks } = useEnvironment();

  const toggleEnvironment = () => {
    const newEnv: Environment = environment === 'development' ? 'production' : 'development';
    setEnvironment(newEnv);
    toast.success(`Switched to ${newEnv} environment`);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Environment Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Environment</Label>
            <div className="text-[0.8rem] text-muted-foreground">
              Current: <span className={`font-mono ${environment === 'production' ? 'text-red-600' : 'text-blue-600'}`}>
                {environment}
              </span>
            </div>
          </div>
          <Switch
            checked={environment === 'development'}
            onCheckedChange={toggleEnvironment}
          />
        </div>

        <Separator />

        {/* Webhook URLs Section */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Active Webhook URLs</Label>
          <div className="space-y-2 bg-gray-50 p-2 rounded-md">
            {Object.entries(webhooks).map(([key, url]) => (
              <div key={key} className="text-xs">
                <span className="font-medium text-gray-700">{key}:</span>
                <div className="font-mono text-[0.7rem] text-gray-600 break-all bg-white p-1 rounded mt-1">
                  {url}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigTab;
