
import { useState, useEffect } from 'react';
import { Environment, webhooks } from '@/config/webhooks';

export const useEnvironment = () => {
  const [environment, setEnvironment] = useState<Environment>('production'); // Changed default to production

  useEffect(() => {
    // Load environment from localStorage
    const savedEnvironment = localStorage.getItem('appEnvironment') as Environment | null;
    if (savedEnvironment && (savedEnvironment === 'development' || savedEnvironment === 'production')) {
      setEnvironment(savedEnvironment);
    } else {
      // If no environment is saved, default to production
      localStorage.setItem('appEnvironment', 'production');
    }

    // Listen for environment changes
    const handleEnvironmentChange = (event: CustomEvent) => {
      const { environment } = event.detail;
      setEnvironment(environment);
    };

    window.addEventListener('environment-changed', handleEnvironmentChange as EventListener);

    return () => {
      window.removeEventListener('environment-changed', handleEnvironmentChange as EventListener);
    };
  }, []);

  return { environment, webhooks: webhooks[environment] };
};
