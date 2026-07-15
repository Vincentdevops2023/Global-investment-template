import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  User, 
  Investment, 
  Transaction, 
  Referral, 
  SupportTicket, 
  InvestmentPlan,
  SystemStats 
} from './src/types.js';

// Initialize Gemini API SDK
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini API initialized successfully.');
  } catch (err) {
    console.error('Error initializing Gemini API:', err);
  }
} else {
  console.log('Gemini API Key missing or default. AI Chatbot will run in premium simulation mode.');
}

const DB_FILE = path.join(process.cwd(), 'server_db.json');

// Default Investment Plans
const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'plan_a',
    name: 'PLAN A (Green Invest)',
    minAmount: 1000,
    maxAmount: 50000,
    returnRate: 20,
    durationHours: 24,
    color: 'border-emerald-500/30 bg-emerald-950/20 shadow-emerald-500/5',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    id: 'plan_b',
    name: 'PLAN B (Gold Invest)',
    minAmount: 51000,
    maxAmount: 200000,
    returnRate: 25,
    durationHours: 24,
    color: 'border-amber-500/30 bg-amber-950/10 shadow-amber-500/5',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  {
    id: 'plan_c',
    name: 'PLAN C (VVIP Gold Invest)',
    minAmount: 210000,
    maxAmount: 10000000, // 10M XAF Limit
    returnRate: 30,
    durationHours: 24,
    color: 'border-yellow-400 bg-gradient-to-b from-gray-950 via-gray-900 to-black shadow-yellow-400/10',
    badgeColor: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold'
  }
];

// Helper to write/read database
interface DatabaseState {
  users: User[];
  investments: Investment[];
  transactions: Transaction[];
  referrals: Referral[];
  tickets: SupportTicket[];
  plans: InvestmentPlan[];
}

