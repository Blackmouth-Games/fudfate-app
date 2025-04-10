
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlitchEffectProps {
  children: ReactNode;
  className?: string;
  goldEffect?: boolean;
  type?: 'text' | 'image' | 'button';
  neonEffect?: 'purple' | 'red' | 'blue' | 'none';
  intensity?: 'normal' | 'intense' | 'digital';
}

const GlitchEffect = ({ 
  children, 
  className, 
  goldEffect = false, 
  type = 'text',
  neonEffect = 'none',
  intensity = 'normal'
}: GlitchEffectProps) => {
  // Apply neon effect if requested
  let neonClass = '';
  if (neonEffect === 'purple') neonClass = 'glitch-neon';
  else if (neonEffect === 'red') neonClass = 'glitch-neon-red';
  else if (neonEffect === 'blue') neonClass = 'glitch-neon-blue';
  
  // Apply intensity variation
  let intensityClass = '';
  if (intensity === 'intense') intensityClass = 'intense-glitch';
  else if (intensity === 'digital') intensityClass = 'digital-distortion';
  
  const baseClasses = cn(
    "relative inline-block text-center",
    type === 'text' && "glitch",
    type === 'image' && "glitch-logo",
    type === 'button' && "glitch-button",
    goldEffect && "gold-text",
    neonClass,
    intensityClass,
    className
  );

  return (
    <div className={baseClasses}>
      {children}      
    </div>
  );
};

export default GlitchEffect;
