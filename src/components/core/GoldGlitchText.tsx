
import React from 'react';
import '../../styles/goldglitch.css';

interface GoldGlitchTextProps {
  text: string;
  className?: string;
  fontSize?: string;
  lineHeight?: string;
}

export const GoldGlitchText: React.FC<GoldGlitchTextProps> = ({
  text,
  className = '',
  fontSize,
  lineHeight,
}) => {
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
      className={`gold-text-container ${className}`} 
      style={containerStyle}
    >
      <span className="gold-text" style={textStyle}>
        {text}
      </span>
      <span 
        className="gold-glitch-effect-1" 
        aria-hidden="true"
        style={glitchStyle}
      >
        {text}
      </span>
      <span 
        className="gold-glitch-effect-2" 
        aria-hidden="true"
        style={glitchStyle}
      >
        {text}
      </span>
    </div>
  );
};

export default GoldGlitchText;
