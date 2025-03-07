'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the StairVisualizer component with no SSR
const StairVisualizerComponent = dynamic(
  () => import('./StairVisualizer/index'),
  { ssr: false }
);

export default function StairVisualizerWrapper() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      <StairVisualizerComponent />
    </div>
  );
} 