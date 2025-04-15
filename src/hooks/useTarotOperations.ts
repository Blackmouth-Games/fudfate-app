
import { useCardPreparation } from './tarot/useCardPreparation';
import { useCardReveal } from './tarot/useCardReveal';
import { useInterpretation } from './tarot/useInterpretation';

export const useTarotOperations = () => {
  const { loading: preparationLoading, prepareCardSelection } = useCardPreparation();
  const { loading: revealLoading, isWaitingForWebhook, handleCardReveal } = useCardReveal();
  const { loading: interpretationLoading, generateInterpretation } = useInterpretation();

  const loading = preparationLoading || revealLoading || interpretationLoading;

  return {
    loading,
    isWaitingForWebhook,
    prepareCardSelection,
    handleCardReveal,
    generateInterpretation
  };
};

export default useTarotOperations;
