'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamic import for the Dashboard component to avoid SSR issues with Leaflet
const DashboardWithNoSSR = dynamic(
  () => import('../components/Dashboard').then((mod) => mod.Dashboard),
  { ssr: false }
);

export default function Home() {
  // Get WebSocket URL from environment or use default
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

  return (
    <main>
      <div className="fixed top-4 left-4 z-10">
        <Image 
          src="/images/lit-logo.svg" 
          alt="LIT Logo" 
          width={60} 
          height={60}
          priority
        />
      </div>
      <DashboardWithNoSSR wsUrl={wsUrl} />
    </main>
  );
}
