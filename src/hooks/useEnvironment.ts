
import { useState, useEffect } from 'react';
import { getWebhookUrls, Environment } from '@/config/webhooks';

export const useEnvironment = () => {
  const [environment, setEnvironmentState] = useState<Environment>(() => {
    const savedEnvironment = localStorage.getItem('appEnvironment') as Environment | null;
    return (savedEnvironment && (savedEnvironment === 'development' || savedEnvironment === 'production')) 
      ? savedEnvironment 
      : 'production';
  });

  const [webhooks, setWebhooks] = useState(getWebhookUrls(environment));

  // Update webhooks when environment changes
  useEffect(() => {
    setWebhooks(getWebhookUrls(environment));
  }, [environment]);

  // Set environment and save to localStorage
  const setEnvironment = (newEnvironment: Environment) => {
    setEnvironmentState(newEnvironment);
    localStorage.setItem('appEnvironment', newEnvironment);
    
    // Broadcast the environment change
    window.dispatchEvent(new CustomEvent('environment-changed', { 
      detail: { environment: newEnvironment } 
    }));
  };

  // Listen for environment changes from other components
  useEffect(() => {
    const handleEnvironmentChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ environment: Environment }>;
      if (customEvent.detail && customEvent.detail.environment) {
        setEnvironmentState(customEvent.detail.environment);
      }
    };

    window.addEventListener('environment-changed', handleEnvironmentChange);
    return () => {
      window.removeEventListener('environment-changed', handleEnvironmentChange);
    };
  }, []);

  return { environment, webhooks, setEnvironment };
};

export default useEnvironment;
