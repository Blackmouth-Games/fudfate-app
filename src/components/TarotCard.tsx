
import React from 'react';
import BaseCard, { BaseCardProps } from './cards/BaseCard';
import GlitchText from './GlitchText';

// TarotCard extends the properties of BaseCard
interface TarotCardProps extends Omit<BaseCardProps, 'frameStyle' | 'titlePosition' | 'renderCustomTitle'> {
  // We can add specific properties for tarot cards here
  glitchEffect?: 'normal' | 'intense' | 'digital' | 'none';
  neonTitle?: 'purple' | 'red' | 'blue' | 'none';
}

const TarotCard = ({ 
  imageUrl, 
  title, 
  className, 
  delay = 0,
  glitchEffect = 'normal',
  neonTitle = 'none'
}: TarotCardProps) => {
  
  // Only apply glitch if an effect is selected
  const shouldGlitch = glitchEffect !== 'none';
  
  return (
    <BaseCard
      imageUrl={imageUrl}
      title={title}
      className={className}
      delay={delay}
      frameStyle="gold"
      titlePosition="bottom"
      renderCustomTitle={(title) => (
        shouldGlitch ? (
          <GlitchText 
            text={title} 
            goldEffect={true} 
            fontSize="1.125rem" 
            className="font-pixel-2p"
            intensity={glitchEffect}
            neonEffect={neonTitle}
          />
        ) : (
          <span className="gold-text text-lg font-pixel-2p">
            {title}
          </span>
        )
      )}
    />
  );
};

export default TarotCard;
