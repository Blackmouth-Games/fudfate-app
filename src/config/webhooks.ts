
/**
 * Configuration for all webhooks used in the application
 * Separated by environment (development/production)
 */

export type Environment = 'development' | 'production';

interface WebhookConfig {
  login: string;
  reading: string;
}

export const webhooks: Record<Environment, WebhookConfig> = {
  development: {
    login: 'https://primary-production-fe05.up.railway.app/webhook-test/1ed632ae-fa01-4235-8566-11faaeda4abd',
    reading: 'https://primary-production-fe05.up.railway.app/webhook-test/85ed2bf3-a882-4c99-8c74-c35a186108ab',
  },
  production: {
    login: 'https://primary-production-fe05.up.railway.app/webhook/1ed632ae-fa01-4235-8566-11faaeda4abd',
    reading: 'https://primary-production-fe05.up.railway.app/webhook/85ed2bf3-a882-4c99-8c74-c35a186108ab',
  },
};
