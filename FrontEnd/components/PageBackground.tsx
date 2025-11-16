import React from 'react';

interface PageBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageBackground({ children, className = '' }: PageBackgroundProps) {
  return (
    <main className={`relative h-screen w-screen bg-gray-900 text-white overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="fixed inset-0 bg-linear-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)] z-0 pointer-events-none" />
      
      {/* Content wrapper */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </main>
  );
}
