
import React from 'react';
import GlitchEffect from './core/GlitchEffect';
import '../styles/logo.css';

interface GlitchLogoProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const GlitchLogo = ({ 
  imageUrl, 
  alt = "Logo", 
  className = "", 
  size = "medium" 
}: GlitchLogoProps) => {
    // Determine size classes based on the size prop
    const sizeClasses = {
      small: "h-20 md:h-24",
      medium: "h-32 md:h-40",
      large: "h-40 md:h-52"
    };
    
    const imageClass = sizeClasses[size];
    
    return (
        <GlitchEffect type="image" className={className}>
            <div className="logo-container relative inline-block">
                <img 
                    src={imageUrl} 
                    alt={alt} 
                    className={`${imageClass} mx-auto mb-8 logo-glitch`} 
                />
                <img 
                    src={imageUrl} 
                    alt={`${alt} Glitch 1`} 
                    className={`absolute top-0 left-0 ${imageClass} mx-auto mb-8 glitch-effect-1`} 
                />
                <img 
                    src={imageUrl} 
                    alt={`${alt} Glitch 2`} 
                    className={`absolute top-0 left-0 ${imageClass} mx-auto mb-8 glitch-effect-2`} 
                />
            </div>
        </GlitchEffect>
    );
};

export default GlitchLogo;
