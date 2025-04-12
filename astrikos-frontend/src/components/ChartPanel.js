'use client';
import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const pollutants = ['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3'];

export default function ChartPanel({ airData }) {
  const canvasRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');

    // Destroy any existing chart first to prevent duplicates
    if (chartInstance) {
      chartInstance.destroy();
    }

    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: pollutants.map(p => p.toUpperCase()),
        datasets: [
          {
            label: 'Air Quality Components (μg/m³)',
            data: pollutants.map(p => airData?.[p] || 0),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ],
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      }
    });

    setChartInstance(newChart);

    return () => {
      newChart.destroy();
    };
  }, [airData]);

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
      <canvas
        ref={canvasRef}
        width="400"
        height="200"
      />
    </div>
  );
}
