import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RocketProps {
  index: number;
  onComplete: () => void;
}

const Rocket: React.FC<RocketProps> = ({ index, onComplete }) => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  
  // Calculate starting positions
  const positions = [
    { x: viewportWidth * 0.2, y: viewportHeight },  // Left
    { x: viewportWidth * 0.4, y: viewportHeight },  // Center-left
    { x: viewportWidth * 0.5, y: viewportHeight },  // Center
    { x: viewportWidth * 0.6, y: viewportHeight },  // Center-right
    { x: viewportWidth * 0.8, y: viewportHeight },  // Right
  ];
  
  const startPosition = positions[index % positions.length];
  
  // Calculate end position with less variance
  const variance = (Math.random() - 0.5) * 100;
  const endX = startPosition.x + variance;
  const endY = -200; // End further above screen

  return (
    <motion.div
      initial={{ 
        x: startPosition.x,
        y: startPosition.y,
        opacity: 0,
        scale: 0.3,
        rotate: -45
      }}
      animate={{
        x: [
          startPosition.x,
          endX
        ],
        y: [
          startPosition.y,           // Start
          startPosition.y * 0.8,     // 20% up
          startPosition.y * 0.6,     // 40% up
          startPosition.y * 0.4,     // 60% up
          startPosition.y * 0.2,     // 80% up
          endY                       // End
        ],
        opacity: [
          0,    // Start invisible
          1,    // Quickly become visible
          1,    // Stay visible
          1,    // Stay visible
          1,    // Stay visible
          0     // Fade at very end
        ],
        scale: [
          0.3,  // Start small
          1,    // Full size
          1,    // Maintain size
          1,    // Maintain size
          1,    // Maintain size
          0.8   // Slightly smaller at end
        ],
        rotate: -45
      }}
      transition={{
        duration: 1.5,                // Reduced duration from 3 to 1.5
        delay: index * 0.1,          // Reduced delay between rockets from 0.2 to 0.1
        ease: [0.2, 0.65, 0.3, 0.9], // Custom ease curve
        times: [0, 0.2, 0.4, 0.6, 0.8, 1], // Even distribution of keyframes
      }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none text-6xl z-[9999] select-none"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: `translate(${startPosition.x}px, ${startPosition.y}px)`,
        transformOrigin: 'center center',
        willChange: 'transform, opacity'
      }}
    >
      🚀
    </motion.div>
  );
};

interface RocketCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

const RocketCelebration: React.FC<RocketCelebrationProps> = ({ 
  show, 
  onComplete 
}) => {
  const [rockets, setRockets] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show && !isAnimating) {
      setIsAnimating(true);
      setRockets([0, 1, 2, 3, 4]);
    }
  }, [show, isAnimating]);

  const handleRocketComplete = (index: number) => {
    // Only remove the rocket after its animation is truly complete
    setTimeout(() => {
      setRockets(prev => prev.filter(i => i !== index));
      
      // If this was the last rocket
      if (rockets.length === 1) {
        setIsAnimating(false);
        if (onComplete) {
          onComplete();
        }
      }
    }, 100); // Small delay to ensure animation completes
  };

  // Don't remove rockets when show becomes false
  // Let them complete their animation naturally
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
      <AnimatePresence mode="wait">
        {(show || rockets.length > 0) && (
          <div className="relative w-full h-full">
            {rockets.map((index) => (
              <Rocket
                key={`rocket-${index}`}
                index={index}
                onComplete={() => handleRocketComplete(index)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RocketCelebration; 