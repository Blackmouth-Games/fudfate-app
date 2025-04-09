import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlitchEffectProps {
  children: ReactNode;
  className?: string;
  goldEffect?: boolean;
  type?: 'text' | 'image' | 'button';
}

const GlitchEffect = ({ children, className, goldEffect = false, type = 'text' }: GlitchEffectProps) => {
  const baseClasses = cn(
    "relative inline-block text-center",
    type === 'text' && "glitch",
    type === 'image' && "glitch-logo",
    type === 'button' && "glitch-button",
    goldEffect && "gold-text",
    className
  );

  return (
    <div className={baseClasses}>
      {children}      
    </div>
  );
};

export default GlitchEffect;
