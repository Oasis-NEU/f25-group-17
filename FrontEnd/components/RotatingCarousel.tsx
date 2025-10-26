"use client";

import React, { useState, useEffect } from 'react';

interface CarouselCard {
  icon: string;
  title: string;
  description: string;
}

interface RotatingCarouselProps {
  cards: CarouselCard[];
  autoRotate?: boolean;
  rotationSpeed?: number;
}

export default function RotatingCarousel({ 
  cards, 
  autoRotate = true, 
  rotationSpeed = 4000 
}: RotatingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoRotate || isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, rotationSpeed);

    return () => clearInterval(interval);
  }, [autoRotate, rotationSpeed, cards.length, isHovered]);

  const getCardStyle = (index: number) => {
    const totalCards = cards.length;
    const angleStep = 360 / totalCards;
    const angle = angleStep * (index - activeIndex);
    const radius = 300;
    
    // Calculate 3D position
    const rotateY = angle;
    const translateZ = radius;
    
    // Determine opacity and scale based on position
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const isFront = normalizedAngle > 330 || normalizedAngle < 30;
    const opacity = isFront ? 1 : 0.4;
    const scale = isFront ? 1.1 : 0.85;
    const zIndex = isFront ? 10 : 1;

    return {
      transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      opacity,
      zIndex,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center py-16">
      {/* Carousel Container */}
      <div 
        className="relative w-full h-full"
        style={{ perspective: '1200px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          {cards.map((card, index) => (
            <div
              key={index}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px]"
              style={getCardStyle(index)}
            >
              <div className="bg-[rgba(17,24,39,0.9)] border border-white/10 rounded-xl p-8 backdrop-blur-lg shadow-2xl hover:border-red-500/50 transition-colors duration-300">
                <div className="text-center">
                  <div className="text-6xl mb-6">{card.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-red-600/80 hover:bg-red-700 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110"
        aria-label="Previous card"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-red-600/80 hover:bg-red-700 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110"
        aria-label="Next card"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-red-500 w-8' 
                : 'bg-gray-500 hover:bg-gray-400'
            }`}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

