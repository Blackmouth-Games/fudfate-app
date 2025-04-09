
import React from 'react';
import { cn } from '../lib/utils';
import GlitchEffect from './core/GlitchEffect';
import '../styles/animations.css';

interface GlitchTextProps {
  text: string;
  className?: string;
  goldEffect?: boolean;
}

const GlitchText = ({ text, className, goldEffect = false }: GlitchTextProps) => {
  return (
    <GlitchEffect type="text" className={cn(
      "relative glitch", 
      goldEffect && "text-amber-500 font-bold",
      className
    )}>
      <span className="inline-block">{text}</span>
      {goldEffect && (
        <>
          <span className="absolute top-0 left-0 opacity-80 text-amber-600">{text}</span>
          <span className="absolute top-0 left-0 opacity-80 text-amber-400">{text}</span>
        </>
      )}
    </GlitchEffect>
  );
};

export default GlitchText;
