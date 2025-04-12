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

      {/* Chart panel overlay */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        backgroundColor: "#fff",
        padding: "10px",
        borderRadius: "10px",
        zIndex: 10,
        width: "500px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
      }}>
        <ChartPanel airData={airData} />
      </div>
    </div>
  );
}
