import React, { useState, useEffect } from 'react';
import { User, Investment, Transaction, Referral, SupportTicket, InvestmentPlan } from '../types';
import { 
  DollarSign, TrendingUp, Landmark, Users, ArrowUpCircle, ArrowDownCircle, Clock, 
  HelpCircle, Copy, Check, Upload, Send, MessageSquare, ShieldCheck, Lock, AlertCircle, RefreshCw
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  onRefreshUser: () => void;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ currentUser, onRefreshUser, onNavigate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'invest' | 'deposit' | 'withdraw' | 'referrals' | 'support' | 'security'>('overview');
  
  // Lists fetched from APIs
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  
  // Form states
  const [investAmount, setInvestAmount] = useState<number>(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_a');
  
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('MTN Mobile Money');
  const [depositPhone, setDepositPhone] = useState('');
  const [depositName, setDepositName] = useState('');
  const [receiptProof, setReceiptProof] = useState<string | null>(null);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('MTN Mobile Money');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawName, setWithdrawName] = useState('');
  
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Status variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load user data
  useEffect(() => {
    fetchUserData();
  }, [currentUser.id, activeTab]);

  const fetchUserData = async () => {
    try {
      const [txRes, invRes, refRes, tickRes, statsRes] = await Promise.all([
        fetch(`/api/user/transactions/${currentUser.id}`),
        fetch(`/api/user/investments/${currentUser.id}`),
        fetch(`/api/user/referrals/${currentUser.id}`),
        fetch(`/api/tickets/${currentUser.id}`),
        fetch('/api/admin/stats')
      ]);

      if (txRes.ok) setTransactions(await txRes.json());
      if (invRes.ok) setInvestments(await invRes.json());
      if (refRes.ok) setReferrals(await refRes.json());
      if (tickRes.ok) setTickets(await tickRes.json());
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setPlans(stats.plans);
      }
    } catch (e) {
      console.error('Error fetching user logs:', e);
    }
  };

  // Process receipt proof conversion to base64
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNewInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (investAmount <= 0) return setError('Please enter a valid investment amount');

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          planId: selectedPlanId,
          amount: investAmount
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return setError(data.error);
      }

      setSuccess(data.message);
      setInvestAmount(0);
      onRefreshUser();
      fetchUserData();
      setActiveTab('overview');
    } catch (err) {
      setLoading(false);
      setError('Connection error.');
    }
  };

  const handleNewDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return setError('Please enter a deposit amount');
    if (!receiptProof) return setError('Please upload your screenshot payment proof to verify deposit');

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: Number(depositAmount),
          method: depositMethod,
          accountNumber: depositPhone,
          accountName: depositName,
          paymentProof: receiptProof
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) return setError(data.error);

      setSuccess(data.message);
      setDepositAmount('');
      setDepositPhone('');
      setDepositName('');
      setReceiptProof(null);
      fetchUserData();
    } catch (err) {
      setLoading(false);
      setError('Connection error.');
    }
  };

  const handleNewWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return setError('Please enter a withdrawal amount');
    if (!withdrawPhone || !withdrawName) return setError('Please enter account number and name');

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: Number(withdrawAmount),
          method: withdrawMethod,
          accountNumber: withdrawPhone,
          accountName: withdrawName
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) return setError(data.error);

      setSuccess(data.message);
      setWithdrawAmount('');
      setWithdrawPhone('');
      setWithdrawName('');
      onRefreshUser();
      fetchUserData();
    } catch (err) {
      setLoading(false);
      setError('Connection error.');
    }
  };

  const handleNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return setError('Subject and message cannot be empty');

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          subject: ticketSubject,
          message: ticketMessage
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) return setError(data.error);

      setSuccess(data.message);
      setTicketSubject('');
      setTicketMessage('');
      fetchUserData();
    } catch (err) {
      setLoading(false);
      setError('Connection error.');
    }
  };

  const handleTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !selectedTicket) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'user',
          senderName: currentUser.fullName,
          message: ticketReplyText
        })
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        setSelectedTicket(updatedTicket);
        setTicketReplyText('');
        fetchUserData();
      }
    } catch (err) {
      console.error('Error replying to ticket:', err);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${currentUser.username}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple countdown string helper
  const getTimerString = (hours: number) => {
    if (hours <= 0) return 'Completed';
    const totalSecs = hours * 3600;
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    return `${h}h ${m}m remaining`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="user-dashboard-wrapper">
      
      {/* Title greeting and quick action button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            Investor Portfolio
          </h2>
          <p className="text-xs text-gray-400">Account status: <span className="text-emerald-400 font-bold uppercase font-mono">ACTIVE (SECURED)</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { fetchUserData(); onRefreshUser(); }}
            className="p-2.5 bg-gray-950/60 border border-gray-800 hover:border-amber-400 rounded-xl text-gray-400 hover:text-amber-400 transition"
            title="Sync Balances"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setActiveTab('invest')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/10 hover:scale-105 transition"
          >
            + New Investment
          </button>
        </div>
      </div>

      {/* PORTFOLIO STATE SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8" id="portfolio-metrics-grid">
        
        {/* balance */}
        <div className="bg-[#101323] border border-gray-800/80 rounded-2xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2.5 text-gray-600">
            <Landmark className="h-5 w-5" />
          </div>
          <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500 block">Trading Balance</span>
          <div>
            <span className="font-mono text-lg font-black text-white">{currentUser.totalBalance.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 font-mono block mt-0.5">XAF</span>
          </div>
        </div>

        {/* active investment */}
        <div className="bg-[#15231c] border border-emerald-950/40 rounded-2xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2.5 text-emerald-600">
            <Clock className="h-5 w-5" />
          </div>
          <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-400 block">Active Investment</span>
          <div>
            <span className="font-mono text-lg font-black text-emerald-400">{currentUser.activeInvestment.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-500 font-mono block mt-0.5">XAF locked</span>
          </div>
        </div>

        {/* profit earned */}
        <div className="bg-[#1c2112] border border-yellow-950/40 rounded-2xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2.5 text-amber-500/60">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-[9px] uppercase font-mono tracking-wider text-amber-400 block font-bold">Profit Earned</span>
          <div>
            <span className="font-mono text-lg font-black text-amber-400">+{currentUser.profitEarned.toLocaleString()}</span>
            <span className="text-[10px] text-amber-500 font-mono block mt-0.5">XAF realized</span>
          </div>
        </div>

        {/* withdrawal balance */}
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2.5 text-gray-700">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
          <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 block font-bold">Withdraw Balance</span>
          <div>
            <span className="font-mono text-lg font-black text-emerald-400">{currentUser.withdrawalBalance.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 font-mono block mt-0.5">XAF ready</span>
          </div>
        </div>

        {/* referral bonus */}
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 flex flex-col justify-between h-28 col-span-2 lg:col-span-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2.5 text-gray-700">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 block">Referral Commission</span>
          <div>
            <span className="font-mono text-lg font-black text-gray-300">{currentUser.referralBonus.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 font-mono block mt-0.5">XAF earned</span>
          </div>
        </div>

      </div>

      {/* SUB-TABS INTERFACE SELECTOR */}
      <div className="flex border-b border-gray-900 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none" id="dashboard-tab-bar">
        {[
          { id: 'overview', name: 'Overview' },
          { id: 'invest', name: 'Start Investment 📈' },
          { id: 'deposit', name: 'Deposit Funds 💸' },
          { id: 'withdraw', name: 'Withdraw Payout 🪙' },
          { id: 'referrals', name: 'Referral Link 👥' },
          { id: 'support', name: 'Helpdesk Tickets 💬' },
          { id: 'security', name: 'Account Security 🛡️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setError(null); setSuccess(null); }}
            className={`px-5 py-3 font-mono font-bold text-xs uppercase tracking-wider border-b-2 transition ${
              activeTab === tab.id ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* FEEDBACK alerts */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-4 text-xs font-medium mb-6 leading-normal flex items-start gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 text-xs font-medium mb-6 leading-normal flex items-start gap-2.5">
          <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* TAB OVERVIEW PANEL */}
      {activeTab === 'overview' && (
        <div className="space-y-6" id="dashboard-overview-panel">
          
          {/* Active investments with countdown */}
          <div>
            <h3 className="font-display font-bold text-md text-white mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" /> Active Yield Contracts
            </h3>

            {investments.filter(i => i.status === 'active').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investments.filter(i => i.status === 'active').map((inv) => {
                  const progressPct = Math.max(0, Math.min(100, ((inv.durationHours - inv.remainingHours) / inv.durationHours) * 100));
                  return (
                    <div key={inv.id} className="glass-panel-glow-gold border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase font-mono font-bold text-white">{inv.planName}</span>
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                          +{inv.returnRate}% accrual
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-y border-gray-900/60 py-3.5 my-3 text-center">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-gray-500 block mb-0.5">Capital Locked</span>
                          <span className="font-mono text-xs font-bold text-gray-100">{inv.amount.toLocaleString()} XAF</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono uppercase text-gray-500 block mb-0.5">Est. Profit</span>
                          <span className="font-mono text-xs font-bold text-emerald-400">+{inv.profit.toLocaleString()} XAF</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono uppercase text-gray-500 block mb-0.5">Est. Payout</span>
                          <span className="font-mono text-xs font-bold text-amber-400">{inv.totalReturn.toLocaleString()} XAF</span>
                        </div>
                      </div>

                      {/* Progress Bar and Remaining Hours */}
                      <div className="space-y-2 pt-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-gray-400">Contract release clock:</span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3 animate-spin" />
                            {getTimerString(inv.remainingHours)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-1000"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-8 text-center text-gray-500 text-xs">
                <AlertCircle className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                No active yield contracts right now. Go to the <button onClick={() => setActiveTab('invest')} className="text-amber-400 hover:underline font-bold">Start Investment</button> tab to lock your first yield.
              </div>
            )}
          </div>

          {/* Transactions History */}
          <div>
            <h3 className="font-display font-bold text-md text-white mb-4">Transaction Chronicles</h3>
            <div className="bg-gray-950/60 border border-gray-900 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-900 bg-gray-950/40 text-[10px] font-mono uppercase text-gray-500 tracking-wider">
                      <th className="p-4">Reference ID</th>
                      <th className="p-4">Transaction Type</th>
                      <th className="p-4">Amount (XAF)</th>
                      <th className="p-4">Transfer Channel</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4">Audited Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900/60">
                    {transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-950/30">
                          <td className="p-4 font-mono font-semibold text-gray-400 uppercase">{tx.id}</td>
                          <td className="p-4 uppercase font-semibold font-mono">
                            <span className={`inline-flex items-center gap-1.5 ${
                              tx.type === 'deposit' ? 'text-emerald-400' :
                              tx.type === 'withdrawal' ? 'text-rose-400' :
                              tx.type === 'payout' ? 'text-amber-400' : 'text-gray-300'
                            }`}>
                              {tx.type === 'deposit' && <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-400" />}
                              {tx.type === 'withdrawal' && <ArrowDownCircle className="h-3.5 w-3.5 text-rose-400" />}
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-gray-100">{tx.amount.toLocaleString()} XAF</td>
                          <td className="p-4 text-gray-400">{tx.method || 'Internal Payout'}</td>
                          <td className="p-4 text-gray-500 font-mono">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${
                              tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                              'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-600 font-mono">
                          No transactions audited. Complete a deposit or active investment to begin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB: START INVESTMENT */}
      {activeTab === 'invest' && (
        <div className="max-w-2xl mx-auto space-y-6" id="dashboard-invest-panel">
          <div className="text-center space-y-1 mb-2">
            <h3 className="font-display font-bold text-lg text-white">Activate New Yield Portfolio</h3>
            <p className="text-xs text-gray-400 leading-normal">
              Acquire a guaranteed daily return contracts secured on currency and blockchain liquidation hedging reserves.
            </p>
          </div>

          <form onSubmit={handleNewInvestment} className="glass-panel p-6 border border-gray-800 rounded-2xl space-y-5">
            {/* select plan */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">
                Selected Yield Plan
              </label>
              <div className="grid grid-cols-1 gap-3">
                {plans.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition flex items-center justify-between ${
                      selectedPlanId === p.id 
                        ? 'border-amber-400 bg-amber-500/5' 
                        : 'border-gray-900 bg-gray-950 hover:border-gray-800'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white uppercase font-display block">{p.name}</span>
                      <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
                        Allowed limit: {p.minAmount.toLocaleString()} XAF – {p.maxAmount.toLocaleString()} XAF
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-amber-400 block">+{p.returnRate}% Yield</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5 font-mono">24 Hours lock</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Capital */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">
                Investment Amount (XAF)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={investAmount === 0 ? '' : investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  placeholder="Enter amount (XAF)"
                  className="w-full bg-gray-950 border border-gray-800 text-white font-mono text-lg font-bold rounded-xl py-3 pl-4 pr-16 focus:outline-none focus:border-amber-400"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-gray-500 font-bold">
                  XAF
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-1.5">
                <span>Account Trading Balance: <strong className="text-white">{currentUser.totalBalance.toLocaleString()} XAF</strong></span>
                <span className="text-[9px] text-emerald-400 font-semibold">*Instant activation</span>
              </div>
            </div>

            {/* quick calculation summary */}
            {investAmount > 0 && selectedPlanId && (
              <div className="bg-gray-950/80 border border-gray-900 rounded-xl p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Capital Investment:</span>
                  <span className="text-white">{investAmount.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Accrued Return ({plans.find(p => p.id === selectedPlanId)?.returnRate}%):</span>
                  <span className="text-emerald-400">+{Math.round(investAmount * ((plans.find(p => p.id === selectedPlanId)?.returnRate || 20) / 100)).toLocaleString()} XAF</span>
                </div>
                <div className="border-t border-gray-900 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-amber-400">Total Return in 24 Hours:</span>
                  <span className="text-amber-400">{(investAmount + Math.round(investAmount * ((plans.find(p => p.id === selectedPlanId)?.returnRate || 20) / 100))).toLocaleString()} XAF</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition hover:scale-[1.01] shadow-lg shadow-amber-400/10"
            >
              {loading ? 'Activating Contract...' : 'Lock Capital & Start Yield'}
            </button>
          </form>
        </div>
      )}

      {/* TAB: DEPOSIT FUNDS */}
      {activeTab === 'deposit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-deposit-panel">
          
          {/* Instructions Left */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="font-display font-bold text-md text-white flex items-center gap-2 border-b border-gray-900 pb-3">
              1. Transfer Instructions
            </h3>

            {/* mtn */}
            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded font-mono font-bold text-[9px] uppercase">
                  MTN Mobile Money
                </span>
                {/* MTN MoMo Logo */}
                <svg viewBox="0 0 80 26" className="h-6 w-auto rounded border border-[#002D62]/10 shadow" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="80" height="26" rx="5" fill="#FFCC00" />
                  <ellipse cx="20" cy="13" rx="13" ry="9" fill="none" stroke="#002D62" strokeWidth="1.8" />
                  <text x="20" y="16" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill="#002D62" textAnchor="middle">MTN</text>
                  <text x="50" y="17" fontFamily="sans-serif" fontSize="9" fontWeight="900" fill="#002D62" textAnchor="middle">MoMo</text>
                </svg>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-gray-200">
                To pay via MoMo, dial merchant code on your handset:<br />
                <code className="text-yellow-400 font-black text-sm bg-gray-950 px-2 py-1 rounded block mt-1.5 text-center">
                  *126*1*1#
                </code>
                Enter Merchant Mobile: <strong className="text-white font-mono text-sm block mt-1">677 001 122</strong>
              </p>
            </div>

            {/* orange */}
            <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded font-mono font-bold text-[9px] uppercase">
                  Orange Money
                </span>
                {/* Orange Money Logo */}
                <svg viewBox="0 0 90 26" className="h-6 w-auto rounded border border-orange-500/10 shadow" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="22" height="22" x="2" y="2" rx="3" fill="#FF6600" />
                  <text x="13" y="15" fontFamily="sans-serif" fontSize="5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">orange</text>
                  <text x="56" y="17" fontFamily="sans-serif" fontSize="10" fontWeight="900" fill="#FF6600" letterSpacing="0.1">money</text>
                </svg>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-gray-200">
                To pay via Orange Money, dial merchant code:<br />
                <code className="text-orange-400 font-black text-sm bg-gray-950 px-2 py-1 rounded block mt-1.5 text-center">
                  #144*2*2#
                </code>
                Enter Merchant Code: <strong className="text-white font-mono text-sm block mt-1">998877</strong>
              </p>
            </div>

            {/* bank and crypto */}
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-4 text-xs space-y-2">
              <span className="text-gray-300 font-bold block">Cryptocurrency Instant Credit</span>
              <p className="text-gray-500 leading-normal text-[11px]">
                To credit automatically via blockchain networks, send currency to following wallets, then upload transaction TXID receipt:<br />
                • <strong>BTC:</strong> <code className="text-white font-mono bg-gray-900 px-1 rounded block select-all mt-1 truncate">bc1q78p8df90s8df7as8da78dgas6daasgsa</code>
                • <strong>USDT (TRC20):</strong> <code className="text-white font-mono bg-gray-900 px-1 rounded block select-all mt-1 truncate">TXH1p3ka8791hs8ga18ghas86gasas8gas</code>
              </p>
            </div>
          </div>

          {/* Form Right */}
          <div className="lg:col-span-7">
            <h3 className="font-display font-bold text-md text-white flex items-center gap-2 border-b border-gray-900 pb-3 mb-5">
              2. Upload Receipt & Notify Audit
            </h3>

            <form onSubmit={handleNewDeposit} className="glass-panel p-5 sm:p-6 border border-gray-800 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Deposit Method
                  </label>
                  <div className="relative">
                    <select
                      value={depositMethod}
                      onChange={(e) => setDepositMethod(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl pl-3.5 pr-12 py-2.5 focus:outline-none focus:border-amber-400"
                    >
                      <option value="MTN Mobile Money">MTN Mobile Money</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="Bank Transfer">Central Bank Transfer</option>
                      <option value="BTC (Bitcoin)">BTC (Bitcoin)</option>
                      <option value="USDT (TRC20)">USDT (TRC20)</option>
                    </select>
                    {/* Floating Logo Preview */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {depositMethod === 'MTN Mobile Money' && (
                        <svg viewBox="0 0 80 26" className="h-5 w-auto rounded" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="80" height="26" rx="4" fill="#FFCC00" />
                          <ellipse cx="20" cy="13" rx="12" ry="8" fill="none" stroke="#002D62" strokeWidth="1.5" />
                          <text x="20" y="16" fontFamily="sans-serif" fontSize="6.5" fontWeight="bold" fill="#002D62" textAnchor="middle">MTN</text>
                          <text x="50" y="17" fontFamily="sans-serif" fontSize="8" fontWeight="900" fill="#002D62" textAnchor="middle">MoMo</text>
                        </svg>
                      )}
                      {depositMethod === 'Orange Money' && (
                        <svg viewBox="0 0 90 26" className="h-5 w-auto rounded" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="20" height="20" x="3" y="3" rx="3" fill="#FF6600" />
                          <text x="13" y="15" fontFamily="sans-serif" fontSize="4.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">orange</text>
                          <text x="54" y="17" fontFamily="sans-serif" fontSize="9" fontWeight="900" fill="#FF6600" letterSpacing="0.1">money</text>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Deposit Amount (XAF)
                  </label>
                  <input
                    type="number"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g. 50,000 XAF"
                    className="w-full bg-gray-950 border border-gray-800 text-xs font-mono font-bold text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Your Account Number / Wallet Address
                  </label>
                  <input
                    type="text"
                    required
                    value={depositPhone}
                    onChange={(e) => setDepositPhone(e.target.value)}
                    placeholder="Handset number or TX hash"
                    className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Your Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={depositName}
                    onChange={(e) => setDepositName(e.target.value)}
                    placeholder="Sender account name"
                    className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Upload Proof */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Payment Proof (Screenshot Receipt)
                </label>
                <div className="border-2 border-dashed border-gray-800 hover:border-amber-500/40 rounded-xl p-4 transition bg-gray-950/40 text-center relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {receiptProof ? (
                    <div className="space-y-2">
                      <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <Check className="h-4 w-4" /> Screenshot Proof Loaded Successfully
                      </p>
                      <img src={receiptProof} alt="proof thumbnail" className="h-16 mx-auto rounded border border-gray-800" />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="h-6 w-6 text-gray-500 mx-auto" />
                      <p className="text-xs text-gray-300 font-medium">Click to upload transfer receipt image</p>
                      <p className="text-[10px] text-gray-500 font-mono">PNG, JPG acceptable</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition hover:scale-[1.01]"
              >
                {loading ? 'Submitting Receipt...' : 'Notify Audit Desk & Sub Deposit'}
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB: WITHDRAW PAYOUT */}
      {activeTab === 'withdraw' && (
        <div className="max-w-xl mx-auto space-y-6" id="dashboard-withdraw-panel">
          <div className="text-center space-y-1 mb-2">
            <h3 className="font-display font-bold text-lg text-white">Liquidate Accrued Balance</h3>
            <p className="text-xs text-gray-400 leading-normal">
              Process secure payouts directly into your Mobile Money handsets or local bank accounts instantly.
            </p>
          </div>

          <form onSubmit={handleNewWithdrawal} className="glass-panel p-6 border border-gray-800 rounded-2xl space-y-4">
            
            {/* Display withdraw balance */}
            <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-4 flex justify-between items-center text-xs">
              <span className="text-gray-400">Accrued Withdrawal Balance:</span>
              <span className="font-mono text-base font-black text-emerald-400">
                {currentUser.withdrawalBalance.toLocaleString()} XAF
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Payout Method
                </label>
                  <div className="relative">
                    <select
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl pl-3.5 pr-12 py-2.5 focus:outline-none"
                    >
                      <option value="MTN Mobile Money">MTN Mobile Money</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="Crypto BTC">BTC Wallet Address</option>
                      <option value="Crypto USDT TRC20">USDT Wallet Address</option>
                      <option value="Local Bank Transfer">Direct Bank Transfer</option>
                    </select>
                    {/* Floating Logo Preview */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {withdrawMethod === 'MTN Mobile Money' && (
                        <svg viewBox="0 0 80 26" className="h-5 w-auto rounded" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="80" height="26" rx="4" fill="#FFCC00" />
                          <ellipse cx="20" cy="13" rx="12" ry="8" fill="none" stroke="#002D62" strokeWidth="1.5" />
                          <text x="20" y="16" fontFamily="sans-serif" fontSize="6.5" fontWeight="bold" fill="#002D62" textAnchor="middle">MTN</text>
                          <text x="50" y="17" fontFamily="sans-serif" fontSize="8" fontWeight="900" fill="#002D62" textAnchor="middle">MoMo</text>
                        </svg>
                      )}
                      {withdrawMethod === 'Orange Money' && (
                        <svg viewBox="0 0 90 26" className="h-5 w-auto rounded" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="20" height="20" x="3" y="3" rx="3" fill="#FF6600" />
                          <text x="13" y="15" fontFamily="sans-serif" fontSize="4.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">orange</text>
                          <text x="54" y="17" fontFamily="sans-serif" fontSize="9" fontWeight="900" fill="#FF6600" letterSpacing="0.1">money</text>
                        </svg>
                      )}
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Withdrawal Amount (XAF)
                </label>
                <input
                  type="number"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Min. 500 XAF"
                  className="w-full bg-gray-950 border border-gray-800 text-xs font-mono font-bold text-white rounded-xl px-3.5 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Account / Phone / Wallet Number
                </label>
                <input
                  type="text"
                  required
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="6XX XX XX XX"
                  className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Account Owner Name
                </label>
                <input
                  type="text"
                  required
                  value={withdrawName}
                  onChange={(e) => setWithdrawName(e.target.value)}
                  placeholder="Receiver account name"
                  className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[10px] text-gray-500 font-mono leading-normal text-center">
              *Payout audits operate 24/7. Liquidated funds arrive in your specified payment gateway within 30 minutes of admin approval.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl"
            >
              {loading ? 'Processing Withdrawal...' : 'Request Balance Payout'}
            </button>
          </form>
        </div>
      )}

      {/* TAB: REFERRAL SYSTEM */}
      {activeTab === 'referrals' && (
        <div className="max-w-2xl mx-auto space-y-6" id="dashboard-referrals-panel">
          <div className="text-center space-y-1 mb-2">
            <h3 className="font-display font-bold text-lg text-white">Referral Affiliate Network</h3>
            <p className="text-xs text-gray-400 leading-normal">
              Acquire permanent passive commissions by sharing GLOBAL EXCHANGE AND TRADE INVESTMENTS with your colleagues.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-5">
            {/* copy link block */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">
                Your Exclusive Referral Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/register?ref=${currentUser.username}`}
                  className="flex-1 bg-gray-950 border border-gray-900 rounded-xl px-3.5 py-3 text-xs font-mono text-gray-300 focus:outline-none select-all"
                />
                <button
                  onClick={copyReferralLink}
                  className="p-3 bg-gray-900 hover:bg-gray-800 text-amber-400 hover:text-amber-300 border border-gray-800 rounded-xl transition"
                  title="Copy Link"
                >
                  {copied ? <Check className="h-4.5 w-4.5 text-emerald-400" /> : <Copy className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Commissions statistics display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-900 pt-5">
              <div className="text-center bg-gray-950/40 p-4 rounded-xl border border-gray-900">
                <span className="text-[10px] font-mono uppercase text-gray-500 block mb-1">Your Commission</span>
                <span className="text-xs font-mono font-bold text-emerald-400">1,000 XAF</span>
              </div>
              <div className="text-center bg-gray-950/40 p-4 rounded-xl border border-gray-900">
                <span className="text-[10px] font-mono uppercase text-gray-500 block mb-1">Welcome Gift</span>
                <span className="text-xs font-mono font-bold text-amber-400">2,000 XAF</span>
              </div>
              <div className="text-center bg-gray-950/40 p-4 rounded-xl border border-gray-900 col-span-2">
                <span className="text-[10px] font-mono uppercase text-gray-500 block mb-1">Referral Commission Earned</span>
                <span className="text-xs font-mono font-bold text-white">{currentUser.referralBonus.toLocaleString()} XAF</span>
              </div>
            </div>
          </div>

          {/* Referral logs */}
          <div>
            <h3 className="font-display font-bold text-md text-white mb-4">Your Referred Networks</h3>
            <div className="bg-gray-950/60 border border-gray-900 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-900 bg-gray-950/40 text-[9px] font-mono uppercase text-gray-500">
                    <th className="p-3.5">Referred Full Name</th>
                    <th className="p-3.5">Referred Email</th>
                    <th className="p-3.5">Commission Realized</th>
                    <th className="p-3.5">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60">
                  {referrals.length > 0 ? (
                    referrals.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-950/20">
                        <td className="p-3.5 text-gray-200 font-semibold">{r.refereeName}</td>
                        <td className="p-3.5 text-gray-400 font-mono">{r.refereeEmail}</td>
                        <td className="p-3.5 text-emerald-400 font-mono font-bold">+{r.commissionAmount.toLocaleString()} XAF</td>
                        <td className="p-3.5 text-gray-500 font-mono">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-600 font-mono">
                        No referrals recorded. Share your exclusive link to acquire commissions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB: SUPPORT HELPDESK TICKETS */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-support-panel">
          
          {/* Create ticket form */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display font-bold text-md text-white border-b border-gray-900 pb-3 mb-1">
              Submit Audit Assistance Ticket
            </h3>

            <form onSubmit={handleNewTicket} className="glass-panel p-5 border border-gray-800 rounded-2xl space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Deposit delayed via MoMo"
                  className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Description of Issue
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Please state details, transaction handset, transaction timestamp..."
                  className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition hover:scale-[1.01]"
              >
                Launch Ticket
              </button>
            </form>
          </div>

          {/* Ticket conversations list */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-display font-bold text-md text-white border-b border-gray-900 pb-3 mb-1">
              Ticket Inbox
            </h3>

            {selectedTicket ? (
              /* Ticket detail conversation screen */
              <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-4 sm:p-5 flex flex-col h-[400px] overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-900 pb-3 mb-4 shrink-0">
                  <div>
                    <h4 className="text-xs font-bold text-white max-w-[200px] truncate">{selectedTicket.subject}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">ID: {selectedTicket.id}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="text-[10px] font-mono px-2.5 py-1.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
                  >
                    ← Back to List
                  </button>
                </div>

                {/* replies list container */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 text-xs">
                  {/* First original question */}
                  <div className="p-3 bg-gray-900/60 border border-gray-900 rounded-xl space-y-1 leading-normal max-w-[90%]">
                    <span className="font-bold text-amber-400 font-mono text-[9px] uppercase">My Description:</span>
                    <p className="text-gray-200">{selectedTicket.message}</p>
                    <span className="text-[9px] font-mono text-gray-500 block">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  </div>

                  {selectedTicket.replies.map((rep) => (
                    <div 
                      key={rep.id}
                      className={`p-3 border rounded-xl space-y-1 leading-normal max-w-[90%] ${
                        rep.sender === 'user' 
                          ? 'bg-gray-900/60 border-gray-900 ml-auto' 
                          : rep.sender === 'admin' 
                            ? 'bg-emerald-950/10 border-emerald-900/30' 
                            : 'bg-amber-950/10 border-amber-900/20'
                      }`}
                    >
                      <span className={`font-bold font-mono text-[9px] uppercase ${
                        rep.sender === 'user' ? 'text-gray-400' : 'text-emerald-400'
                      }`}>
                        {rep.senderName}:
                      </span>
                      <p className="text-gray-200">{rep.message}</p>
                      <span className="text-[9px] font-mono text-gray-500 block">{new Date(rep.createdAt).toLocaleDateString()} {new Date(rep.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {selectedTicket.status === 'open' ? (
                  <form onSubmit={handleTicketReply} className="pt-4 border-t border-gray-900 flex gap-2 shrink-0">
                    <input
                      type="text"
                      required
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      placeholder="Type ticket message reply..."
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-amber-400 hover:bg-amber-300 text-black rounded-xl transition"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <div className="pt-3 border-t border-gray-900 text-center text-xs text-gray-500 shrink-0">
                    This support ticket is marked closed. Submit a new ticket for further concerns.
                  </div>
                )}
              </div>
            ) : (
              /* Ticket summary log tables */
              <div className="bg-gray-950/60 border border-gray-900 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-900 bg-gray-950/40 text-[9px] font-mono uppercase text-gray-500">
                      <th className="p-3.5">Topic Subject</th>
                      <th className="p-3.5">Audited status</th>
                      <th className="p-3.5">Replies count</th>
                      <th className="p-3.5">Last updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900/60">
                    {tickets.length > 0 ? (
                      tickets.map((t) => (
                        <tr 
                          key={t.id} 
                          onClick={() => setSelectedTicket(t)}
                          className="hover:bg-gray-950/30 cursor-pointer"
                        >
                          <td className="p-3.5 text-gray-200 font-semibold">{t.subject}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${
                              t.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse' : 'bg-gray-900 text-gray-500 border-gray-800'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-gray-400">{t.replies.length} replies</td>
                          <td className="p-3.5 text-gray-500 font-mono">{new Date(t.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-600 font-mono">
                          Your ticket log is empty. Sub a ticket to speak with our quantitative analysts.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB: SECURITY CONFIGURATION */}
      {activeTab === 'security' && (
        <div className="max-w-xl mx-auto space-y-6" id="dashboard-security-panel">
          <div className="text-center space-y-1 mb-2">
            <h3 className="font-display font-bold text-lg text-white">Security & Authentications</h3>
            <p className="text-xs text-gray-400 leading-normal">
              Acquire institutional session safety features, active fraud tracking telemetry configurations.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-gray-800 space-y-5">
            
            {/* 2FA Toggle */}
            <div className="flex items-center justify-between border-b border-gray-900 pb-4">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase">
                  Two-Factor Authentication (2FA) 
                  {currentUser.twoFactorEnabled ? (
                    <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[8px] font-bold border border-emerald-500/20 rounded">
                      ENABLED
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-gray-900 text-gray-500 text-[8px] font-bold border border-gray-800 rounded">
                      OFF
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[320px] leading-relaxed">
                  Require an OTP token dispatched via email or Google Authenticator to approve future payout requests.
                </p>
              </div>
              <div>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/auth/toggle-2fa', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: currentUser.id })
                    });
                    if (res.ok) {
                      onRefreshUser();
                      setSuccess('Two-factor status has been changed successfully!');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                    currentUser.twoFactorEnabled 
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
                      : 'bg-amber-400 text-black hover:bg-amber-300'
                  }`}
                >
                  {currentUser.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>

            {/* Google reCAPTCHA mock */}
            <div className="flex items-center justify-between border-b border-gray-900 pb-4">
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase">Google reCAPTCHA Integration</h4>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[320px] leading-relaxed">
                  Platform actively verifies robotic telemetry to prevent brute-force sign-in and automated deposit request spamming.
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] rounded font-bold">
                ACTIVE (V3)
              </span>
            </div>

            {/* Encrypted Passwords banner */}
            <div className="flex items-center gap-3.5 bg-gray-950/60 p-4 border border-gray-900 rounded-xl">
              <Lock className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="text-left text-xs leading-relaxed">
                <span className="font-bold text-gray-200 block font-mono text-[10px] uppercase">SHA-256 Military Cryptography</span>
                <p className="text-[10px] text-gray-500">
                  Your transaction passwords, Mobile Money pins, and payment proof payloads are fully encrypted at rest with industry standard SHA-256 blocks.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
