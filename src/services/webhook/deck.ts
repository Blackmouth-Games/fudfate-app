
import { callWebhook } from './core';
import { logDeckSelectWebhook } from './logger';
import { toast } from 'sonner';
import { Environment } from '@/config/webhooks';

/**
 * Call webhook to select a deck
 */
export const callSelectDeckWebhook = async (
  webhookUrl: string,
  userId: string,
  deckToSelect: string,
  environment: Environment = 'production'
): Promise<boolean> => {
  try {
    const requestData = {
      date: new Date().toISOString(),
      userid: userId,
      deck_to_select: deckToSelect
    };

    console.log(`Calling select deck webhook with userid: ${userId}, deck: ${deckToSelect}`);

    const result = await callWebhook(
      { url: webhookUrl, data: requestData, environment },
      'DeckSelect'
    );

    if (result.success) {
      toast.success("Deck selected successfully", {
        description: `You've selected ${deckToSelect}`
      });
      return true;
    }

    toast.error("Error selecting deck. Please try again later.", {
      description: result.error
    });
    return false;
  } catch (error) {
    console.error('Error calling select deck webhook:', error);
    
    // Update to use object parameter format
    logDeckSelectWebhook({
      url: webhookUrl, 
      requestData: { userid: userId, deck_to_select: deckToSelect }, 
      error: error instanceof Error ? error.message : String(error), 
      environment
    });
    
    toast.error("Error selecting deck. Please try again later.", {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return false;
  }
};
