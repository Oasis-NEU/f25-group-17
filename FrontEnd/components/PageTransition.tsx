"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Start page visible to avoid flash
    setIsVisible(true);
  }, [pathname]);

  return (
    <div 
      className={`transition-opacity duration-300 ease-in-out ${
        isVisible 
          ? 'opacity-100' 
          : 'opacity-0'
      }`}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
