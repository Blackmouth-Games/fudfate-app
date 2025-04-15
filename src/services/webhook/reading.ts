
import { WebhookResponse } from '@/types/tarot';
import { callWebhook } from './core';
import { logReadingWebhook } from './logger';
import { toast } from 'sonner';
import { Environment } from '@/config/webhooks';

// Variable para almacenar la promesa de la lectura real
let pendingReading: Promise<WebhookResponse> | null = null;

/**
 * Call the reading webhook to get a tarot reading
 */
export const callReadingWebhook = async (
  webhookUrl: string, 
  userId?: string, 
  intention?: string,
  environment: Environment = 'production'
): Promise<WebhookResponse> => {
  if (!userId) {
    console.error("No user ID available for webhook call");
    throw new Error("No user ID available");
  }

  // Generar respuesta temporal para la fase de selección
  const tempResponse: WebhookResponse = {
    selected_cards: Array.from({ length: 3 }, () => Math.floor(Math.random() * 78)),
    message: "Selecciona tus cartas del tarot...",
    reading: null,
    cards: null,
    returnwebhoock: null,
    isTemporary: true // Flag para identificar respuesta temporal
  };

  // Si ya hay una lectura pendiente, retornar la respuesta temporal
  if (pendingReading) {
    return tempResponse;
  }

  // Iniciar la lectura real en segundo plano
  pendingReading = (async () => {
    try {
      const result = await callWebhook<WebhookResponse>(
        { 
          url: webhookUrl, 
          data: { userid: userId, intention }, 
          environment 
        },
        'Reading'
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'No data received');
      }

      // Solo procesar y logear si tenemos una respuesta válida
      if (result.data.selected_cards && result.data.message) {
        logReadingWebhook({
          url: webhookUrl,
          requestData: { userid: userId, intention },
          responseData: result.data,
          status: result.status,
          environment
        });

        // Emitir evento cuando la lectura real esté lista
        window.dispatchEvent(new CustomEvent('readingReady', { 
          detail: result.data 
        }));

        return result.data;
      }

      throw new Error('Invalid webhook response format');
    } catch (error) {
      console.error('Error in webhook call:', error);
      throw error;
    } finally {
      pendingReading = null;
    }
  })();

  // Retornar respuesta temporal inmediatamente
  return tempResponse;
};
