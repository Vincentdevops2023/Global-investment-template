import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, TrendingUp, HelpCircle, ShieldCheck } from 'lucide-react';

export default function Calculator() {
  const [amount, setAmount] = useState<number>(100000);
  const [profit, setProfit] = useState<number>(25000);
  const [total, setTotal] = useState<number>(125000);
  const [activePlan, setActivePlan] = useState<'plan_a' | 'plan_b' | 'plan_c'>('plan_b');
  const [rate, setRate] = useState<number>(25);

  useEffect(() => {
    let currentRate = 20;
    let plan: 'plan_a' | 'plan_b' | 'plan_c' = 'plan_a';

    if (amount >= 1000 && amount <= 50000) {
      currentRate = 20;
      plan = 'plan_a';
    } else if (amount >= 51000 && amount <= 200000) {
      currentRate = 25;
      plan = 'plan_b';
    } else if (amount >= 210000) {
      currentRate = 30;
      plan = 'plan_c';
    }

    setRate(currentRate);
    setActivePlan(plan);
    const calculatedProfit = Math.round(amount * (currentRate / 100));
    setProfit(calculatedProfit);
    setTotal(amount + calculatedProfit);
  }, [amount]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const getPlanBadgeName = () => {
    switch (activePlan) {
      case 'plan_a': return 'PLAN A (Starter - 20%)';
      case 'plan_b': return 'PLAN B (Gold - 25%)';
      case 'plan_c': return 'PLAN C (VVIP Gold - 30%)';
    }
  };

  const getPlanBadgeColor = () => {
    switch (activePlan) {
      case 'plan_a': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'plan_b': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'plan_c': return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold';
    }
  };

  return (
    <div className="w-full glass-panel-glow-gold rounded-2xl p-6 border border-gray-800" id="investment-calculator">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
          <Percent className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-white">Guaranteed Return Calculator</h3>
          <p className="text-xs text-gray-400">Calculate your exact profits instantly based on live plans</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Input box */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
            Investment Amount (XAF)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1000}
              placeholder="Enter amount (Min 1,000 XAF)"
              className="w-full bg-gray-950/80 border border-gray-800 text-white font-mono text-xl font-bold rounded-xl pl-4 pr-16 py-3.5 focus:outline-none focus:border-amber-400 transition"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-mono text-xs">
              XAF
            </div>
          </div>
        </div>

        {/* Range Slider for convenience */}
        <div className="pt-2">
          <input
            type="range"
            min="1000"
            max="1000000"
            step="1000"
            value={amount}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-1">
            <span>1,000 XAF</span>
            <span>500,000 XAF</span>
            <span>1,000,000 XAF</span>
          </div>
        </div>

        {/* Current qualified plan indicator */}
        <div className="flex items-center justify-between p-3 bg-gray-950/40 rounded-xl border border-gray-900/60">
          <span className="text-xs text-gray-400">Eligible Tier Plan:</span>
          <span className={`text-[11px] font-mono px-2.5 py-1 rounded border uppercase tracking-wider ${getPlanBadgeColor()}`}>
            {getPlanBadgeName()}
          </span>
        </div>

        {/* Grid displays */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3">
          {/* principal */}
          <div className="bg-gray-950/60 border border-gray-900 rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block mb-1">
              Your Investment
            </span>
            <span className="font-mono text-lg font-bold text-gray-100">
              {amount.toLocaleString()} XAF
            </span>
          </div>

          {/* profit */}
          <div className="bg-emerald-950/10 border border-emerald-950/30 rounded-xl p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5 bg-emerald-500/10 text-emerald-400 rounded-bl-lg">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-500 block mb-1">
              Net Profit (24h)
            </span>
            <span className="font-mono text-lg font-bold text-emerald-400">
              + {profit.toLocaleString()} XAF
            </span>
          </div>

          {/* total payout */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5 bg-amber-500/10 text-amber-400 rounded-bl-lg">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block mb-1">
              Total Return (24h)
            </span>
            <span className="font-mono text-lg font-bold text-amber-400">
              {total.toLocaleString()} XAF
            </span>
          </div>
        </div>

        {/* Disclaimer hint */}
        <p className="text-[10px] text-gray-500 leading-normal text-center">
          *Rates are guaranteed. Funds are locked for exactly 24 hours to secure hedging contracts. Payout automatically moves into your withdrawal balance upon completion.
        </p>
      </div>
    </div>
  );
}
