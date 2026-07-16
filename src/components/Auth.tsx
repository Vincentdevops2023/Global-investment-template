import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Landmark, ShieldCheck, Mail, Lock, User as UserIcon, Phone, Globe, ChevronRight, ArrowLeft, RefreshCw, Key } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
  onNavigate: (page: string) => void;
}

export default function Auth({ onAuthSuccess, initialMode = 'login', onNavigate }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Cameroon');
  const [referrer, setReferrer] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [unverifiedUserId, setUnverifiedUserId] = useState<string | null>(null);
  const [preferredPlan, setPreferredPlan] = useState('plan_a');

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccess(null);
  }, [initialMode]);

  // Check if referrer code is present in URL as a cool realistic touch
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferrer(ref);
      if (mode === 'login') setMode('register');
    }
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter your email and password');
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        setLoading(false);
        return setError(`Server Error (${res.status}): ${text.substring(0, 120) || 'Internal server error'}`);
      }
      setLoading(false);

      if (!res.ok) {
        return setError(data.error || 'Invalid credentials');
      }

      // Check if email is verified
      if (!data.user.isEmailVerified) {
        setUnverifiedUserId(data.user.id);
        if (data.user.verificationCode) {
          setVerifyCode(data.user.verificationCode);
        }
        setError('Your email is not verified yet. Please enter your verification code to activate your account.');
        setMode('verify');
        return;
      }

      setSuccess('Login successful!');
      onAuthSuccess(data.user);
    } catch (err) {
      setLoading(false);
      setError('Connection to server failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName || !username || !email || !password) {
      return setError('Please fill in all mandatory fields');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username,
          email,
          phone,
          country,
          password,
          referrer,
          preferredPlan
        })
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        setLoading(false);
        return setError(`Server Error (${res.status}): ${text.substring(0, 120) || 'Internal server error'}`);
      }
      setLoading(false);

      if (!res.ok) {
        return setError(data.error || 'Registration failed');
      }

      setSuccess(data.message || 'Registration successful! Verification code sent.');
      setUnverifiedUserId(data.user.id);
      setVerifyCode(data.user.verificationCode || ''); // seed code for testing convenience
      setMode('verify');
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Please retry.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode) return setError('Please enter the 6-digit verification code');

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: unverifiedUserId, code: verifyCode })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return setError(data.error || 'Verification failed');
      }

      setSuccess('Your email has been verified! You can now log in.');
      setMode('login');
    } catch (err) {
      setLoading(false);
      setError('Verification failed due to connectivity.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address');

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return setError(data.error || 'Error processing request');
      }

      setSuccess(data.message);
    } catch (err) {
      setLoading(false);
      setError('Connection failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative font-sans" id="auth-module">
      
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6">
        
        {/* Logo brand info */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl text-black font-black mb-4 shadow-xl shadow-amber-500/10">
            <Landmark className="h-6 w-6" />
          </div>
          <h2 className="font-display font-black text-2xl tracking-wider text-white">
            Cam<span className="text-amber-400">Invest</span> Pro
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 uppercase font-mono tracking-widest">
            Institutional Hedging Platform
          </p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel-glow-gold rounded-2xl border border-gray-800 p-6 sm:p-8 relative">
          
          {/* Header Action Swappers */}
          {mode !== 'verify' && mode !== 'forgot' && (
            <div className="flex border-b border-gray-900 pb-4 mb-6">
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className={`flex-1 text-center font-mono uppercase tracking-wider text-xs font-bold pb-2 border-b-2 transition ${
                  mode === 'login' ? 'border-amber-400 text-amber-400 font-black' : 'border-transparent text-gray-500'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                className={`flex-1 text-center font-mono uppercase tracking-wider text-xs font-bold pb-2 border-b-2 transition ${
                  mode === 'register' ? 'border-amber-400 text-amber-400 font-black' : 'border-transparent text-gray-500'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Quick instructions for testing admin/demo account */}
          {mode === 'login' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-400 font-mono mb-4 leading-normal space-y-2">
              <strong className="block text-amber-400">💡 Quick-Bypass Demo Logins:</strong>
              <div className="flex items-center justify-between gap-1.5 border-b border-amber-500/10 pb-1.5">
                <span>• Admin: <code className="text-white font-semibold">admin@globalexchange.com</code> (Pass: <code className="text-white">admin123</code>)</span>
                <button 
                  type="button"
                  onClick={() => {
                    setEmail('admin@globalexchange.com');
                    setPassword('admin123');
                    setError(null);
                  }}
                  className="px-2 py-0.5 bg-rose-500 text-black text-[9px] font-black uppercase rounded hover:bg-rose-400 transition"
                >
                  Auto-fill
                </button>
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <span>• Investor: <code className="text-white font-semibold">user@demo.com</code> (Pass: <code className="text-white">demo</code>)</span>
                <button 
                  type="button"
                  onClick={() => {
                    setEmail('user@demo.com');
                    setPassword('demo');
                    setError(null);
                  }}
                  className="px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-black uppercase rounded hover:bg-emerald-400 transition"
                >
                  Auto-fill
                </button>
              </div>
            </div>
          )}

          {/* Messages feedback */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-3 text-xs font-medium mb-4 leading-normal">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-3 text-xs font-medium mb-4 leading-normal">
              {success}
            </div>
          )}

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Email Address or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username or email"
                    className="w-full bg-gray-950/80 border border-gray-800 text-sm text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[10px] font-mono text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-gray-950/80 border border-gray-800 text-sm text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* SSL lock notice */}
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono py-1">
                <Key className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>SSL Secured Institutional Session</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-amber-500/10 hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Enter Platform'}
              </button>
            </form>
          )}

          {/* REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nchout Poumie"
                    className="w-full bg-gray-950/80 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="npoumie"
                    className="w-full bg-gray-950/80 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="poumie@domain.com"
                  className="w-full bg-gray-950/80 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 6XX XX XX XX"
                    className="w-full bg-gray-950/80 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Cameroon">Cameroon</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Chad">Chad</option>
                    <option value="Congo">Congo</option>
                    <option value="Nigeria">Nigeria</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-950/80 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-950/80 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                  <span>Referrer Username (Optional)</span>
                  <span className="text-[9px] text-emerald-400 lowercase font-sans font-semibold">
                    ⭐ referred gets +2000 XAF
                  </span>
                </label>
                <input
                  type="text"
                  value={referrer}
                  onChange={(e) => setReferrer(e.target.value)}
                  placeholder="Referrer username"
                  className="w-full bg-gray-950/80 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                  <span>Preferred Starting Investment Option</span>
                  <span className="text-[9px] text-amber-400 font-sans font-semibold">
                    Flexible change later
                  </span>
                </label>
                <select
                  value={preferredPlan}
                  onChange={(e) => setPreferredPlan(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="plan_a">Bronze Arbitrage (Yield +12%) - 24H Lock</option>
                  <option value="plan_b">Silver Hedging (Yield +18%) - 24H Lock</option>
                  <option value="plan_c">Gold Liquidation (Yield +25%) - 24H Lock</option>
                  <option value="plan_d">VIP Institutional (Yield +35%) - 24H Lock</option>
                </select>
              </div>

              {/* terms agreement */}
              <p className="text-[9px] text-gray-500 font-mono text-center">
                By clicking Register, you confirm agreement to the GLOBAL EXCHANGE AND TRADE INVESTMENTS quantitative hedging terms and conditions.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-amber-400/10 hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Register Account'}
              </button>
            </form>
          )}

          {/* EMAIL VERIFICATION MODE */}
          {mode === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center space-y-2 mb-2">
                <h3 className="font-display font-bold text-white text-md">Enter 6-Digit Email Code</h3>
                <p className="text-[11px] text-gray-400 leading-normal">
                  A verification code has been dispatched to your email inbox. For easy testing in our dev environment, we pre-filled the generated code, or you can use <code className="text-amber-400 font-bold bg-gray-950 px-1 py-0.5 rounded">123456</code>.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-gray-950 border border-gray-800 text-center text-white tracking-widest font-mono text-2xl font-bold rounded-xl py-3.5 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition hover:scale-105"
              >
                {loading ? 'Verifying Code...' : 'Activate Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mx-auto font-mono"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="text-center space-y-2 mb-2">
                <h3 className="font-display font-bold text-white text-md">Recover Access Credentials</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Enter your registered email address below, and our server will route secure instructions to restore access.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-gray-950/80 border border-gray-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl"
              >
                Generate Reset Instructions
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mx-auto font-mono"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
