export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  totalBalance: number;
  activeInvestment: number;
  profitEarned: number;
  referralBonus: number;
  withdrawalBalance: number;
  status: 'active' | 'suspended';
  twoFactorEnabled: boolean;
  registrationDate: string;
  isEmailVerified: boolean;
  verificationCode?: string;
  preferredPlan?: string;
}

export interface Investment {
  id: string;
  userId: string;
  username: string;
  planId: string;
  planName: string;
  amount: number;
  returnRate: number; // e.g. 20 for 20%
  profit: number; // calculated profit
  totalReturn: number; // amount + profit
  durationHours: number;
  remainingHours: number;
  status: 'active' | 'completed';
  createdAt: string;
  expiresAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'payout' | 'referral';
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  accountNumber?: string;
  accountName?: string;
  paymentProof?: string; // base64 string
  notes?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  refereeEmail: string;
  commissionAmount: number;
  createdAt: string;
  status: 'pending' | 'paid';
}

export interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
  replies: TicketReply[];
}

export interface TicketReply {
  id: string;
  sender: 'user' | 'admin' | 'system';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number; // or Infinity
  returnRate: number; // e.g. 20 for 20%
  durationHours: number;
  color: string;
  badgeColor: string;
}

export interface SystemStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalActiveInvestments: number;
  totalUsers: number;
  totalReferrals: number;
}
