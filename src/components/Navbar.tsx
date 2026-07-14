import { useState } from 'react';
import { User } from '../types';
import { Landmark, ShieldAlert, LogOut, User as UserIcon, LayoutDashboard, Menu, X, Smartphone, Globe, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ currentUser, onLogout, onNavigate, currentPage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Investment Plans', id: 'plans' },
    { name: 'Profit Calculator', id: 'calculator' },
    { name: 'About Us', id: 'about' },
    { name: 'FAQ', id: 'faq' }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#0B132B]/90 backdrop-blur-md border-b border-gray-800/80 font-sans" id="primary-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl text-black font-extrabold relative overflow-hidden transition group-hover:scale-105 shadow-lg shadow-amber-500/10">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-black text-xs sm:text-sm tracking-wider text-white flex items-center">
                GLOBAL<span className="text-amber-400">EXCHANGE</span>
                <span className="text-[9px] uppercase font-mono tracking-widest font-semibold px-1.5 py-0.5 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded ml-2">
                  PRO
                </span>
              </span>
              <p className="text-[8px] text-gray-400 font-mono tracking-wider mt-0.5 uppercase">And Trade Investments</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-xs uppercase tracking-widest font-bold font-mono transition-all py-2 hover:text-amber-400 border-b-2 ${
                  currentPage === link.id 
                    ? 'border-amber-400 text-amber-400' 
                    : 'border-transparent text-gray-300'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* User Session Interface */}
          <div className="hidden lg:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-4">
                {/* Balance display */}
                <div className="bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-gray-500 block">AVAILABLE</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {currentUser.withdrawalBalance.toLocaleString()} XAF
                    </span>
                  </div>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                {/* Dashboard Shortcut */}
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition ${
                    currentPage === 'dashboard'
                      ? 'bg-amber-400 border-amber-400 text-black shadow-lg shadow-amber-400/10'
                      : 'border-gray-800 hover:border-amber-500/30 text-gray-300 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>

                {/* Admin Shortcut if Admin */}
                {(currentUser.username === 'admin' || currentUser.email === 'admin@globalexchange.com' || currentUser.email === 'admin@caminvest.com') && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition ${
                      currentPage === 'admin'
                        ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                        : 'border-rose-950 bg-rose-950/10 hover:bg-rose-950/30 text-rose-400'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 text-rose-400" />
                    Admin Portal
                  </button>
                )}

                {/* Profile Shortcut */}
                <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 text-black font-extrabold flex items-center justify-center text-xs shadow-md">
                    {getInitials(currentUser.fullName)}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-gray-200 block max-w-[100px] truncate">{currentUser.fullName}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">{currentUser.username}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-400 transition"
                    title="Log Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('auth_login')}
                  className="px-4.5 py-2.5 rounded-xl border border-gray-800 hover:border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider text-gray-300 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('auth_register')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/10 hover:scale-105 transition duration-200"
                >
                  Start Investing
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-900 transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-900 bg-[#0B132B] px-4 pt-3 pb-6 space-y-3.5">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-xs uppercase tracking-wider font-bold font-mono py-2.5 px-3 rounded-lg transition-all ${
                  currentPage === link.id 
                    ? 'bg-amber-400/10 text-amber-400 border-l-4 border-amber-400 pl-4' 
                    : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-3">
            {currentUser ? (
              <div className="space-y-4">
                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-gray-500 block">Withdrawal Balance</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {currentUser.withdrawalBalance.toLocaleString()} XAF
                    </span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center text-xs">
                    {getInitials(currentUser.fullName)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3 bg-gray-950/60 border border-gray-800 hover:border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider text-white rounded-xl transition"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3 bg-red-950/20 border border-red-950 text-red-400 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition"
                  >
                    Logout
                  </button>
                </div>

                {(currentUser.username === 'admin' || currentUser.email === 'admin@globalexchange.com' || currentUser.email === 'admin@caminvest.com') && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3 bg-rose-950/20 border border-rose-900 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Portal
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    onNavigate('auth_login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 bg-gray-950/60 border border-gray-800 text-xs font-mono font-bold uppercase tracking-wider text-white rounded-xl transition"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onNavigate('auth_register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-mono font-bold uppercase tracking-wider rounded-xl shadow-md"
                >
                  Start Investing
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
