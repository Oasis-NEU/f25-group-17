import React from 'react';
import Orb from '@/components/Orb';

export default function HeroOrb() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-0">
      <Orb
        hoverIntensity={0}
        rotateOnHover={false}
        hue={10}
      />
    </div>
  );
}
