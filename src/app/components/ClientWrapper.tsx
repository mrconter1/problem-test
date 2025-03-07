'use client';

import dynamic from 'next/dynamic';

// Dynamically import the StairVisualizer component with no SSR
const StairVisualizer = dynamic(
  () => import('./StairVisualizer'),
  { ssr: false }
);

export default function ClientWrapper() {
  return <StairVisualizer />;
} 