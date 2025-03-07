'use client';

import dynamic from 'next/dynamic';

// Dynamically import the StairVisualizer component with no SSR
const StairVisualizer = dynamic(
  () => import('./components/StairVisualizer'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen">
      <StairVisualizer />
    </main>
  );
}
