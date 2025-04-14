
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ImageLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  aspectRatio?: number;
  skeletonClassName?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  className,
  fallbackSrc,
  aspectRatio = 5/8, // Default tarot card ratio
  skeletonClassName,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  
  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageSrc(src);
  }, [src]);
  
  // Handle image load completion
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  // Handle image load error
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackSrc) {
      console.warn(`Failed to load image: ${imageSrc}, using fallback`);
      setImageSrc(fallbackSrc);
    }
  };
  
  // Calculate aspect ratio style
  const aspectRatioStyle = aspectRatio ? { aspectRatio: `${aspectRatio}` } : {};
  
  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={aspectRatioStyle}
    >
      {isLoading && (
        <Skeleton 
          className={cn(
            "absolute inset-0 w-full h-full z-10", 
            skeletonClassName
          )} 
        />
      )}
      
      <img
        src={imageSrc}
        alt={alt || "Image"}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default ImageLoader;
