import { useState, useEffect } from 'react';
import { User, InvestmentPlan } from './types';
import Ticker from './components/Ticker';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TradingViewChart from './components/TradingViewChart';
import Calculator from './components/Calculator';
import AIChatbot from './components/AIChatbot';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

import { 
  ArrowUpRight, TrendingUp, ShieldCheck, Landmark, ShieldAlert, Zap, Users, Globe, BookOpen, 
  ChevronDown, HelpCircle, Activity, Award, Flame, CheckCircle, Mail, Phone, Calendar, Star
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [tickerData, setTickerData] = useState<any[]>([]);

  // Live transaction popups to mimic Binance / Robinhood trading desk activity
  const [liveNotification, setLiveNotification] = useState<string | null>(null);

  // FAQ Accordion status
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    // Attempt automatic session restore
    checkSession();
    fetchPlans();
    startLiveNotifications();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/current');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (e) {
      console.error('Session restoration failed:', e);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (e) {
      console.error('Error fetching plans:', e);
    }
  };

  const handleRefreshCurrentUser = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/user/profile/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error('Failed to sync profile:', e);
    }
  };

  const startLiveNotifications = () => {
    const locations = ['Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua', 'Bafoussam', 'Limbe', 'Kribi'];
    const names = ['Poumie N.', 'Rose M.', 'Jean K.', 'Ousmanou B.', 'Ewane S.', 'Fouda A.', 'Nsame G.', 'Bello Y.', 'Mbeh C.'];
    const actions = [
      'just locked 25,000 XAF in Starter Plan A 📈',
      'just deposited 150,000 XAF via MTN MoMo 💸',
      'just liquidated 50,000 XAF Orange Money payout 🪙',
      'just locked 350,000 XAF in VVIP Luxury Plan C ⭐',
      'just earned 10,000 XAF Affiliate bonus 👥',
      'just deposited 200,000 XAF bank transfer 🏦'
    ];

    const showRandomNotification = () => {
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const act = actions[Math.floor(Math.random() * actions.length)];
      
      setLiveNotification(`🟢 [${loc}] ${name} ${act}`);
      setTimeout(() => setLiveNotification(null), 5000);
    };

    // Show initial one, then every 20 seconds
    setTimeout(showRandomNotification, 4000);
    const interval = setInterval(showRandomNotification, 22000);
    return () => clearInterval(interval);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const staticFaqs = [
    {
      q: "How does the 24-Hour guaranteed return system operate?",
      a: "GLOBAL EXCHANGE AND TRADE INVESTMENTS allocates investor capital directly into computer-managed quantitative trading pools. By arbitrage hedging between high-volume global fiat rates and digital currencies, we secure stable price differentials, allowing us to guarantee and pay out standard daily yields ranging from 20% to 30%."
    },
    {
      q: "What are the payment merchants, minimum amounts, and fees?",
      a: "We support MTN Mobile Money, Orange Money, direct bank transfers, and standard cryptocurrency networks (BTC / USDT TRC20). The absolute minimum deposit amount is 1,000 XAF, and we charge 0% processing fees on deposits and withdrawals."
    },
    {
      q: "Are withdrawals instant and how long do they take?",
      a: "Yes! Once you submit a liquidation request in the panel, our audit desk evaluates the cryptographic block. Approved funds are processed instantly and arrive in your specified mobile money account or blockchain wallet within 30 minutes, 24/7."
    },
    {
      q: "Is there an affiliate referral network program?",
      a: "Absolutely! When you share your exclusive link, you acquire 1,000 XAF instantly for every active investor you refer to the platform. In addition, the referred user receives a welcome credit bonus of 2,000 XAF instantly upon sign-up!"
    }
  ];

  return (
    <div className="min-h-screen bg-[#060811] text-gray-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-black">
      
      {/* Background Star Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[1200px] right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Real-time Market Data Ticker */}
      <Ticker />

      {/* Sticky Top Navbar */}
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onNavigate={setCurrentPage} 
        currentPage={currentPage}
      />

      {/* Real-time platform popup alerts */}
      {liveNotification && (
        <div className="fixed bottom-24 left-6 z-50 bg-black/95 border border-amber-500/30 rounded-xl px-4 py-3.5 shadow-2xl animate-in slide-in-from-left-6 duration-300 max-w-sm">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-300">{liveNotification}</span>
          </div>
        </div>
      )}

      {/* Primary Routing Content Body */}
      <main className="flex-grow">
        
        {/* HOMEPAGE VIEW */}
        {currentPage === 'home' && (
          <div className="space-y-24 animate-in fade-in duration-500" id="homepage-root">
            
            {/* HERO SECTION */}
            <section className="relative pt-12 md:pt-20 pb-16" id="hero-panel">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Hero Words Left */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                    <Zap className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                    FinTech Quantitative Hedging Solution
                  </div>

                  <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight text-white">
                    Grow Your Investment in Just <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 underline decoration-yellow-400/40">24 Hours</span>
                  </h1>

                  <p className="text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                    Invest securely and receive guaranteed, high-performance returns based on your selected investment plan. Backed by automated reserves and leading mobile networks Orange & MTN.
                  </p>

                  {/* Actions CTA buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                    <button
                      onClick={() => setCurrentPage(currentUser ? 'dashboard' : 'auth_register')}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/10 hover:scale-105 transition duration-300 flex items-center justify-center gap-2"
                    >
                      Start Investing Now <ArrowUpRight className="h-4 w-4 shrink-0" />
                    </button>
                    <a
                      href="#live-charts"
                      className="w-full sm:w-auto px-8 py-4 bg-gray-950/80 hover:bg-gray-900 border border-gray-800 hover:border-amber-500/30 text-gray-300 hover:text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition duration-200 text-center"
                    >
                      Watch Live Markets
                    </a>
                  </div>

                  {/* Trust Highlights */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-900 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                    <div>
                      <span className="font-mono text-xl font-extrabold text-white">24h</span>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-0.5">Yield Release</p>
                    </div>
                    <div>
                      <span className="font-mono text-xl font-extrabold text-white">20% - 30%</span>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-0.5">Guaranteed Profit</p>
                    </div>
                    <div>
                      <span className="font-mono text-xl font-extrabold text-white">0 XAF</span>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-0.5">Transaction Fees</p>
                    </div>
                  </div>
                </div>

                {/* Hero Right: Live Quantitative Interactive Chart Widget */}
                <div className="lg:col-span-5 relative" id="live-charts">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl blur opacity-15 pointer-events-none" />
                  <div className="relative bg-[#050811] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-gray-900 bg-gray-950/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] font-mono uppercase font-bold text-gray-400">BTC / XAF Live Arbitration Engine</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">HEDGED v2.5</span>
                    </div>
                    {/* Render Interactive chart */}
                    <div className="p-4 h-[280px]">
                      <TradingViewChart />
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* INVESTMENT PLANS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20" id="plans">
              <div className="text-center space-y-2 mb-12">
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                  Select Your Portfolio Tier
                </span>
                <h2 className="font-display font-black text-2xl sm:text-4xl text-white">
                  Audited Institutional Investment Plans
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  Lock your capital securely for 24 hours. Interest rewards are generated by automatic arbitrage liquidations and settled directly in Mobile Money XAF balances.
                </p>
              </div>

              {/* Plans Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Plan A */}
                <div className="glass-panel rounded-2xl p-6 border border-gray-800/80 hover:border-amber-400/40 transition duration-300 flex flex-col justify-between h-[340px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 font-mono text-xs font-black text-amber-400/10 group-hover:text-amber-400/25 transition">
                    PLAN A
                  </div>
                  <div className="space-y-4">
                    <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] uppercase font-mono font-bold text-amber-400">
                      Starter Tier
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Plan A (Bronze Starter)</h3>
                      <p className="text-[11px] text-gray-500 font-mono mt-1">Ideal for beginners starting small.</p>
                    </div>
                    <div className="font-mono py-2 border-y border-gray-900/60">
                      <span className="text-[10px] text-gray-500 uppercase block">ALLOWED LIMIT</span>
                      <strong className="text-base text-gray-200">1,000 – 50,000 XAF</strong>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-xs text-gray-400">Guaranteed Return:</span>
                      <span className="font-mono text-lg font-black text-emerald-400">+20%</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentUser ? 'dashboard' : 'auth_register')}
                      className="w-full py-3 bg-gray-950/60 hover:bg-amber-400 border border-gray-800 hover:border-amber-400 text-gray-300 hover:text-black font-mono font-bold text-[11px] uppercase tracking-wider rounded-xl transition duration-200"
                    >
                      Invest in Plan A
                    </button>
                  </div>
                </div>

                {/* Plan B */}
                <div className="glass-panel-glow-gold rounded-2xl p-6 border border-amber-500/20 hover:border-amber-400 transition duration-300 flex flex-col justify-between h-[340px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 font-mono text-xs font-black text-amber-400/15 group-hover:text-amber-400/30 transition">
                    PLAN B
                  </div>
                  <div className="space-y-4">
                    <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded text-[9px] uppercase font-mono font-bold text-amber-400">
                      Popular Gold Tier
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Plan B (Gold Medium)</h3>
                      <p className="text-[11px] text-gray-500 font-mono mt-1">Accelerated quantitative yield tier.</p>
                    </div>
                    <div className="font-mono py-2 border-y border-gray-900/60">
                      <span className="text-[10px] text-gray-500 uppercase block">ALLOWED LIMIT</span>
                      <strong className="text-base text-gray-100">51,000 – 200,000 XAF</strong>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-xs text-gray-400">Guaranteed Return:</span>
                      <span className="font-mono text-lg font-black text-amber-400">+25%</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentUser ? 'dashboard' : 'auth_register')}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-mono font-bold text-[11px] uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/10"
                    >
                      Invest in Plan B
                    </button>
                  </div>
                </div>

                {/* Plan C */}
                <div className="glass-panel rounded-2xl p-6 border border-gray-800/80 hover:border-amber-400/40 transition duration-300 flex flex-col justify-between h-[340px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 font-mono text-xs font-black text-amber-400/10 group-hover:text-amber-400/25 transition">
                    PLAN C
                  </div>
                  <div className="space-y-4">
                    <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] uppercase font-mono font-bold text-purple-400">
                      VVIP Wealth Tier
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Plan C (VVIP Luxury)</h3>
                      <p className="text-[11px] text-gray-500 font-mono mt-1">Full-service VIP institutional yield.</p>
                    </div>
                    <div className="font-mono py-2 border-y border-gray-900/60">
                      <span className="text-[10px] text-gray-500 uppercase block">ALLOWED LIMIT</span>
                      <strong className="text-base text-gray-200">210,000+ XAF</strong>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-xs text-gray-400">Guaranteed Return:</span>
                      <span className="font-mono text-lg font-black text-purple-400">+30%</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentUser ? 'dashboard' : 'auth_register')}
                      className="w-full py-3 bg-gray-950/60 hover:bg-amber-400 border border-gray-800 hover:border-amber-400 text-gray-300 hover:text-black font-mono font-bold text-[11px] uppercase tracking-wider rounded-xl transition duration-200"
                    >
                      Invest in Plan C
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* PROFIT CALCULATOR SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20" id="calculator">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Words Left */}
                <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                    Forecast Earnings
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-4xl text-white">
                    Real-Time Investment Profit Calculator
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    Accurately audit and calculate your net profit, total accruals, and direct payout values instantly by selecting your capital limit. No hidden administrative fees.
                  </p>
                  
                  {/* Security items */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="p-1 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-400 shrink-0">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-xs text-gray-300 font-semibold">100% Capital Principal Shield Protection</span>
                    </div>
                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="p-1 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-400 shrink-0">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-xs text-gray-300 font-semibold">Automatic Settlement after 24 Hours lock</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Calculator Right */}
                <div className="lg:col-span-7">
                  <div className="glass-panel-glow-gold rounded-2xl border border-gray-800 p-6 relative">
                    <Calculator />
                  </div>
                </div>

              </div>
            </section>

            {/* ABOUT US & SECURITY PROTOCOLS */}
            <section className="bg-gradient-to-b from-[#0B132B]/20 to-black/40 py-16 scroll-mt-20" id="about">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Side: Highlights of our Douala FinTech Team */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                    About Our Platform
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-4xl text-white">
                    The Safest FinTech Hedging Engine in Douala
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    Founded by veteran quantitative analysts, GLOBAL EXCHANGE AND TRADE INVESTMENTS bridges global financial liquidity and Cameroon investors. By using professional computer-driven hedging protocols, we hedge assets against high-frequency rates, creating a fully protected environment for stable yields.
                  </p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-gray-950/80 border border-gray-900 rounded-xl">
                      <span className="text-lg font-mono font-black text-amber-400">250M+ XAF</span>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">Total Audited Settlements</p>
                    </div>
                    <div className="p-4 bg-gray-950/80 border border-gray-900 rounded-xl">
                      <span className="text-lg font-mono font-black text-emerald-400">12,000+</span>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">Active Secured Portfolios</p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Security Protocols Bento boxes */}
                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#101323] border border-gray-800 rounded-2xl p-5 space-y-3">
                    <div className="p-2.5 bg-amber-400/10 rounded-xl text-amber-400 w-fit">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono">Principal Protection</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      We secure investor principals inside ring-fenced hedging reserves, insulating funds from market liquidations.
                    </p>
                  </div>

                  <div className="bg-[#101323] border border-gray-800 rounded-2xl p-5 space-y-3">
                    <div className="p-2.5 bg-emerald-400/10 rounded-xl text-emerald-400 w-fit">
                      <Activity className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono">MTN / Orange Gateway</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Direct SSL API bindings with MTN MoMo & Orange Money ensure zero processing delay on deposits & withdrawals.
                    </p>
                  </div>

                  <div className="bg-[#101323] border border-gray-800 rounded-2xl p-5 space-y-3">
                    <div className="p-2.5 bg-purple-400/10 rounded-xl text-purple-400 w-fit">
                      <Users className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono">Affiliate Multiplier</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Receive lifetime commissions of 1,000 XAF for every colleague you refer, expanding Cameroon wealth.
                    </p>
                  </div>

                  <div className="bg-[#101323] border border-gray-800 rounded-2xl p-5 space-y-3">
                    <div className="p-2.5 bg-rose-400/10 rounded-xl text-rose-400 w-fit">
                      <Globe className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono">24/7 AI Desk</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Our custom-grounded CamBot AI support agent operates around the clock to respond to deposit or plan queries.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* PLATFORM FAQ ACCORDIONS */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20" id="faq">
              <div className="text-center space-y-2 mb-12">
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                  Audited Frequently Asked Questions
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                  Platform Clarifications & FAQs
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Have a question before locking your capital? Read our direct answers compiled by our Douala compliance desk.
                </p>
              </div>

              {/* Accordion container */}
              <div className="space-y-4">
                {staticFaqs.map((faq, i) => (
                  <div 
                    key={i} 
                    className="bg-gray-950/80 border border-gray-900 rounded-2xl overflow-hidden transition duration-200"
                  >
                    <button
                      onClick={() => toggleFaq(i)}
                      className="w-full text-left p-5 flex items-center justify-between text-xs font-bold text-white hover:text-amber-400 transition"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4.5 w-4.5 text-gray-500 transition-transform duration-300 ${faqOpenIndex === i ? 'rotate-180 text-amber-400' : ''}`} />
                    </button>
                    {faqOpenIndex === i && (
                      <div className="px-5 pb-5 pt-1 text-xs text-gray-400 leading-relaxed border-t border-gray-900/40 animate-in fade-in duration-250">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* PLANS VIEW (STANDALONE DIRECT ACCESS) */}
        {currentPage === 'plans' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
            <div className="text-center space-y-2 mb-12">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                Platform Contracts
              </span>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-white">
                Guaranteed Yield Plans Catalog
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div key={p.id} className="glass-panel rounded-2xl p-6 border border-gray-800 hover:border-amber-400/40 transition duration-300 flex flex-col justify-between h-[320px]">
                  <div className="space-y-4">
                    <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] uppercase font-mono font-bold text-amber-400">
                      Guaranteed Arbitrage Contract
                    </span>
                    <h3 className="font-display font-bold text-lg text-white">{p.name}</h3>
                    <div className="font-mono py-2 border-y border-gray-900/60">
                      <span className="text-[10px] text-gray-500 uppercase block">LIMIT RANGE</span>
                      <strong className="text-base text-gray-200">{p.minAmount.toLocaleString()} XAF – {p.maxAmount.toLocaleString()} XAF</strong>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-xs text-gray-400">Expected Profit Yield:</span>
                      <span className="font-mono text-lg font-black text-emerald-400">+{p.returnRate}% in 24h</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentUser ? 'dashboard' : 'auth_register')}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-mono font-bold text-[11px] uppercase tracking-wider rounded-xl transition duration-200"
                    >
                      Invest Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CALCULATOR STANDALONE VIEW */}
        {currentPage === 'calculator' && (
          <div className="max-w-2xl mx-auto px-4 py-16 animate-in fade-in duration-300">
            <div className="text-center space-y-1 mb-8">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">Yield Return Forecaster</h2>
              <p className="text-xs text-gray-400">Tune capital range inputs below to audit real-time interest returns.</p>
            </div>
            <div className="glass-panel-glow-gold border border-gray-800 p-6 rounded-2xl">
              <Calculator />
            </div>
          </div>
        )}

        {/* ABOUT US STANDALONE VIEW */}
        {currentPage === 'about' && (
          <div className="max-w-3xl mx-auto px-4 py-16 animate-in fade-in duration-300 space-y-6 text-xs text-gray-400 leading-relaxed">
            <h2 className="font-display font-black text-2xl text-white text-center">About GLOBAL EXCHANGE AND TRADE INVESTMENTS Hedging Protocols</h2>
            <p>
              GLOBAL EXCHANGE AND TRADE INVESTMENTS is the standard-bearer FinTech hedging operator registered under Co. Reg No. CAM-6701-DL. We coordinate computer-driven quant trading models out of our Douala office blocks.
            </p>
            <p>
              By routing investor capital pools directly into automated rate liquidation modules on leading global exchanges, we capture fast price differentials before rates adjust. This arbitrage margin provides a risk-free channel to settle daily interest payments to our registered users.
            </p>
            <div className="bg-gray-950 p-4 border border-gray-900 rounded-xl flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-gray-500 font-mono">
                Platform is audited and supported by full capital reserves of 100,000,000 XAF, held in fiduciary escrow accounts to guard client principals.
              </p>
            </div>
          </div>
        )}

        {/* FAQ STANDALONE VIEW */}
        {currentPage === 'faq' && (
          <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-300 space-y-6">
            <h2 className="font-display font-black text-2xl text-white text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {staticFaqs.map((faq, i) => (
                <div key={i} className="bg-gray-950 border border-gray-900 rounded-xl p-5 space-y-2">
                  <h4 className="text-xs font-bold text-white font-mono">{faq.q}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUTHENTICATION VIEW */}
        {(currentPage === 'auth_login' || currentPage === 'auth_register') && (
          <Auth 
            initialMode={currentPage === 'auth_login' ? 'login' : 'register'}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              setCurrentPage('dashboard');
            }}
            onNavigate={setCurrentPage}
          />
        )}

        {/* USER PORTFOLIO DASHBOARD VIEW */}
        {currentPage === 'dashboard' && currentUser && (
          <Dashboard 
            currentUser={currentUser}
            onRefreshUser={handleRefreshCurrentUser}
            onNavigate={setCurrentPage}
          />
        )}

        {/* ADMINISTRATIVE PORTAL VIEW */}
        {currentPage === 'admin' && (
          <AdminPanel 
            onNavigate={setCurrentPage}
          />
        )}

        {/* TERMS OF SERVICE VIEW */}
        {currentPage === 'terms' && (
          <div className="max-w-3xl mx-auto px-4 py-16 animate-in fade-in duration-300 space-y-6 text-xs text-gray-400 leading-relaxed">
            <h2 className="font-display font-black text-2xl text-white">Terms of Services & Disclosures</h2>
            <p className="font-mono text-[10px] uppercase">Last updated: July 2026</p>
            <p>
              Please read these terms carefully before starting investments. By registering an account, you confirm agreement to the following rules:
            </p>
            <p>
              1. <strong>Investment Terms:</strong> Capital registered in Plan A, B, or C is locked in quantitative arbitration contracts for a duration of 24 Hours. Interest rates are settled after contract countdown completion.
            </p>
            <p>
              2. <strong>Deposit Audit:</strong> MTN MoMo and Orange Money deposits are credited to available portfolios upon validation of screenshot receipt proof by the administrative desk. Submitting falsified receipts will lead to immediate account suspension.
            </p>
          </div>
        )}

        {/* PRIVACY PROTECTION POLICY VIEW */}
        {currentPage === 'privacy' && (
          <div className="max-w-3xl mx-auto px-4 py-16 animate-in fade-in duration-300 space-y-6 text-xs text-gray-400 leading-relaxed">
            <h2 className="font-display font-black text-2xl text-white">Privacy Protection Policy</h2>
            <p>
              Your personal data, handset numbers, and Mobile Money transfer screenshots are protected via 256-bit SSL cryptography and stored in secure, encrypted JSON backend files. No information is disclosed to third-party brokers under any circumstances.
            </p>
          </div>
        )}

      </main>

      {/* Primary Customer Support Chatbot floating button */}
      <AIChatbot />

      {/* Primary Page Footer */}
      <Footer onNavigate={setCurrentPage} />

    </div>
  );
}
