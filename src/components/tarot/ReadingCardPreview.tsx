
import React from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ReadingCardPreviewProps {
  cardId: number;
  index: number;
  cardName: string;
  imagePath: string;
}

const ReadingCardPreview: React.FC<ReadingCardPreviewProps> = ({
  cardId,
  index,
  cardName,
  imagePath,
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="w-8 h-12 shrink-0 cursor-pointer history-card">
          <AspectRatio ratio={5/8}>
            <img 
              src={imagePath} 
              alt={`Card ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn(`Failed to load card image: ${imagePath}`);
                (e.target as HTMLImageElement).src = '/img/cards/deck_1/0_TheDegen.jpg';
              }}
            />
          </AspectRatio>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="p-0 hover-card-content w-40">
        <div className="w-40 h-64">
          <AspectRatio ratio={5/8}>
            <img 
              src={imagePath} 
              alt={`Card ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
        <div className="p-2 text-center bg-amber-50">
          <p className="text-sm font-medium text-amber-800">
            {cardName}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ReadingCardPreview;
