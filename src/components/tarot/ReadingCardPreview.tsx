
import React from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import ImageLoader from '@/components/ui/image-loader';

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
          <ImageLoader
            src={imagePath} 
            alt={`Card ${index + 1}`}
            className="w-full h-full rounded-lg"
            fallbackSrc="/img/cards/deck_1/0_TheDegen.jpg"
            aspectRatio={5/8}
            skeletonClassName="bg-amber-100"
          />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="p-0 hover-card-content w-40">
        <div className="w-40 h-64">
          <ImageLoader
            src={imagePath} 
            alt={`Card ${index + 1}`}
            className="w-full h-full rounded-lg"
            fallbackSrc="/img/cards/deck_1/0_TheDegen.jpg"
            aspectRatio={5/8}
            skeletonClassName="bg-amber-100"
          />
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
