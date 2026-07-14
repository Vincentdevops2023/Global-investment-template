import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

const INITIAL_ITEMS: TickerItem[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: '94,540.20', change: '+2.41%', isUp: true },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: '3,845.50', change: '+1.85%', isUp: true },
  { symbol: 'SOL/USDT', name: 'Solana', price: '215.10', change: '-0.95%', isUp: false },
  { symbol: 'EUR/XAF', name: 'Euro/Franc CFA', price: '655.95', change: '0.00%', isUp: true },
  { symbol: 'USD/XAF', name: 'USD/Franc CFA', price: '602.40', change: '+0.15%', isUp: true },
  { symbol: 'USDT/XAF', name: 'USDT/Franc CFA', price: '614.50', change: '+0.25%', isUp: true },
  { symbol: 'XAU/USD', name: 'Gold Spot', price: '2,684.30', change: '+1.10%', isUp: true },
  { symbol: 'BRENT', name: 'Brent Crude', price: '78.45', change: '-1.45%', isUp: false },
  { symbol: 'AAPL', name: 'Apple Inc.', price: '184.25', change: '+0.88%', isUp: true },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '172.10', change: '+1.32%', isUp: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: '422.50', change: '-0.42%', isUp: false },
];

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>(INITIAL_ITEMS);

  // Simulate price changes for ultra realism
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => {
        // Change Brent Crude or stable coins less
        if (item.symbol.includes('XAF') || item.symbol === 'EUR/XAF') {
          return item;
        }

        const currentPriceNum = parseFloat(item.price.replace(/,/g, ''));
        const changePercent = (Math.random() * 0.4 - 0.2) / 100; // max 0.2% change
        const newPriceNum = currentPriceNum * (1 + changePercent);
        
        const priceStr = newPriceNum.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });

        const currentChangeNum = parseFloat(item.change.replace(/%/g, ''));
        const newChangeNum = currentChangeNum + changePercent * 100;
        const changeStr = (newChangeNum >= 0 ? '+' : '') + newChangeNum.toFixed(2) + '%';

        return {
          ...item,
          price: priceStr,
          change: changeStr,
          isUp: newChangeNum >= 0
        };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Double the list for infinite marquee scrolling
  const doubleItems = [...items, ...items];

  return (
    <div className="w-full bg-[#070b13] border-b border-gray-800/60 py-2.5 text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-mono font-medium tracking-wider uppercase shrink-0 text-[10px]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          Live Market
        </div>

        {/* Ticker Container */}
        <div className="ticker-wrap w-full ml-4 overflow-hidden relative">
          <div className="ticker-content flex items-center gap-8 whitespace-nowrap">
            {doubleItems.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 font-mono">
                <span className="text-gray-400 font-sans font-medium text-[11px]">{item.name}</span>
                <span className="text-gray-500 font-semibold">{item.symbol}</span>
                <span className="text-gray-100 font-semibold">{item.price}</span>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1 py-0.5 rounded ${
                  item.isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {item.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
