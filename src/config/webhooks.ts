
/**
 * Configuration for all webhooks used in the application
 * Separated by environment (development/production)
 */

export type Environment = 'development' | 'production';

interface WebhookConfig {
  login: string;
  reading: string;
  deck: string;
  history: string;
}

export const webhooks: Record<Environment, WebhookConfig> = {
  development: {
    login: 'https://primary-production-fe05.up.railway.app/webhook-test/1ed632ae-fa01-4235-8566-11faaeda4abd',
    reading: 'https://primary-production-fe05.up.railway.app/webhook-test/85ed2bf3-a882-4c99-8c74-c35a186108ab',
    deck: 'https://primary-production-fe05.up.railway.app/webhook-test/f1e66d81-60de-4136-8814-137b72d29b51',
    history: 'https://primary-production-fe05.up.railway.app/webhook-test/fcb5106e-22e5-4045-b103-4ae32f8d68bf',
  },
  production: {
    login: 'https://primary-production-fe05.up.railway.app/webhook/1ed632ae-fa01-4235-8566-11faaeda4abd',
    reading: 'https://primary-production-fe05.up.railway.app/webhook/85ed2bf3-a882-4c99-8c74-c35a186108ab',
    deck: 'https://primary-production-fe05.up.railway.app/webhook/f1e66d81-60de-4136-8814-137b72d29b51',
    history: 'https://primary-production-fe05.up.railway.app/webhook/fcb5106e-22e5-4045-b103-4ae32f8d68bf',
  },
};
