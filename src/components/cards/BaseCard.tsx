
import React from 'react';
import { cn } from '@/lib/utils';
import '../../styles/cards.css';

export interface BaseCardProps {
  imageUrl: string;
  title: string;
  className?: string;
  delay?: number;
  frameStyle?: 'gold' | 'silver' | 'none';
  titlePosition?: 'bottom' | 'top' | 'inside' | 'none';
  renderCustomTitle?: (title: string) => React.ReactNode;
}

const BaseCard = ({ 
  imageUrl, 
  title, 
  className, 
  delay = 0, 
  frameStyle = 'gold',
  titlePosition = 'bottom',
  renderCustomTitle
}: BaseCardProps) => {
  // Determine frame class based on style
  const frameClass = frameStyle === 'gold' 
    ? 'gold-frame' 
    : frameStyle === 'silver' 
      ? 'silver-frame' 
      : '';

  // Custom title rendering or default
  const renderTitle = () => {
    if (titlePosition === 'none') return null;
    
    const titleElement = renderCustomTitle 
      ? renderCustomTitle(title)
      : (
        <div className="glitch inline-block gold-text text-lg font-pixel-2p">
          {title}
          <span aria-hidden="true">{title}</span>
          <span aria-hidden="true">{title}</span>
        </div>
      );

    return (
      <div className={cn(
        "absolute text-center",
        titlePosition === 'bottom' && "-bottom-2 left-0 right-0",
        titlePosition === 'top' && "-top-2 left-0 right-0",
        titlePosition === 'inside' && "bottom-4 left-0 right-0"
      )}>
        {titleElement}
      </div>
    );
  };

  return (
    <div 
      className={cn("card-container", className)} 
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="card-3d w-full max-w-[240px] mx-auto">
        <div className="relative pb-8"> {/* Padding for the title */}
          <div className={cn("aspect-[3/5] overflow-hidden rounded-lg", frameClass)}>
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover pixelated"
            />
          </div>
          {renderTitle()}
        </div>
      </div>
    </div>
  );
};

export default BaseCard;
