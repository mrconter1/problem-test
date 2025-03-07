import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stair Model Visualization',
  description: 'Interactive 3D visualization of stair models for architectural analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
} 