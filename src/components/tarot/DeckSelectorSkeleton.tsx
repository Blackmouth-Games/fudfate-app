
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DeckSelectorSkeletonProps {
  className?: string;
}

const DeckSelectorSkeleton: React.FC<DeckSelectorSkeletonProps> = ({ className = '' }) => {
  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <Skeleton className="h-7 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="w-full max-w-[120px] h-[170px] mx-auto rounded-lg" />
              <Skeleton className="h-4 w-24 mt-2" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeckSelectorSkeleton;
