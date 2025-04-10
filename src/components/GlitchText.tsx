
import React from 'react';
import '../styles/glitch.css';

interface GlitchTextProps {
  text: string;
  goldEffect?: boolean;
  className?: string;
  fontSize?: string;
  lineHeight?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ 
  text, 
  goldEffect = false, 
  className = '',
  fontSize,
  lineHeight
}) => {
  const baseColor = goldEffect ? 'gold-text' : 'text-gray-900';
  const glitchColor = goldEffect ? 'gold-text' : 'text-gray-900';
  
  const containerStyle = {
    fontSize,
    lineHeight
  };

  return (
    <div 
      className={`text-container relative ${className}`} 
      style={containerStyle}
    >
      <span className={`text-base relative z-10 ${baseColor}`} style={containerStyle}>
        {text}
      </span>
      <span 
        className={`text-glitch-effect-1 ${glitchColor} pointer-events-none select-none`} 
        aria-hidden="true"
        style={containerStyle}
      >
        {text}
      </span>
      <span 
        className={`text-glitch-effect-2 ${glitchColor} pointer-events-none select-none`} 
        aria-hidden="true"
        style={containerStyle}
      >
        {text}
      </span>
    </div>
  );
};

export default GlitchText;
