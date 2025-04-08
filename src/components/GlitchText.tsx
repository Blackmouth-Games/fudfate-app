
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
    <GlitchEffect 
      type="text" 
      goldEffect={goldEffect} 
      className={className}
    >
      {text}
    </GlitchEffect>
  );
};

export default GlitchText;
