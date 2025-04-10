import React from 'react';
import '../styles/glitch.css';

interface GlitchTextProps {
  text: string;
  goldEffect?: boolean;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, goldEffect = false, className = '' }) => {
  const baseColor = goldEffect ? 'gold-text' : 'text-gray-900';
  const glitchColor = goldEffect ? 'gold-text' : 'text-gray-900';

  return (
    <div className={`text-container relative ${className}`}>
      <span className={`text-base relative z-10 ${baseColor}`}>{text}</span>
      <span 
        className={`text-glitch-effect-1 ${glitchColor} pointer-events-none select-none`} 
        aria-hidden="true"
      >
        {text}
      </span>
      <span 
        className={`text-glitch-effect-2 ${glitchColor} pointer-events-none select-none`} 
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
};

export default GlitchText;
