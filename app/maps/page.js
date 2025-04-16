'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

import ChartPanel from '../components/ChartPanel';


// Load MapOverlay only on the client side (no SSR)
const MapOverlay = dynamic(() => import('../components/MapOverlay'), { ssr: false });

export default function Home() {
  const [airData, setAirData] = useState(null); // 🔥 Store air quality data here

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#000' }}>
      {/* Google Map as base layer */}
      <MapOverlay onAirData={setAirData} />

      
    </div>
  );
}