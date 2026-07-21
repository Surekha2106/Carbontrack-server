import React, { useEffect, useState } from 'react';
import { Leaf, Flower } from 'lucide-react';
import './NatureBackground.css';

const LEAF_SVG = (
  <Leaf className="w-full h-full text-accent/30" strokeWidth={1.5} />
);

const FLOWER_SVG = (
  <Flower className="w-full h-full text-emerald-400/30" strokeWidth={1.5} />
);

interface Particle {
  id: number;
  type: 'leaf' | 'flower';
  left: number;
  duration: number;
  delay: number;
  size: number;
  rotation: number;
}

export const NatureBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles: Particle[] = [];
    const count = 30; // Number of particles
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        type: Math.random() > 0.4 ? 'leaf' : 'flower',
        left: Math.random() * 100, // Random left position percentage
        duration: Math.random() * 15 + 15, // Between 15s and 30s
        delay: Math.random() * 20, // Delay before falling
        size: Math.random() * 20 + 15, // Size between 15px and 35px
        rotation: Math.random() * 360,
      });
    }
    
    setParticles(newParticles);
  }, []);

  return (
    <div className="nature-bg-container bg-[#F7F5EF] dark:bg-[#0f1712]">
      {particles.map(p => (
        <div
          key={p.id}
          className="nature-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`
          }}
        >
          {p.type === 'leaf' ? LEAF_SVG : FLOWER_SVG}
        </div>
      ))}
    </div>
  );
};

export default NatureBackground;
