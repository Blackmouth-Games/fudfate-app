
import React from 'react';
import BaseCard, { BaseCardProps } from './cards/BaseCard';

// TarotCard extends the properties of BaseCard
interface TarotCardProps extends Omit<BaseCardProps, 'frameStyle' | 'titlePosition' | 'renderCustomTitle'> {
  // We can add specific properties for tarot cards here
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
