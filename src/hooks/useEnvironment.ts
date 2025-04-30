import { useState, useEffect } from 'react';
import { getWebhookUrls, Environment } from '@/config/webhooks';

export const useEnvironment = () => {
  const [environment, setEnvironmentState] = useState<Environment>(() => {
    // First check localStorage
    const savedEnvironment = localStorage.getItem('appEnvironment') as Environment | null;
    if (savedEnvironment && (savedEnvironment === 'development' || savedEnvironment === 'production')) {
      return savedEnvironment;
    }
    
    // If no saved environment, check if we're in development
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('railway.app') ||  // Add railway.app check
                         window.location.port === '8080' ||
                         window.location.port === '3000';  // Add port 3000
    
    const defaultEnv = isDevelopment ? 'development' : 'production';
    localStorage.setItem('appEnvironment', defaultEnv);
    return defaultEnv;
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
