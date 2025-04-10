
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
  
  const containerStyle: React.CSSProperties = {
    fontSize,
    lineHeight,
    position: 'relative',
    display: 'inline-block',
    width: 'fit-content',
    maxWidth: '100%'
  };

  const textStyle: React.CSSProperties = {
    fontSize,
    lineHeight,
    display: 'inline-block',
    position: 'relative',
    zIndex: 10
  };

  const glitchStyle: React.CSSProperties = {
    fontSize,
    lineHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    userSelect: 'none'
  };

  return (
    <div 
      className={`text-container ${className}`} 
      style={containerStyle}
    >
      <span className={`text-base ${baseColor}`} style={textStyle}>
        {text}
      </span>
      <span 
        className={`text-glitch-effect-1 ${glitchColor}`} 
        aria-hidden="true"
        style={glitchStyle}
      >
        {text}
      </span>
      <span 
        className={`text-glitch-effect-2 ${glitchColor}`} 
        aria-hidden="true"
        style={glitchStyle}
      >
        {text}
      </span>
    </div>
  );
};

export default GlitchText;
