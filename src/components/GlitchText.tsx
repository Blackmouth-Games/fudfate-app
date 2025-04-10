
import React from 'react';
import '../styles/glitch.css';

interface GlitchTextProps {
  text: string;
  goldEffect?: boolean;
  className?: string;
  fontSize?: string;
  lineHeight?: string;
  neonEffect?: 'purple' | 'red' | 'blue' | 'none';
  intensity?: 'normal' | 'intense' | 'digital';
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  goldEffect = false,
  className = '',
  fontSize,
  lineHeight,
  neonEffect = 'none',
  intensity = 'normal'
}) => {
  const baseColor = goldEffect ? 'gold-text' : 'text-gray-900';
  const glitchColor = goldEffect ? 'gold-text' : 'text-gray-900';
  
  // Apply neon effect if requested
  let neonClass = '';
  if (neonEffect === 'purple') neonClass = 'glitch-neon';
  else if (neonEffect === 'red') neonClass = 'glitch-neon-red';
  else if (neonEffect === 'blue') neonClass = 'glitch-neon-blue';
  
  // Apply intensity variation
  let intensityClass = '';
  if (intensity === 'intense') intensityClass = 'intense-glitch';
  else if (intensity === 'digital') intensityClass = 'digital-distortion';
  
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
      className={`text-container ${className} ${intensityClass}`} 
      style={containerStyle}
    >
      <span className={`text-base ${baseColor} ${neonClass}`} style={textStyle}>
        {text}
      </span>
      <span 
        className={`text-glitch-effect-1 ${glitchColor} ${neonClass}`} 
        aria-hidden="true"
        style={glitchStyle}
      >
        {text}
      </span>
      <span 
        className={`text-glitch-effect-2 ${glitchColor} ${neonClass}`} 
        aria-hidden="true"
        style={glitchStyle}
      >
        {text}
      </span>
    </div>
  );
};

export default GlitchText;
