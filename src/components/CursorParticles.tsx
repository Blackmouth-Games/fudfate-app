import React, { useEffect, useState, useRef } from 'react';
import '../styles/cursor-particles.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  opacity: number;
  vx: number;
  vy: number;
  icon: string;
  scale: number;
}

const COLORS = [
  '#FF71CE', // Neon Pink
  '#01CDFE', // Bright Cyan
  '#05FFA1', // Bright Mint
  '#B967FF'  // Bright Purple
];

const ICONS = ['✦', '★', '✧', '✹', '❂', '✺', '✶'];

const MAX_PARTICLES = 15;
const PARTICLES_PER_FRAME = 0.01;
const FADE_RATE = 0.03;
const DRIFT_SPEED = 2;
const EXPLOSION_PARTICLES = 8;
const EXPLOSION_FORCE = 6;

const CursorParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  let frame: number;

  const createParticle = (x: number, y: number, velocity: number = 1) => {
    const angle = Math.random() * Math.PI * 2;
    return {
      id: Date.now() + Math.random(),
      x,
      y,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
      vx: Math.cos(angle) * velocity * (Math.random() * 0.5 + 0.5),
      vy: Math.sin(angle) * velocity * (Math.random() * 0.5 + 0.5),
      icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      scale: Math.random() * 0.5 + 0.5 // Random scale between 0.5 and 1
    };
  };

  const createExplosion = (x: number, y: number) => {
    const explosionParticles: Particle[] = [];
    for (let i = 0; i < EXPLOSION_PARTICLES; i++) {
      explosionParticles.push(createParticle(x, y, EXPLOSION_FORCE));
    }
    setParticles(prev => [...prev, ...explosionParticles]);
  };

  const updateParticles = () => {
    setParticles(prevParticles => {
      const { x: mouseX, y: mouseY } = mouseRef.current;

      // Update existing particles
      const updatedParticles = prevParticles
        .map(p => ({
          ...p,
          x: p.x + p.vx * DRIFT_SPEED,
          y: p.y + p.vy * DRIFT_SPEED,
          vx: p.vx * 0.99,
          vy: p.vy * 0.99,
          opacity: p.opacity - FADE_RATE
        }))
        .filter(p => p.opacity > 0);

      // Generate new cursor trail particles
      if (mouseX !== 0) {
        const spawnCount = Math.min(PARTICLES_PER_FRAME, MAX_PARTICLES - updatedParticles.length);
        for (let i = 0; i < spawnCount; i++) {
          updatedParticles.push(createParticle(mouseX, mouseY));
        }
      }

      return updatedParticles;
    });

    frame = requestAnimationFrame(updateParticles);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      createExplosion(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    frame = requestAnimationFrame(updateParticles);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="cursor-particles-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="cursor-particle icon"
          style={{
            left: particle.x,
            top: particle.y,
            color: particle.color,
            opacity: particle.opacity,
            transform: `translate(-50%, -50%) scale(${particle.scale})`
          }}
        >
          {particle.icon}
        </div>
      ))}
    </div>
  );
};

export default CursorParticles; 