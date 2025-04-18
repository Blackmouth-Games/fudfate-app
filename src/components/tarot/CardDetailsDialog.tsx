
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import GlitchText from '@/components/GlitchText';

interface CardDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardDetails: any | null;
}

const CardDetailsDialog: React.FC<CardDetailsDialogProps> = ({
  open,
  onOpenChange,
  cardDetails
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <GlitchText text={cardDetails?.name || ''} className="text-xl" />
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="p-4 flex flex-col items-center">
          {cardDetails && (
            <>
              <div className="mb-4 w-full max-w-xs mx-auto">
                <div className="aspect-[5/8] overflow-hidden rounded-lg border-2 border-amber-400 shadow-lg">
                  <img 
                    src={cardDetails.image.replace('.png', '.jpg')} 
                    alt={cardDetails.name} 
                    className="w-full h-full object-contain" 
                    onError={(e) => {
                      console.warn(`Failed to load image: ${cardDetails.image.replace('.png', '.jpg')}, using fallback`);
                      e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.jpg`;
                    }}
                  />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-200 mt-4 w-full">
                <h4 className="font-bold mb-2 text-amber-700">{cardDetails.name}</h4>
                <p className="text-gray-700">{cardDetails.description}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailsDialog;
