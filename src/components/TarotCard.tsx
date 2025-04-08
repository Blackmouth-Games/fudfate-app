
import React from 'react';
import BaseCard, { BaseCardProps } from './cards/BaseCard';

// TarotCard ahora extiende las propiedades de BaseCard
interface TarotCardProps extends Omit<BaseCardProps, 'frameStyle' | 'titlePosition' | 'renderCustomTitle'> {
  // Podemos añadir propiedades específicas para las cartas de tarot aquí
}

const TarotCard = ({ imageUrl, title, className, delay = 0 }: TarotCardProps) => {
  return (
    <BaseCard
      imageUrl={imageUrl}
      title={title}
      className={className}
      delay={delay}
      frameStyle="gold"
      titlePosition="bottom"
    />
  );
};

export default TarotCard;
