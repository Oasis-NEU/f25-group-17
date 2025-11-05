"use client";

import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  // No transitions - just render children directly for instant, smooth navigation
  return <>{children}</>;
}
