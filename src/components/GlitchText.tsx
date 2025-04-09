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
    <div className={cn(
      "w-full text-center relative mb-8", 
      className
    )}>
      <GlitchEffect type="text" className="w-full">
        <span className={cn(
          "relative block",
          goldEffect ? "text-amber-500 font-bold" : "text-purple-500"
        )}>{text}</span>
        <span className={cn(
          "absolute glitch-effect-1",
          goldEffect 
            ? "text-amber-600 -top-1 left-0" 
            : "text-cyan-400 -top-1 -left-1"
        )}>{text}</span>
        <span className={cn(
          "absolute glitch-effect-2",
          goldEffect 
            ? "text-amber-400 -top-1 left-0"
            : "text-pink-500 -top-1 left-1"
        )}>{text}</span>
      </GlitchEffect>
    </div>
  );
};

export default GlitchText;
