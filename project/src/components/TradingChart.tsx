import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, CandlestickData, LineData } from 'lightweight-charts';
import { Download, LineChart, CandlestickChart } from 'lucide-react';

interface TradingChartProps {
  candleData: CandlestickData[];
  lineData: LineData[];
  onSave?: () => void;
}

export function TradingChart({ candleData, lineData }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      layout: {
        background: { color: '#000000' },
        textColor: '#4ADE80',
      },
      grid: {
        vertLines: { color: 'rgba(74, 222, 128, 0.1)' },
        horzLines: { color: 'rgba(74, 222, 128, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#4ADE80',
          width: 1,
          style: 2,
          labelBackgroundColor: '#000000',
        },
        horzLine: {
          color: '#4ADE80',
          width: 1,
          style: 2,
          labelBackgroundColor: '#000000',
        },
      },
    };

    chartRef.current = createChart(chartContainerRef.current, chartOptions);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    // Remove existing series
    chartRef.current.removeSeries();

    if (chartType === 'candle') {
      const candleSeries = chartRef.current.addCandlestickSeries({
        upColor: '#4ADE80',
        downColor: '#EF4444',
        borderVisible: false,
        wickUpColor: '#4ADE80',
        wickDownColor: '#EF4444',
      });
      candleSeries.setData(candleData);
    } else {
      const lineSeries = chartRef.current.addLineSeries({
        color: '#4ADE80',
        lineWidth: 2,
      });
      lineSeries.setData(lineData);
    }
  }, [chartType, candleData, lineData]);

  const handleSave = () => {
    if (!chartRef.current) return;

    // Create a canvas from the chart
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = chartContainerRef.current?.clientWidth || 800;
    canvas.height = 400;

    // Draw chart background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get chart as image data
    const chartImage = chartRef.current.takeScreenshot();
    const image = new Image();
    image.src = chartImage;

    // When image loads, draw it and trigger download
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      const link = document.createElement('a');
      link.download = `cheshire-chart-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('candle')}
            className={`p-2 rounded-lg transition-all ${
              chartType === 'candle'
                ? 'bg-purple-600/20 text-purple-400'
                : 'hover:bg-purple-600/10 text-gray-400'
            }`}
          >
            <CandlestickChart className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded-lg transition-all ${
              chartType === 'line'
                ? 'bg-green-500/20 text-green-400'
                : 'hover:bg-green-500/10 text-gray-400'
            }`}
          >
            <LineChart className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleSave}
          className="p-2 rounded-lg hover:bg-purple-600/10 text-purple-400 transition-all"
          title="Save Chart"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full h-[400px] bg-black border border-green-500/30 rounded-xl p-4">
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}