function initDB(): DatabaseState {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      // Ensure defaults exist
      if (!data.plans || data.plans.length === 0) data.plans = DEFAULT_PLANS;
      return data;
    } catch (e) {
      console.error('Error reading server_db.json, recreating:', e);
    }
  }

  // Create initial database state with robust pre-seeded records
  const initialData: DatabaseState = {
    users: [
      {
        id: 'user_admin',
        fullName: 'Global Exchange Admin',
        username: 'admin',
        email: 'admin@globalexchange.com',
        phone: '+237 670 123 456',
        country: 'Cameroon',
        totalBalance: 5000000,
        activeInvestment: 0,
        profitEarned: 1500000,
        referralBonus: 250000,
        withdrawalBalance: 2500000,
        status: 'active',
        twoFactorEnabled: false,
        registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        isEmailVerified: true
      },
      {
        id: 'user_demo',
        fullName: 'Nchout Poumie',
        username: 'npoumie',
        email: 'user@demo.com',
        phone: '+237 699 987 654',
        country: 'Cameroon',
        totalBalance: 125000,
        activeInvestment: 50000,
        profitEarned: 25000,
        referralBonus: 5000,
        withdrawalBalance: 75000,
        status: 'active',
        twoFactorEnabled: false,
        registrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isEmailVerified: true
      }
    ],
    investments: [
      {
        id: 'inv_1',
        userId: 'user_demo',
        username: 'npoumie',
        planId: 'plan_a',
        planName: 'PLAN A (Green Invest)',
        amount: 50000,
        returnRate: 20,
        profit: 10000,
        totalReturn: 60000,
        durationHours: 24,
        remainingHours: 14.5,
        status: 'active',
        createdAt: new Date(Date.now() - 9.5 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 14.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'inv_completed',
        userId: 'user_demo',
        username: 'npoumie',
        planId: 'plan_b',
        planName: 'PLAN B (Gold Invest)',
        amount: 100000,
        returnRate: 25,
        profit: 25000,
        totalReturn: 125000,
        durationHours: 24,
        remainingHours: 0,
        status: 'completed',
        createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ],
    transactions: [
      {
        id: 'tx_1',
        userId: 'user_demo',
        username: 'npoumie',
        type: 'deposit',
        amount: 150000,
        method: 'MTN Mobile Money',
        status: 'approved',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        accountNumber: '677112233',
        accountName: 'Nchout Poumie',
        notes: 'Deposit approved'
      },
      {
        id: 'tx_2',
        userId: 'user_demo',
        username: 'npoumie',
        type: 'investment',
        amount: 100000,
        method: 'Account Balance',
        status: 'approved',
        createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx_3',
        userId: 'user_demo',
        username: 'npoumie',
        type: 'payout',
        amount: 125000,
        method: 'Account Balance',
        status: 'approved',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx_4',
        userId: 'user_demo',
        username: 'npoumie',
        type: 'investment',
        amount: 50000,
        method: 'Account Balance',
        status: 'approved',
        createdAt: new Date(Date.now() - 9.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx_pending_dep',
        userId: 'user_demo',
        username: 'npoumie',
        type: 'deposit',
        amount: 75000,
        method: 'Orange Money',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        accountNumber: '699008877',
        accountName: 'Nchout Poumie'
      }
    ],
    referrals: [
      {
        id: 'ref_1',
        referrerId: 'user_demo',
        refereeId: 'referee_xxx',
        refereeName: 'Amadou Diallo',
        refereeEmail: 'amadou@gmail.com',
        commissionAmount: 5000,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'paid'
      }
    ],
    tickets: [
      {
        id: 'ticket_1',
        userId: 'user_demo',
        username: 'npoumie',
        subject: 'Mobile Money deposit delay',
        message: 'Hello, I made a deposit of 75,000 XAF via Orange Money 2 hours ago. It is still pending approval. Please assist.',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: [
          {
            id: 'rep_1',
            sender: 'system',
            senderName: 'System',
            message: 'Your ticket has been opened. Admin will respond shortly.',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    ],
    plans: DEFAULT_PLANS
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  return initialData;
}

let db = initDB();

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Tick processing routine - processes active investments countdowns and pays out completed ones
function processActiveInvestments() {
  const now = new Date();
  let changed = false;

  db.investments.forEach(inv => {
    if (inv.status === 'active') {
      const expiry = new Date(inv.expiresAt);
      const diffMs = expiry.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        // Investment completed! Pay out
        inv.status = 'completed';
        inv.remainingHours = 0;
        
        // Find user
        const user = db.users.find(u => u.id === inv.userId);
        if (user) {
          // Add return to withdrawal balance and update stats
          user.withdrawalBalance += inv.totalReturn;
          user.activeInvestment = Math.max(0, user.activeInvestment - inv.amount);
          user.profitEarned += inv.profit;
          
          // Generate transaction record
          const payoutTx: Transaction = {
            id: 'tx_pay_' + Math.random().toString(36).substr(2, 9),
            userId: user.id,
            username: user.username,
            type: 'payout',
            amount: inv.totalReturn,
            method: 'Account Balance',
            status: 'approved',
            createdAt: now.toISOString(),
            notes: `Guaranteed payout from ${inv.planName}`
          };
          db.transactions.push(payoutTx);
          changed = true;
          console.log(`[AutoPayout] Completed investment ${inv.id} for user ${user.username}. Paid out ${inv.totalReturn} XAF.`);
        }
      } else {
        const remainingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        if (inv.remainingHours !== remainingHours) {
          inv.remainingHours = remainingHours;
          changed = true;
        }
      }
    }
  });

  if (changed) {
    saveDB();
  }
}

// Run ticker updater immediately and every 10 seconds
processActiveInvestments();
setInterval(processActiveInvestments, 10000);

// Helper to parse cookies from headers
function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.match(/(.*?)=(.*)$/);
    if (parts) {
      cookies[parts[1].trim()] = (parts[2] || '').trim();
    }
  });
  return cookies;
}

// Set up server
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================
  
  app.post('/api/auth/register', (req, res) => {
    const { fullName, username, email, phone, country, password, referrer, preferredPlan } = req.body;
    
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailLower = email.toLowerCase();
    if (db.users.find(u => (u.email && u.email.toLowerCase() === emailLower) || (u.username && u.username.toLowerCase() === username.toLowerCase()))) {
      return res.status(400).json({ error: 'Email or Username already exists' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const newUser: User & { password?: string } = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      fullName,
      username,
      email: emailLower,
      phone: phone || '',
      country: country || 'Cameroon',
      totalBalance: 0,
      activeInvestment: 0,
      profitEarned: 0,
      referralBonus: referrer ? 2000 : 0, // 2000 XAF reward if referred
      withdrawalBalance: referrer ? 2000 : 0,
      status: 'active',
      twoFactorEnabled: false,
      registrationDate: new Date().toISOString(),
      isEmailVerified: false,
      verificationCode,
      password: password,
      preferredPlan: preferredPlan || 'plan_a'
    };

    db.users.push(newUser);

    // If referred, register referral record
    if (referrer) {
      const referrerUser = db.users.find(u => u.username && u.username.toLowerCase() === referrer.toLowerCase());
      if (referrerUser) {
        referrerUser.referralBonus += 1000; // Referrer gets 1000 XAF commission right away
        referrerUser.withdrawalBalance += 1000;
        
        const newRef: Referral = {
          id: 'ref_' + Math.random().toString(36).substr(2, 9),
          referrerId: referrerUser.id,
          refereeId: newUser.id,
          refereeName: newUser.fullName,
          refereeEmail: newUser.email,
          commissionAmount: 1000,
          createdAt: new Date().toISOString(),
          status: 'paid'
        };
        db.referrals.push(newRef);
      }
    }

    saveDB();

    res.json({
      message: 'Registration successful! Verification code sent to email.',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        country: newUser.country,
        isEmailVerified: false,
        verificationCode // sent back for convenience in preview
      }
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    const user = db.users.find(u => 
      (u.email && u.email.toLowerCase() === email.toLowerCase()) ||
      (u.username && u.username.toLowerCase() === email.toLowerCase())
    );
    
    if (!user) {
      return res.status(401).json({ error: 'User does not exist with this email or username' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact customer support.' });
    }

    // Mock simple password validation - for preview, allow custom pass unless it is demo accounts
    if (user.id === 'user_admin' && password !== 'admin123') {
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    if (user.id === 'user_demo' && password !== 'demo') {
      return res.status(401).json({ error: 'Invalid investor credentials' });
    }

    if ((user as any).password && (user as any).password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.setHeader('Set-Cookie', `session_user_id=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

    res.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        country: user.country,
        totalBalance: user.totalBalance,
        activeInvestment: user.activeInvestment,
        profitEarned: user.profitEarned,
        referralBonus: user.referralBonus,
        withdrawalBalance: user.withdrawalBalance,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
        isEmailVerified: user.isEmailVerified,
        verificationCode: (user as any).verificationCode,
        isAdmin: user.username === 'admin' || user.email === 'admin@globalexchange.com' || user.email === 'admin@caminvest.com'
      }
    });
  });

  app.get('/api/auth/current', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const userId = cookies['session_user_id'];
    if (!userId) {
      return res.status(401).json({ error: 'No active session' });
    }
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: 'Session user not found' });
    }
    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        country: user.country,
        totalBalance: user.totalBalance,
        activeInvestment: user.activeInvestment,
        profitEarned: user.profitEarned,
        referralBonus: user.referralBonus,
        withdrawalBalance: user.withdrawalBalance,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
        isEmailVerified: user.isEmailVerified,
        verificationCode: (user as any).verificationCode,
        isAdmin: user.username === 'admin' || user.email === 'admin@globalexchange.com' || user.email === 'admin@caminvest.com'
      }
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'session_user_id=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.json({ message: 'Logged out successfully' });
  });

  app.post('/api/auth/verify-email', (req, res) => {
    const { userId, code } = req.body;
    const user = db.users.find(u => u.id === userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.verificationCode === code || code === '123456') {
      user.isEmailVerified = true;
      user.verificationCode = undefined;
      saveDB();
      return res.json({ success: true, message: 'Email verified successfully!' });
    }
    
    res.status(400).json({ error: 'Invalid verification code' });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const user = db.users.find(u => u.email && u.email.toLowerCase() === (email || '').toLowerCase());
    
    if (!user) {
      return res.status(404).json({ error: 'No user found with this email' });
    }
    
    res.json({ message: `Reset link successfully generated for ${user.email}. Enter your new password.` });
  });

  app.post('/api/auth/toggle-2fa', (req, res) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.twoFactorEnabled = !user.twoFactorEnabled;
    saveDB();
    res.json({ success: true, twoFactorEnabled: user.twoFactorEnabled });
  });


  // ==========================================
  // USER PORTFOLIO / DETAILS ROUTES
  // ==========================================
  
  app.get('/api/user/profile/:userId', (req, res) => {
    // Process payouts first to return fresh balance
    processActiveInvestments();
    
    const user = db.users.find(u => u.id === req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      country: user.country,
      totalBalance: user.totalBalance,
      activeInvestment: user.activeInvestment,
      profitEarned: user.profitEarned,
      referralBonus: user.referralBonus,
      withdrawalBalance: user.withdrawalBalance,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.username === 'admin'
    });
  });

  app.get('/api/user/transactions/:userId', (req, res) => {
    const txs = db.transactions.filter(t => t.userId === req.params.userId);
    res.json(txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.get('/api/user/investments/:userId', (req, res) => {
    const invs = db.investments.filter(i => i.userId === req.params.userId);
    res.json(invs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.get('/api/user/referrals/:userId', (req, res) => {
    const refs = db.referrals.filter(r => r.referrerId === req.params.userId);
    res.json(refs);
  });


  // ==========================================
  // DEPOSIT / WITHDRAWAL / INVESTMENT
  // ==========================================

  app.post('/api/deposit', (req, res) => {
    const { userId, amount, method, accountNumber, accountName, paymentProof } = req.body;
    
    if (!userId || !amount || !method) {
      return res.status(400).json({ error: 'Missing deposit details' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newTx: Transaction = {
      id: 'tx_dep_' + Math.random().toString(36).substr(2, 9),
      userId,
      username: user.username,
      type: 'deposit',
      amount: Number(amount),
      method,
      status: 'pending',
      createdAt: new Date().toISOString(),
      accountNumber,
      accountName,
      paymentProof
    };

    db.transactions.push(newTx);
    saveDB();

    res.json({
      message: 'Deposit request submitted! Proof of payment uploaded. Admin approval is pending.',
      transaction: newTx
    });
  });

  app.post('/api/withdraw', (req, res) => {
    const { userId, amount, method, accountNumber, accountName } = req.body;
    
    if (!userId || !amount || !method || !accountNumber) {
      return res.status(400).json({ error: 'Missing withdrawal details' });
    }

    const amt = Number(amount);
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.withdrawalBalance < amt) {
      return res.status(400).json({ error: 'Insufficient withdrawal balance' });
    }

    // Deduct withdrawal balance right away and put in pending
    user.withdrawalBalance -= amt;

    const newTx: Transaction = {
      id: 'tx_wd_' + Math.random().toString(36).substr(2, 9),
      userId,
      username: user.username,
      type: 'withdrawal',
      amount: amt,
      method,
      status: 'pending',
      createdAt: new Date().toISOString(),
      accountNumber,
      accountName
    };

    db.transactions.push(newTx);
    saveDB();

    res.json({
      message: 'Withdrawal request submitted successfully! Funds have been locked until approval.',
      transaction: newTx
    });
  });

  app.post('/api/invest', (req, res) => {
    const { userId, planId, amount } = req.body;
    
    if (!userId || !planId || !amount) {
      return res.status(400).json({ error: 'Missing investment details' });
    }

    const amt = Number(amount);
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.totalBalance < amt) {
      return res.status(400).json({ error: 'Insufficient account balance. Please make a deposit first.' });
    }

    const plan = db.plans.find(p => p.id === planId);
    if (!plan) return res.status(404).json({ error: 'Selected plan not found' });

    if (amt < plan.minAmount || amt > plan.maxAmount) {
      return res.status(400).json({ error: `Amount must be between ${plan.minAmount} XAF and ${plan.maxAmount} XAF for this plan` });
    }

    // Calculate profit
    const profit = Math.round(amt * (plan.returnRate / 100));
    const totalReturn = amt + profit;

    // Deduct from balance and increase active investment
    user.totalBalance -= amt;
    user.activeInvestment += amt;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.durationHours * 60 * 60 * 1000);

    const newInv: Investment = {
      id: 'inv_' + Math.random().toString(36).substr(2, 9),
      userId,
      username: user.username,
      planId,
      planName: plan.name,
      amount: amt,
      returnRate: plan.returnRate,
      profit,
      totalReturn,
      durationHours: plan.durationHours,
      remainingHours: plan.durationHours,
      status: 'active',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    db.investments.push(newInv);

    // Create record in transaction
    const newTx: Transaction = {
      id: 'tx_inv_lock_' + Math.random().toString(36).substr(2, 9),
      userId,
      username: user.username,
      type: 'investment',
      amount: amt,
      method: 'Account Balance',
      status: 'approved',
      createdAt: now.toISOString(),
      notes: `Invested in ${plan.name}`
    };
    db.transactions.push(newTx);

    saveDB();

    res.json({
      message: `Successfully invested ${amt} XAF in ${plan.name}! Your returns will be paid in ${plan.durationHours} hours.`,
      investment: newInv
    });
  });


  // ==========================================
  // SUPPORT TICKETS
  // ==========================================
  
  app.get('/api/tickets/:userId', (req, res) => {
    const userTickets = db.tickets.filter(t => t.userId === req.params.userId);
    res.json(userTickets);
  });

  app.post('/api/tickets', (req, res) => {
    const { userId, subject, message } = req.body;
    
    if (!userId || !subject || !message) {
      return res.status(400).json({ error: 'Missing support ticket details' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newTicket: SupportTicket = {
      id: 'ticket_' + Math.random().toString(36).substr(2, 9),
      userId,
      username: user.username,
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString(),
      replies: [
        {
          id: 'rep_sys_' + Math.random().toString(36).substr(2, 9),
          sender: 'system',
          senderName: 'Global Exchange Helpdesk',
          message: 'Thank you for contacting customer support. Our admin panel has received your ticket, and a support officer will reply to your account within 10-15 minutes.',
          createdAt: new Date().toISOString()
        }
      ]
    };

    db.tickets.push(newTicket);
    saveDB();

    res.json({
      message: 'Support ticket submitted successfully!',
      ticket: newTicket
    });
  });

  app.post('/api/tickets/:ticketId/reply', (req, res) => {
    const { sender, senderName, message } = req.body;
    const ticket = db.tickets.find(t => t.id === req.params.ticketId);
    
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (!message) return res.status(400).json({ error: 'Reply message cannot be empty' });

    ticket.replies.push({
      id: 'rep_' + Math.random().toString(36).substr(2, 9),
      sender,
      senderName,
      message,
      createdAt: new Date().toISOString()
    });

    if (sender === 'admin') {
      ticket.status = 'open'; // reopen or keep open
    }

    saveDB();
    res.json(ticket);
  });


  // ==========================================
  // GEMINI AI CHATBOT WITH CONTEXT
  // ==========================================
  
  app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const systemInstruction = `You are "GlobalBot", the premier 24/7 AI financial guide and support assistant for GLOBAL EXCHANGE AND TRADE INVESTMENTS.
GLOBAL EXCHANGE AND TRADE INVESTMENTS is a highly secured, premium investment platform operating in Cameroon and supporting global payment gateways.

Here is the essential company handbook, FAQ, and platform details to ground all your replies. You must answer questions instantly, with absolute accuracy and premium financial professionalism.

--- PLATFORM REVENUE AND INVESTMENTS PLAN ---
1. Plan A (Green Starter): Invest 1,000 XAF to 50,000 XAF, earn 20% guaranteed profit in exactly 24 Hours.
2. Plan B (Gold Medium): Invest 51,000 XAF to 200,000 XAF, earn 25% guaranteed profit in exactly 24 Hours.
3. Plan C (VVIP Luxury Black & Gold): Invest 210,000 XAF and above, earn 30% guaranteed profit in exactly 24 Hours.

--- DEPOSIT METHODS & HOW TO DEPOSIT ---
- Mobile Money (MTN MoMo, Orange Money) and Bank Transfers are approved immediately.
- We also accept Cryptocurrency (BTC, USDT, ETH) which provides instant cloud auto-credit.
- Instructions: Go to the Deposit Page, select your method, send the funds to the provided merchant number/wallet address, and upload your payment receipt/screenshot proof. Deposits are verified and approved by administrators within 10-15 minutes.

--- WITHDRAWAL SYSTEM ---
- Go to the Withdrawal Page, enter your desired cash-out amount, select payment method (MTN MoMo, Orange Money, Bank Transfer, or Crypto wallet), enter your account details, and click Submit.
- Withdrawals are approved by the admin team immediately and arrive inside the selected account within 30 minutes. Minimum withdrawal is 500 XAF.

--- REFERRAL SYSTEM COMMISSION ---
- Users earn 1,000 XAF for every active referee they bring to GLOBAL EXCHANGE AND TRADE INVESTMENTS. 
- Referrals are tracked dynamically using individual referral link formats: e.g. "https://globalexchange.com/register?ref=YOUR_USERNAME".

--- SECURITY ASSURANCE ---
- GLOBAL EXCHANGE AND TRADE INVESTMENTS relies on high-grade military SSL protection, Two-Factor Authentication (2FA), encrypted databases, and fraud-detection telemetry to keep users and balances completely safe.

--- USER ASSISTANCE ---
- If a user asks to speak to a human or needs custom support, direct them to submit a ticket via their Dashboard Support tab or click the WhatsApp Live Chat button!
- Be respectful, helpful, write clear formatting, and do NOT lie about returns. State that investments have risk, but GLOBAL EXCHANGE AND TRADE INVESTMENTS mitigates risks using active trade hedging in currency markets and cryptocurrency.

Format all responses elegantly. Limit your replies to be conversational, clear, and bulleted where helpful.`;

    if (ai) {
      try {
        const contents: any[] = [];
        
        // Push chat history if provided
        if (history && Array.isArray(history)) {
          history.forEach(item => {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }]
            });
          });
        }
        
        // Push active user query
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        return res.json({ reply: response.text });
      } catch (err) {
        console.error('Error generating content from Gemini:', err);
        // Fall back to local rules-based responder if API error occurs
      }
    }

    // Rule-Based Smart Simulated AI Chatbot (Fallback)
    const msgLower = message.toLowerCase();
    let reply = `Hello! I am your GLOBAL EXCHANGE AND TRADE INVESTMENTS Virtual Assistant. I am here 24/7 to help you. `;

    if (msgLower.includes('plan') || msgLower.includes('invest') || msgLower.includes('earn') || msgLower.includes('profit')) {
      reply += `We have 3 premium investment plans yielding guaranteed returns in **24 Hours**:\n\n` +
        `• 🟢 **PLAN A**: 1,000 XAF – 50,000 XAF | **20% Return**\n` +
        `• 🟡 **PLAN B**: 51,000 XAF – 200,000 XAF | **25% Return**\n` +
        `• ⚫ **PLAN C (VVIP)**: 210,000 XAF & above | **30% Return**\n\n` +
        `To invest, deposit funds, go to the User Dashboard, click **New Investment**, input your amount, and begin earning immediately!`;
    } else if (msgLower.includes('deposit') || msgLower.includes('payment') || msgLower.includes('pay') || msgLower.includes('proof')) {
      reply += `Depositing is fast and secure. We support MTN Mobile Money, Orange Money, Bank Transfer, and Crypto (USDT, BTC, ETH).\n\n` +
        `**Steps to Deposit:**\n` +
        `1. Go to the **Deposit** page from your dashboard.\n` +
        `2. Choose your payment method and view our safe deposit credentials.\n` +
        `3. Make the transfer, then take a screenshot of your receipt.\n` +
        `4. Upload the receipt screenshot as payment proof on the form and submit.\n` +
        `5. Our finance admins will approve and credit your balance within 10-15 minutes.`;
    } else if (msgLower.includes('withdraw') || msgLower.includes('cashout') || msgLower.includes('payout')) {
      reply += `Withdrawals are highly optimized. You can cash out to MTN MoMo, Orange Money, Bank Transfer, or Crypto.\n\n` +
        `To withdraw, go to the **Withdrawal** page in your dashboard, enter your wallet/bank account number, account name, and amount. Admin reviews and credits your account instantly (usually completed in under 30 minutes!). Minimum withdrawal is 500 XAF.`;
    } else if (msgLower.includes('refer') || msgLower.includes('link') || msgLower.includes('bonus') || msgLower.includes('friend')) {
      reply += `Our Referral System lets you earn premium passive income:\n\n` +
        `• You receive **1,000 XAF** immediately when your referred friend activates their account.\n` +
        `• Your friend receives a welcome bonus of **2,000 XAF** immediately upon registration!\n` +
        `• Share your link from the **Referral Tab** to begin earning together.`;
    } else if (msgLower.includes('admin') || msgLower.includes('human') || msgLower.includes('contact') || msgLower.includes('support') || msgLower.includes('help')) {
      reply += `You can contact our administrator or custom support representatives in two ways:\n\n` +
        `1. Submit a **Support Ticket** directly from your user dashboard. Our administrators reply in minutes.\n` +
        `2. Use our **WhatsApp Live Chat** button in the lower-right corner to speak directly with an active agent!`;
    } else {
      reply += `GLOBAL EXCHANGE AND TRADE INVESTMENTS is highly secured with premium SSL encryption and 2FA. We use expert hedging systems in global stock markets and blockchain currencies to assure consistent 20%-30% payouts after 24 hours.\n\n` +
        `How can I guide you today? You can ask me about **Investment Plans**, **How to Deposit**, **Withdrawals**, or **Referrals**!`;
    }

    res.json({ reply });
  });


  // ==========================================
  // ADMIN DASHBOARD API ROUTES
  // ==========================================

  app.get('/api/admin/stats', (req, res) => {
    processActiveInvestments();

    const users = db.users.filter(u => u.username !== 'admin');
    const transactions = db.transactions;
    const investments = db.investments;

    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalActiveInvestments = investments
      .filter(i => i.status === 'active')
      .reduce((sum, i) => sum + i.amount, 0);

    res.json({
      totalUsers: users.length,
      totalDeposits,
      totalWithdrawals,
      totalActiveInvestments,
      totalReferrals: db.referrals.length,
      pendingDepositsCount: transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length,
      pendingWithdrawalsCount: transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length,
      activeSupportTickets: db.tickets.filter(t => t.status === 'open').length,
      plans: db.plans
    });
  });

  app.get('/api/admin/users', (req, res) => {
    res.json(db.users);
  });

  app.post('/api/admin/users/:userId/status', (req, res) => {
    const { status } = req.body;
    const user = db.users.find(u => u.id === req.params.userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (status !== 'active' && status !== 'suspended') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    user.status = status;
    saveDB();
    res.json({ success: true, message: `User status changed to ${status}`, user });
  });

  app.get('/api/admin/transactions', (req, res) => {
    res.json(db.transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.post('/api/admin/transactions/:txId/approve', (req, res) => {
    const tx = db.transactions.find(t => t.id === req.params.txId);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (tx.status !== 'pending') return res.status(400).json({ error: 'Transaction is already processed' });

    const user = db.users.find(u => u.id === tx.userId);
    if (!user) return res.status(404).json({ error: 'Associated user not found' });

    tx.status = 'approved';

    if (tx.type === 'deposit') {
      // Add funds to total balance
      user.totalBalance += tx.amount;
    } else if (tx.type === 'withdrawal') {
      // Withdrawal is approved, so the already deducted pending funds are finalized
      // No balance adjustment needed as it was deducted on request.
    }

    saveDB();
    res.json({ success: true, message: 'Transaction approved successfully!', transaction: tx });
  });

  app.post('/api/admin/transactions/:txId/reject', (req, res) => {
    const tx = db.transactions.find(t => t.id === req.params.txId);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (tx.status !== 'pending') return res.status(400).json({ error: 'Transaction is already processed' });

    const user = db.users.find(u => u.id === tx.userId);
    if (!user) return res.status(404).json({ error: 'Associated user not found' });

    tx.status = 'rejected';

    if (tx.type === 'withdrawal') {
      // Return deducted funds to withdrawal balance
      user.withdrawalBalance += tx.amount;
    }

    saveDB();
    res.json({ success: true, message: 'Transaction rejected successfully', transaction: tx });
  });

  app.get('/api/admin/tickets', (req, res) => {
    res.json(db.tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.post('/api/admin/plans/edit', (req, res) => {
    const { planId, name, minAmount, maxAmount, returnRate } = req.body;
    const plan = db.plans.find(p => p.id === planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    if (name) plan.name = name;
    if (minAmount) plan.minAmount = Number(minAmount);
    if (maxAmount) plan.maxAmount = Number(maxAmount);
    if (returnRate) plan.returnRate = Number(returnRate);

    saveDB();
    res.json({ success: true, message: 'Investment plan updated successfully', plan });
  });


  // ==========================================
  // VITE / STATIC FILE SERVER ENVIRONMENT
  // ==========================================
  
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GLOBAL EXCHANGE AND TRADE INVESTMENTS API Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot error:', err);
});
