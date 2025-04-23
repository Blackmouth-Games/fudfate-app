import React from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Environment } from '@/config/webhooks';
import { toast } from 'sonner';

const EnvironmentTab: React.FC = () => {
  const { environment, setEnvironment, webhooks } = useEnvironment();

  const toggleEnvironment = () => {
    const newEnv: Environment = environment === 'development' ? 'production' : 'development';
    setEnvironment(newEnv);
    toast.success(`Switched to ${newEnv} environment`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Environment</Label>
          <div className="text-[0.8rem] text-muted-foreground">
            Current: <span className="font-mono">{environment}</span>
          </div>
        </div>
        <Switch
          checked={environment === 'development'}
          onCheckedChange={() => toggleEnvironment()}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Webhook URLs</Label>
        <div className="space-y-1">
          {Object.entries(webhooks).map(([key, url]) => (
            <div key={key} className="text-xs">
              <span className="font-medium">{key}:</span>
              <br />
              <span className="font-mono text-[0.7rem] text-muted-foreground break-all">
                {url}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentTab; 