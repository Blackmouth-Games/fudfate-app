
import React from 'react';
import GlitchEffect from './core/GlitchEffect';
import '../styles/logo.css';

interface GlitchLogoProps {
  imageUrl: string;
  alt?: string;
  className?: string;
}

const GlitchLogo = ({ imageUrl, alt = "Logo", className }: GlitchLogoProps) => {
    return (
        <GlitchEffect type="image" className={className}>
            <div className="logo-container relative inline-block">
                <img 
                    src={imageUrl} 
                    alt={alt} 
                    className="h-32 md:h-40 mx-auto mb-8 logo-glitch" 
                />
                <img 
                    src={imageUrl} 
                    alt={`${alt} Glitch 1`} 
                    className="absolute top-0 left-0 h-32 md:h-40 mx-auto mb-8 glitch-effect-1" 
                />
                <img 
                    src={imageUrl} 
                    alt={`${alt} Glitch 2`} 
                    className="absolute top-0 left-0 h-32 md:h-40 mx-auto mb-8 glitch-effect-2" 
                />
            </div>
        </GlitchEffect>
    );
};

export default GlitchLogo;
