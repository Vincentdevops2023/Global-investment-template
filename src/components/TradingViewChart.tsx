import React, { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, BarChart2, Zap, Globe, DollarSign, Calendar } from 'lucide-react';

interface ChartPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const ASSET_DATA: Record<string, { name: string, basePrice: number, volatility: number, prefix: string, suffix: string }> = {
  'BTC': { name: 'Bitcoin / US Dollar', basePrice: 94500, volatility: 0.015, prefix: '$', suffix: ' USDT' },
  'EUR_XAF': { name: 'Euro / Central African Franc', basePrice: 655.95, volatility: 0.0005, prefix: '', suffix: ' XAF' },
  'USDT_XAF': { name: 'USDT / Central African Franc', basePrice: 614.50, volatility: 0.002, prefix: '', suffix: ' XAF' },
  'GOLD': { name: 'Gold Ounce / US Dollar', basePrice: 2684.30, volatility: 0.008, prefix: '$', suffix: ' USD' },
  'APPLE': { name: 'Apple Inc. Stock', basePrice: 184.25, volatility: 0.01, prefix: '$', suffix: ' USD' },
};

export default function TradingViewChart() {
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [timeframe, setTimeframe] = useState<string>('24H');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('candlestick');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate mock chart data based on timeframe and asset
  useEffect(() => {
    const asset = ASSET_DATA[selectedAsset];
    const pointsCount = timeframe === '1H' ? 20 : timeframe === '4H' ? 30 : timeframe === '24H' ? 40 : 60;
    
    let currentPrice = asset.basePrice * (0.95 + Math.random() * 0.05); // Start slightly lower than base
    const data: ChartPoint[] = [];

    const now = new Date();
    for (let i = pointsCount - 1; i >= 0; i--) {
      const timeDiff = timeframe === '1H' ? i * 3 : timeframe === '4H' ? i * 8 : timeframe === '24H' ? i * 36 : i * 24 * 60; // in minutes
      const pointTime = new Date(now.getTime() - timeDiff * 60 * 1000);
      
      const change = currentPrice * (Math.random() * asset.volatility * 2 - asset.volatility);
      const open = currentPrice;
      const close = currentPrice + change;
      
      // Ensure high is always highest and low is lowest
      const margin = Math.abs(change) * (Math.random() * 0.5);
      const high = Math.max(open, close) + margin;
      const low = Math.max(0, Math.min(open, close) - margin);
      
      const volume = Math.floor(1000 + Math.random() * 9000);

      const timeStr = timeframe === '1H' || timeframe === '4H' 
        ? pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : pointTime.toLocaleDateString([], { month: 'short', day: '2-digit' });

      data.push({
        time: timeStr,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume
      });

      currentPrice = close;
    }

    setChartData(data);
    setHoveredPoint(data[data.length - 1]);
  }, [selectedAsset, timeframe]);

  // Handle active price updates in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        if (prev.length === 0) return prev;
        const last = { ...prev[prev.length - 1] };
        const asset = ASSET_DATA[selectedAsset];
        
        // update last candlestick
        const change = last.close * (Math.random() * asset.volatility * 0.4 - asset.volatility * 0.2);
        last.close = Math.round((last.close + change) * 100) / 100;
        if (last.close > last.high) last.high = last.close;
        if (last.close < last.low) last.low = last.close;
        
        const updated = [...prev.slice(0, -1), last];
        // If we are currently hovering over the last point, update the hovered state
        if (hoveredPoint && hoveredPoint.time === last.time) {
          setHoveredPoint(last);
        }
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedAsset, hoveredPoint]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current || chartData.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 50; // padding left
    const width = rect.width - 80; // total chart width space

    const relativeX = Math.max(0, Math.min(x, width));
    const index = Math.min(
      chartData.length - 1,
      Math.max(0, Math.floor((relativeX / width) * chartData.length))
    );

    setHoveredPoint(chartData[index]);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const currentAsset = ASSET_DATA[selectedAsset];
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : currentAsset.basePrice;
  const firstPrice = chartData.length > 0 ? chartData[0].open : currentAsset.basePrice;
  const totalChange = lastPrice - firstPrice;
  const totalChangePct = (totalChange / firstPrice) * 100;
  const isProfit = totalChange >= 0;

  // Find min and max of entire chart for scaling
  const allPrices = chartData.flatMap(d => [d.low, d.high]);
  const minPrice = Math.min(...allPrices) * 0.995;
  const maxPrice = Math.max(...allPrices) * 1.005;
  const priceRange = maxPrice - minPrice;

  // Chart bounds
  const chartWidth = 550;
  const chartHeight = 220;

  return (
    <div className="w-full glass-panel-glow-gold rounded-2xl p-5 border border-gray-800/80 relative" id="trading-chart-wrapper">
      {/* Title Header with Asset Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800/60 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select 
                value={selectedAsset} 
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="bg-gray-950/80 border border-gray-800 text-white font-display font-bold text-lg rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="BTC">BTC / USDT</option>
                <option value="EUR_XAF">EUR / XAF</option>
                <option value="USDT_XAF">USDT / XAF</option>
                <option value="GOLD">GOLD SPOT</option>
                <option value="APPLE">APPLE STOCK</option>
              </select>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-gray-800 rounded text-gray-400">
                PRO CHART
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{currentAsset.name}</p>
          </div>
        </div>

        {/* Live Price Statistics */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block">Current Price</span>
            <span className="font-mono text-lg font-bold text-gray-100">
              {currentAsset.prefix}{lastPrice.toLocaleString()}{currentAsset.suffix}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block">Change (24h)</span>
            <span className={`font-mono text-sm font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfit ? '+' : ''}{totalChangePct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Timeframe & Candle style */}
      <div className="flex items-center justify-between gap-2 mb-3 bg-gray-950/60 border border-gray-900 rounded-lg p-1.5 text-xs">
        <div className="flex items-center gap-1">
          {['1H', '4H', '24H', '7D'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-md font-mono transition-all font-semibold ${
                timeframe === tf 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border-l border-gray-900 pl-3">
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-md transition-all ${
              chartType === 'line' ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Line Chart"
          >
            <Activity className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartType('candlestick')}
            className={`p-1.5 rounded-md transition-all ${
              chartType === 'candlestick' ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Candlestick Chart"
          >
            <BarChart2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Candlestick / Chart Plot Grid */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-gray-950/40 rounded-xl p-3 border border-gray-900/60">
        {/* Coordinate Display Overlay on Hover */}
        {hoveredPoint && (
          <div className="absolute top-2 left-2 flex items-center gap-3 bg-gray-900/95 border border-gray-800 rounded-md py-1 px-2.5 text-[10px] font-mono z-10 text-gray-300 pointer-events-none">
            <span>T: <strong className="text-white">{hoveredPoint.time}</strong></span>
            <span>O: <strong className={hoveredPoint.close >= hoveredPoint.open ? 'text-emerald-400' : 'text-rose-400'}>{hoveredPoint.open}</strong></span>
            <span>H: <strong className="text-white">{hoveredPoint.high}</strong></span>
            <span>L: <strong className="text-white">{hoveredPoint.low}</strong></span>
            <span>C: <strong className={hoveredPoint.close >= hoveredPoint.open ? 'text-emerald-400' : 'text-rose-400'}>{hoveredPoint.close}</strong></span>
          </div>
        )}

        {/* Scaled Candlestick SVGs */}
        {chartData.length > 0 ? (
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(chartData[chartData.length - 1])}
          >
            {/* Grid Lines */}
            {[0.25, 0.5, 0.75].map((ratio, idx) => (
              <line
                key={idx}
                x1={0}
                y1={chartHeight * ratio}
                x2={chartWidth - 50}
                y2={chartHeight * ratio}
                stroke="#1f2937"
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
            ))}

            {/* Vertical divisions */}
            {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => (
              <line
                key={idx}
                x1={(chartWidth - 50) * ratio}
                y1={0}
                x2={(chartWidth - 50) * ratio}
                y2={chartHeight}
                stroke="#1f2937"
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
            ))}

            {/* Render Candlesticks or Line Paths */}
            {chartType === 'line' ? (
              // Line Path
              <path
                d={chartData.reduce((pathStr, d, idx) => {
                  const x = (idx / (chartData.length - 1)) * (chartWidth - 55) + 5;
                  const y = chartHeight - ((d.close - minPrice) / priceRange) * (chartHeight - 20) - 10;
                  return pathStr + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="url(#chartGradient)"
                strokeWidth={2.5}
              />
            ) : (
              // Candlesticks
              chartData.map((d, idx) => {
                const x = (idx / (chartData.length - 1)) * (chartWidth - 55) + 5;
                const top = chartHeight - ((Math.max(d.open, d.close) - minPrice) / priceRange) * (chartHeight - 20) - 10;
                const bottom = chartHeight - ((Math.min(d.open, d.close) - minPrice) / priceRange) * (chartHeight - 20) - 10;
                const candleHigh = chartHeight - ((d.high - minPrice) / priceRange) * (chartHeight - 20) - 10;
                const candleLow = chartHeight - ((d.low - minPrice) / priceRange) * (chartHeight - 20) - 10;
                
                const isGreen = d.close >= d.open;
                const color = isGreen ? '#00C853' : '#F43F5E';
                const bodyWidth = Math.max(2, (chartWidth - 50) / chartData.length * 0.6);

                return (
                  <g key={idx}>
                    {/* Wick Line */}
                    <line
                      x1={x}
                      y1={candleHigh}
                      x2={x}
                      y2={candleLow}
                      stroke={color}
                      strokeWidth={1.2}
                    />
                    {/* Candle Body */}
                    <rect
                      x={x - bodyWidth / 2}
                      y={top}
                      width={bodyWidth}
                      height={Math.max(1.5, bottom - top)}
                      fill={color}
                      stroke={color}
                      strokeWidth={0.5}
                    />
                  </g>
                );
              })
            )}

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00C853" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>

            {/* Price markers on Y axis */}
            <text x={chartWidth - 42} y={15} fill="#6b7280" fontSize="8" fontFamily="monospace">
              {currentAsset.prefix}{maxPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </text>
            <text x={chartWidth - 42} y={chartHeight / 2} fill="#6b7280" fontSize="8" fontFamily="monospace">
              {currentAsset.prefix}{((maxPrice + minPrice) / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </text>
            <text x={chartWidth - 42} y={chartHeight - 10} fill="#6b7280" fontSize="8" fontFamily="monospace">
              {currentAsset.prefix}{minPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </text>

            {/* Horizontal Line on Hover */}
            {hoveredPoint && (
              <line
                x1={0}
                y1={chartHeight - ((hoveredPoint.close - minPrice) / priceRange) * (chartHeight - 20) - 10}
                x2={chartWidth - 50}
                y2={chartHeight - ((hoveredPoint.close - minPrice) / priceRange) * (chartHeight - 20) - 10}
                stroke="#6b7280"
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
            )}
          </svg>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <Activity className="h-8 w-8 animate-pulse text-amber-500/40 mb-2" />
            <p className="text-xs font-mono">Generating Stock Coordinates...</p>
          </div>
        )}
      </div>

      {/* Footnote showing exchange assurance */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 font-mono mt-3">
        <span className="flex items-center gap-1">
          <Globe className="h-3 w-3 text-amber-400" /> Standardized Feed | Secured Exchange Server
        </span>
        <span className="text-right text-[9px] text-gray-600 font-sans mt-1 sm:mt-0">
          *All currency calculations mapped in Central African Francs (XAF).
        </span>
      </div>
    </div>
  );
}
