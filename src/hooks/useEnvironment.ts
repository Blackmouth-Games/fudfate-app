
import { useState, useEffect } from 'react';
import { Environment, webhooks } from '@/config/webhooks';

export function useEnvironment() {
  const [environment, setEnvironment] = useState<Environment>(() => {
    const saved = localStorage.getItem('appEnvironment') as Environment | null;
    return (saved === 'development' || saved === 'production') ? saved : 'production';
  });

  useEffect(() => {
    const handleEnvironmentChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ environment: Environment }>;
      setEnvironment(customEvent.detail.environment);
    };

    // Listen for environment changes
    window.addEventListener('environment-changed', handleEnvironmentChange);
    
    return () => {
      window.removeEventListener('environment-changed', handleEnvironmentChange);
    };
  }, []);

  // Get the current webhooks based on the environment
  const currentWebhooks = webhooks[environment];

  return {
    environment,
    webhooks: currentWebhooks
  };
}
