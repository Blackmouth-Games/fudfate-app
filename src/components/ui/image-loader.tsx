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
    console.log('ImageLoader: Loading image from:', src);
    setIsLoading(true);
    setHasError(false);
    setImageSrc(src);
  }, [src]);
  
  // Handle image load completion
  const handleLoad = () => {
    console.log('ImageLoader: Image loaded successfully:', imageSrc);
    setIsLoading(false);
  };
  
  // Handle image load error
  const handleError = () => {
    console.error('ImageLoader: Failed to load image:', imageSrc);
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackSrc) {
      console.log('ImageLoader: Using fallback image:', fallbackSrc);
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
          isLoading ? "opacity-0" : "opacity-100",
          hasError ? "opacity-50" : ""
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100/50">
          <p className="text-xs text-red-600">Error loading image</p>
        </div>
      )}
    </div>
  );
};

export default ImageLoader;
