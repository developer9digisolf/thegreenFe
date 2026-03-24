'use client';

import { useEffect, useState } from 'react';

interface IChartComponentProps {
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'radialBar';
  options?: any;
  series?: any;
  height?: number | string;
  width?: number | string;
}

/**
 * Dynamically loaded chart component
 * This component lazy loads the react-apexcharts library
 */
export function DynamicChart({ type, options, series, height = 350, width = '100%' }: IChartComponentProps) {
  const [ChartComponent, setChartComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChart() {
      try {
        const ReactApexChart = (await import('react-apexcharts')).default;
        setChartComponent(() => ReactApexChart);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load chart component:', error);
        setLoading(false);
      }
    }

    loadChart();
  }, []);

  if (loading || !ChartComponent) {
    return (
      <div
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof width === 'number' ? `${width}px` : width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0,0,0,0.1)',
            borderTopColor: '#059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <ChartComponent
      type={type}
      options={options}
      series={series}
      height={height}
      width={width}
    />
  );
}

export default DynamicChart;
