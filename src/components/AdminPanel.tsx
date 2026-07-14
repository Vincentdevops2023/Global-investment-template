import React, { useState, useEffect } from 'react';
import { User, Transaction, SupportTicket, InvestmentPlan, SystemStats } from '../types';
import { 
  ShieldAlert, Users, TrendingUp, Landmark, ShieldCheck, HelpCircle, 
  Check, X, Edit, Eye, MessageSquare, ArrowUpCircle, ArrowDownCircle, AlertCircle, RefreshCw 
} from 'lucide-react';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export default function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'deposits' | 'withdrawals' | 'users' | 'plans' | 'tickets'>('stats');
  
  // Admin stats & tables
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  
  // Selected ticket / modal state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [activeProofImg, setActiveProofImg] = useState<string | null>(null);
  
  // Plan edit form
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanMin, setEditPlanMin] = useState('');
  const [editPlanMax, setEditPlanMax] = useState('');
  const [editPlanRate, setEditPlanRate] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, txRes, ticketRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/tickets')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (txRes.ok) setTransactionsList(await txRes.json());
      if (ticketRes.ok) setTicketsList(await ticketRes.json());
    } catch (e) {
      console.error('Error loading administrative logs:', e);
    }
  };

  const handleApproveTransaction = async (txId: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setFeedback('Transaction approved successfully!');
        fetchAdminData();
      } else {
        setFeedback(data.error);
      }
    } catch (e) {
      setLoading(false);
      setFeedback('Error approving transaction.');
    }
  };

  const handleRejectTransaction = async (txId: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setFeedback('Transaction rejected successfully.');
        fetchAdminData();
      } else {
        setFeedback(data.error);
      }
    } catch (e) {
      setLoading(false);
      setFeedback('Error rejecting transaction.');
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setFeedback(`User account has been successfully ${newStatus}!`);
        fetchAdminData();
      }
    } catch (e) {
      console.error('Error changing user status:', e);
    }
  };

  const handleEditPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlanId) return;

    try {
      const res = await fetch('/api/admin/plans/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: editingPlanId,
          name: editPlanName,
          minAmount: editPlanMin,
          maxAmount: editPlanMax,
          returnRate: editPlanRate
        })
      });
      if (res.ok) {
        setFeedback('Investment plan updated successfully.');
        setEditingPlanId(null);
        fetchAdminData();
      }
    } catch (e) {
      console.error('Error updating plan:', e);
    }
  };

  const handleTicketReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedTicket) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'admin',
          senderName: 'Global Exchange Helpdesk Manager',
          message: adminReplyText
        })
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        setSelectedTicket(updatedTicket);
        setAdminReplyText('');
        fetchAdminData();
        setFeedback('Reply submitted successfully.');
      }
    } catch (e) {
      console.error('Error sending reply:', e);
    }
  };

  const startEditingPlan = (plan: InvestmentPlan) => {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanMin(plan.minAmount.toString());
    setEditPlanMax(plan.maxAmount.toString());
    setEditPlanRate(plan.returnRate.toString());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="admin-dashboard-container">
      
      {/* Header brand greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display font-black text-2xl text-rose-400 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-rose-400" />
            Administrative Portal
          </h2>
          <p className="text-xs text-gray-400">Control desk: <span className="font-bold text-rose-500 font-mono">AUTHORIZED ONLY (LEVEL 5)</span></p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="p-2.5 bg-gray-950/60 border border-gray-800 hover:border-rose-500/30 rounded-xl text-gray-400 hover:text-rose-400 transition"
          title="Refresh statistics"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="bg-[#1c1214] border border-rose-950/40 text-rose-400 rounded-xl p-4 text-xs font-semibold mb-6 flex items-start gap-2.5 leading-normal">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ADMIN STATE CARDS GRID */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8" id="admin-stats-grid">
          <div className="bg-gray-950/80 border border-gray-900 rounded-2xl p-4 relative overflow-hidden">
            <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500 block">Total Users</span>
            <span className="font-mono text-lg font-black text-white mt-1.5 block">{stats.totalUsers}</span>
          </div>
          <div className="bg-gray-950/80 border border-gray-900 rounded-2xl p-4 relative overflow-hidden">
            <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-500 block">Total Deposits (Appr)</span>
            <span className="font-mono text-lg font-black text-emerald-400 mt-1.5 block">{stats.totalDeposits.toLocaleString()} XAF</span>
          </div>
          <div className="bg-gray-950/80 border border-gray-900 rounded-2xl p-4 relative overflow-hidden">
            <span className="text-[9px] uppercase font-mono tracking-wider text-rose-500 block">Total Payouts (Appr)</span>
            <span className="font-mono text-lg font-black text-rose-400 mt-1.5 block">{stats.totalWithdrawals.toLocaleString()} XAF</span>
          </div>
          <div className="bg-gray-950/80 border border-gray-900 rounded-2xl p-4 relative overflow-hidden">
            <span className="text-[9px] uppercase font-mono tracking-wider text-amber-500 block">Active Capital Hedging</span>
            <span className="font-mono text-lg font-black text-amber-400 mt-1.5 block">{stats.totalActiveInvestments.toLocaleString()} XAF</span>
          </div>
          <div className="bg-rose-950/10 border border-rose-900/30 rounded-2xl p-4 relative overflow-hidden">
            <span className="text-[9px] uppercase font-mono tracking-wider text-rose-400 block">Pending Audits</span>
            <span className="font-mono text-lg font-black text-rose-400 mt-1.5 block">
              {stats.pendingDepositsCount} Dep / {stats.pendingWithdrawalsCount} Wd
            </span>
          </div>
        </div>
      )}

      {/* ADMINISTRATIVE SUB-TAB SELECTOR */}
      <div className="flex border-b border-gray-900 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none" id="admin-tabs">
        {[
          { id: 'stats', name: 'Dashboard Stats 📊' },
          { id: 'deposits', name: 'Approve Deposits 💸' },
          { id: 'withdrawals', name: 'Approve Withdrawals 🪙' },
          { id: 'users', name: 'Manage Users 👥' },
          { id: 'plans', name: 'Configure Plans 📈' },
          { id: 'tickets', name: 'Support Inbox 💬' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setFeedback(null); }}
            className={`px-5 py-3 font-mono font-bold text-xs uppercase tracking-wider border-b-2 transition ${
              activeTab === tab.id ? 'border-rose-400 text-rose-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* PROOF LIGHT-BOX COMPONENT */}
      {activeProofImg && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 relative">
            <div className="flex items-center justify-between border-b border-gray-900 pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-gray-300">Audited screenshot proof metadata:</span>
              <button 
                onClick={() => setActiveProofImg(null)}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img src={activeProofImg} alt="screenshot audit proof" className="w-full h-auto max-h-[70vh] object-contain rounded border border-gray-900" />
          </div>
        </div>
      )}

      {/* TAB: STATS & OVERVIEW */}
      {activeTab === 'stats' && (
        <div className="space-y-6" id="admin-stats-panel">
          <div className="bg-gray-950/40 p-6 rounded-2xl border border-gray-900/60 leading-relaxed text-xs">
            <h3 className="font-display font-bold text-sm text-white mb-2">Platform Hedging Administration Overview</h3>
            <p className="text-gray-400">
              Welcome to the administrative master control console. From here, you have real-time authority to audit mobile money receipts, approve token withdrawals, lock or release user statuses, custom-tune yield percentage targets, and dispatch replies to support tickets instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick analytics summary */}
            <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-900 pb-2">Pending Task Telemetry</h4>
              <ul className="space-y-3.5 text-xs font-mono">
                {stats && (
                  <>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Deposits awaiting screenshot audit:</span>
                      <span className="text-amber-400 font-bold">{stats.pendingDepositsCount} pending</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Withdrawal cashouts in queue:</span>
                      <span className="text-rose-400 font-bold">{stats.pendingWithdrawalsCount} pending</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Open client support desk tickets:</span>
                      <span className="text-emerald-400 font-bold">{stats.activeSupportTickets} open</span>
                    </li>
                    <li className="flex justify-between border-t border-gray-900 pt-3">
                      <span className="text-gray-400 font-sans font-bold">Audit Standard:</span>
                      <span className="text-emerald-400 font-bold">Fully Secure (SSL Verified)</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* active user statuses */}
            <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-900 pb-2">Platform Health Monitor</h4>
              <ul className="space-y-3.5 text-xs font-mono">
                <li className="flex justify-between">
                  <span className="text-gray-500">Express Dev API Gateway:</span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">AutoPayout Contract Ticker:</span>
                  <span className="text-emerald-400 font-bold">RUNNING (10s sync)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Gemini Chatbot Endpoint:</span>
                  <span className="text-emerald-400 font-bold">PRO CONTEXT</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB: APPROVE DEPOSITS */}
      {activeTab === 'deposits' && (
        <div className="space-y-4" id="admin-deposits-panel">
          <h3 className="font-display font-bold text-md text-white">Pending Deposits Audit Queue</h3>
          <div className="bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-900 bg-gray-950/40 text-[9px] font-mono uppercase text-gray-500">
                    <th className="p-3.5">Reference ID</th>
                    <th className="p-3.5">Investor Name</th>
                    <th className="p-3.5">Amount (XAF)</th>
                    <th className="p-3.5">Gateway Channel</th>
                    <th className="p-3.5">Receipt Proof</th>
                    <th className="p-3.5">Submitted date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60">
                  {transactionsList.filter(t => t.type === 'deposit' && t.status === 'pending').length > 0 ? (
                    transactionsList.filter(t => t.type === 'deposit' && t.status === 'pending').map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-950/20">
                        <td className="p-3.5 font-mono font-semibold text-gray-400 uppercase">{tx.id}</td>
                        <td className="p-3.5 text-gray-200">
                          <strong className="block">{tx.username}</strong>
                          <span className="text-[10px] text-gray-500 font-mono block">Sender: {tx.accountName} ({tx.accountNumber})</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">{tx.amount.toLocaleString()} XAF</td>
                        <td className="p-3.5 text-gray-400 font-mono text-[10px]">{tx.method}</td>
                        <td className="p-3.5">
                          {tx.paymentProof ? (
                            <button
                              onClick={() => setActiveProofImg(tx.paymentProof!)}
                              className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-amber-400 font-mono font-semibold transition flex items-center gap-1 hover:scale-105"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Receipt
                            </button>
                          ) : (
                            <span className="text-gray-600 font-mono italic">No Proof Loaded</span>
                          )}
                        </td>
                        <td className="p-3.5 text-gray-500 font-mono">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleApproveTransaction(tx.id)}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 hover:border-emerald-500 rounded-xl transition"
                            title="Approve & Credit Balance"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectTransaction(tx.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-black border border-rose-500/20 hover:border-rose-500 rounded-xl transition"
                            title="Reject Request"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-600 font-mono">
                        No pending deposits in queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: APPROVE WITHDRAWALS */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4" id="admin-withdrawals-panel">
          <h3 className="font-display font-bold text-md text-white">Pending Withdrawals Queue</h3>
          <div className="bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-900 bg-gray-950/40 text-[9px] font-mono uppercase text-gray-500">
                    <th className="p-3.5">Reference ID</th>
                    <th className="p-3.5">Investor Name</th>
                    <th className="p-3.5">Amount (XAF)</th>
                    <th className="p-3.5">Destination Gateway</th>
                    <th className="p-3.5">Receiver Particulars</th>
                    <th className="p-3.5">Requested date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60">
                  {transactionsList.filter(t => t.type === 'withdrawal' && t.status === 'pending').length > 0 ? (
                    transactionsList.filter(t => t.type === 'withdrawal' && t.status === 'pending').map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-950/20">
                        <td className="p-3.5 font-mono font-semibold text-gray-400 uppercase">{tx.id}</td>
                        <td className="p-3.5 text-gray-200">
                          <strong className="block">{tx.username}</strong>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-rose-400">{tx.amount.toLocaleString()} XAF</td>
                        <td className="p-3.5 text-gray-400 font-mono text-[10px]">{tx.method}</td>
                        <td className="p-3.5">
                          <strong className="block text-gray-200">{tx.accountName}</strong>
                          <span className="text-[10px] text-gray-500 font-mono block">{tx.accountNumber}</span>
                        </td>
                        <td className="p-3.5 text-gray-500 font-mono">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleApproveTransaction(tx.id)}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 hover:border-emerald-500 rounded-xl transition"
                            title="Approve Cashout"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectTransaction(tx.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-black border border-rose-500/20 hover:border-rose-500 rounded-xl transition"
                            title="Reject & Re-credit Balance"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-600 font-mono">
                        No pending withdrawals in queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4" id="admin-users-panel">
          <h3 className="font-display font-bold text-md text-white">Registered Platforms Investor Directory</h3>
          <div className="bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-900 bg-gray-950/40 text-[9px] font-mono uppercase text-gray-500">
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Contacts Info</th>
                    <th className="p-3.5">Country</th>
                    <th className="p-3.5">Balance (XAF)</th>
                    <th className="p-3.5">Active locked</th>
                    <th className="p-3.5">Earnings</th>
                    <th className="p-3.5 font-mono">2FA</th>
                    <th className="p-3.5">System access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60">
                  {usersList.length > 0 ? (
                    usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-950/20">
                        <td className="p-3.5">
                          <strong className="block text-gray-100">{user.fullName}</strong>
                          <span className="text-[10px] text-gray-500 font-mono block">@{user.username} {user.username === 'admin' && '🔑'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="block text-gray-300 font-mono text-[11px]">{user.email}</span>
                          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{user.phone}</span>
                        </td>
                        <td className="p-3.5 text-gray-400 font-semibold">{user.country}</td>
                        <td className="p-3.5 font-mono font-bold text-gray-100">{user.withdrawalBalance.toLocaleString()}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">{user.activeInvestment.toLocaleString()}</td>
                        <td className="p-3.5 font-mono font-bold text-amber-400">{user.profitEarned.toLocaleString()}</td>
                        <td className="p-3.5 font-mono text-[10px]">{user.twoFactorEnabled ? '🟢 ON' : '⚫ OFF'}</td>
                        <td className="p-3.5">
                          {user.username === 'admin' ? (
                            <span className="text-[10px] text-gray-500 italic font-mono">Protected Root</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleUserStatusChange(user.id, 'suspended')}
                                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-rose-500 hover:text-black border border-emerald-500/20 hover:border-rose-500 text-emerald-400 rounded-lg text-[10px] font-mono font-bold uppercase transition hover:scale-105"
                                >
                                  Active
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserStatusChange(user.id, 'active')}
                                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-emerald-500 hover:text-black border border-rose-500/20 hover:border-emerald-500 text-rose-400 rounded-lg text-[10px] font-mono font-bold uppercase transition hover:scale-105"
                                >
                                  Suspended
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-gray-600 font-mono">
                        Directory empty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EDIT INVESTMENT PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6" id="admin-plans-panel">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <h3 className="font-display font-bold text-md text-white">Investment Plans Configuration</h3>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
              Audited Rates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats?.plans?.map((plan: InvestmentPlan) => (
              <div key={plan.id} className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-white font-mono">{plan.name}</span>
                  <span className="font-mono text-xs text-rose-400 font-black">{plan.returnRate}% return</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1 font-mono">
                  <p>Allowed Min: {plan.minAmount.toLocaleString()} XAF</p>
                  <p>Allowed Max: {plan.maxAmount.toLocaleString()} XAF</p>
                  <p>Hold Duration: {plan.durationHours} Hours</p>
                </div>
                <button
                  onClick={() => startEditingPlan(plan)}
                  className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900 text-rose-400 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Parameters
                </button>
              </div>
            ))}
          </div>

          {/* Edit Plan Inline form modal */}
          {editingPlanId && (
            <form onSubmit={handleEditPlanSubmit} className="glass-panel p-5 sm:p-6 border border-gray-800 rounded-2xl max-w-lg space-y-4 animate-in fade-in duration-200">
              <h4 className="font-display font-bold text-sm text-white">Adjust Plan Criteria: {editingPlanId.toUpperCase()}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Plan Display Name</label>
                  <input
                    type="text"
                    required
                    value={editPlanName}
                    onChange={(e) => setEditPlanName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Guaranteed Yield (%)</label>
                  <input
                    type="number"
                    required
                    value={editPlanRate}
                    onChange={(e) => setEditPlanRate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-lg px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Minimum Capital (XAF)</label>
                  <input
                    type="number"
                    required
                    value={editPlanMin}
                    onChange={(e) => setEditPlanMin(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Maximum Capital (XAF)</label>
                  <input
                    type="number"
                    required
                    value={editPlanMax}
                    onChange={(e) => setEditPlanMax(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-500 text-black font-mono font-bold text-xs uppercase rounded-xl hover:bg-rose-400 transition"
                >
                  Save Adjustments
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlanId(null)}
                  className="flex-1 py-2 bg-gray-900 border border-gray-800 text-gray-400 font-mono font-bold text-xs uppercase rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* TAB: SUPPORT TICKETS LISTS */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-tickets-panel">
          
          {/* Ticket lists left */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display font-bold text-md text-white border-b border-gray-900 pb-3 mb-1">Support Tickets Inbox</h3>
            <div className="bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-900 bg-gray-950/40 text-[9px] font-mono uppercase text-gray-500">
                    <th className="p-3">Sender</th>
                    <th className="p-3">Topic Subject</th>
                    <th className="p-3">Audits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60">
                  {ticketsList.length > 0 ? (
                    ticketsList.map((tick) => (
                      <tr 
                        key={tick.id}
                        onClick={() => setSelectedTicket(tick)}
                        className={`hover:bg-gray-950/30 cursor-pointer ${
                          selectedTicket && selectedTicket.id === tick.id ? 'bg-rose-950/10' : ''
                        }`}
                      >
                        <td className="p-3">
                          <strong className="block text-gray-300">{tick.username}</strong>
                          <span className="text-[10px] text-gray-500 font-mono block">ID: {tick.id}</span>
                        </td>
                        <td className="p-3 text-gray-200 font-medium truncate max-w-[120px]">{tick.subject}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${
                            tick.status === 'open' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-gray-900 text-gray-500 border-gray-800'
                          }`}>
                            {tick.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-gray-600 font-mono">
                        Support tickets queue is clear.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conversation Right */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-5 flex flex-col h-[400px] overflow-hidden text-xs">
                
                {/* conversation header */}
                <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-4 shrink-0">
                  <div>
                    <h4 className="text-xs font-bold text-white">Client Issue: {selectedTicket.subject}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">From: @{selectedTicket.username} | Ticket ID: {selectedTicket.id}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${
                    selectedTicket.status === 'open' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' : 'bg-gray-900 text-gray-500'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>

                {/* conversation contents */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 mb-4">
                  
                  {/* Original Question */}
                  <div className="p-3 bg-gray-900/60 border border-gray-900 rounded-xl space-y-1 max-w-[90%]">
                    <span className="font-bold text-rose-400 font-mono text-[9px] uppercase">Client Original Issue:</span>
                    <p className="text-gray-200 leading-normal">{selectedTicket.message}</p>
                    <span className="text-[9px] font-mono text-gray-500 block">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  </div>

                  {selectedTicket.replies.map((rep) => (
                    <div 
                      key={rep.id}
                      className={`p-3 border rounded-xl space-y-1 max-w-[90%] ${
                        rep.sender === 'admin' 
                          ? 'bg-rose-950/10 border-rose-900/30 ml-auto' 
                          : 'bg-gray-900/60 border-gray-900'
                      }`}
                    >
                      <span className={`font-bold font-mono text-[9px] uppercase ${
                        rep.sender === 'admin' ? 'text-rose-400' : 'text-gray-400'
                      }`}>
                        {rep.senderName}:
                      </span>
                      <p className="text-gray-200 leading-normal">{rep.message}</p>
                      <span className="text-[9px] font-mono text-gray-500 block">{new Date(rep.createdAt).toLocaleDateString()} {new Date(rep.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleTicketReplySubmit} className="pt-3 border-t border-gray-900 flex gap-2 shrink-0">
                  <input
                    type="text"
                    required
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Type official assistance reply..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-rose-500 text-black font-mono font-bold text-xs uppercase rounded-xl transition hover:scale-105"
                  >
                    Reply
                  </button>
                </form>

              </div>
            ) : (
              <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-16 text-center text-gray-600 text-xs">
                <MessageSquare className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                Select a support ticket from the list to reply.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
