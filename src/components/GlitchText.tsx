
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
      "w-full text-center relative mb-4", 
      className
    )}>
      <GlitchEffect type="text" className="w-full">
        <span className={cn(
          "relative block",
          goldEffect ? "text-amber-500 font-bold" : "text-purple-500"
        )}>{text}</span>
        <span className={cn(
          "absolute glitch-effect-1 top-0 left-0",
          goldEffect 
            ? "text-amber-600 -translate-y-0.5 -translate-x-0.5" 
            : "text-cyan-400 -translate-y-0.5 -translate-x-0.5"
        )}>{text}</span>
        <span className={cn(
          "absolute glitch-effect-2 top-0 left-0",
          goldEffect 
            ? "text-amber-400 translate-y-0.5 translate-x-0.5"
            : "text-pink-500 translate-y-0.5 translate-x-0.5"
        )}>{text}</span>
      </GlitchEffect>
    </div>
  );
};

export default GlitchText;
