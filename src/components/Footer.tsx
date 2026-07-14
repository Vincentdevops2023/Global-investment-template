import { Landmark, ShieldAlert, Mail, MapPin, Phone, Github } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#050811] border-t border-gray-900/80 pt-16 pb-8 font-sans mt-24 text-gray-400" id="primary-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="p-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl text-black font-extrabold relative overflow-hidden shadow-md">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-black text-xs sm:text-sm tracking-wider text-white">
                GLOBAL<span className="text-amber-400">EXCHANGE</span>
                <span className="text-[9px] uppercase font-mono tracking-widest font-semibold px-1.5 py-0.5 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded ml-2">
                  PRO
                </span>
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed">
            The standard-bearer of secure Cameroon fintech. GLOBAL EXCHANGE AND TRADE INVESTMENTS leverages professional quantitative hedging models across global markets and major blockchain currencies to pay out guaranteed, robust daily yields.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-3.5 pt-2">
            {['Facebook', 'Instagram', 'Twitter', 'Telegram'].map((s) => (
              <a 
                key={s} 
                href={`#${s.toLowerCase()}`}
                className="w-8 h-8 rounded-lg bg-gray-950 border border-gray-950 hover:border-amber-400 hover:text-white flex items-center justify-center transition text-xs font-mono"
              >
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Investment plans */}
        <div>
          <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2.5">
            Yield Portfolios
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('plans')} className="hover:text-amber-400 transition text-left">
                Plan A (Starter, 20% Return)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('plans')} className="hover:text-amber-400 transition text-left">
                Plan B (Gold Medium, 25% Return)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('plans')} className="hover:text-amber-400 transition text-left">
                Plan C (VVIP Luxury, 30% Return)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('calculator')} className="hover:text-amber-400 transition text-left font-semibold">
                → Real-Time Yield Calculator
              </button>
            </li>
          </ul>
        </div>

        {/* Support and contact info */}
        <div>
          <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2.5">
            Support Desk
          </h4>
          <ul className="space-y-3.5 text-xs">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-400 shrink-0" />
              <span>support@globalexchange.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-400 shrink-0" />
              <span>+237 670 123 456 (Mobile Money Support)</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Bonanjo Business Block, Douala, Cameroon</span>
            </li>
          </ul>
        </div>

        {/* Legal & Terms */}
        <div>
          <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2.5">
            Platform Legal
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('terms')} className="hover:text-amber-400 transition text-left">
                Terms of Services & Disclosures
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('privacy')} className="hover:text-amber-400 transition text-left">
                Privacy Protection Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('faq')} className="hover:text-amber-400 transition text-left">
                Frequently Asked Questions (FAQ)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-amber-400 transition text-left">
                About Our Hedging Protocols
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Prominent Risk Disclaimer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-900/60">
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex flex-col md:flex-row items-start gap-4">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono mb-1">
              FINANCIAL MARKET RISK DISCLAIMER & SECURITY NOTICE
            </h5>
            <p className="text-[10px] leading-relaxed text-gray-500">
              Disclaimer: GLOBAL EXCHANGE AND TRADE INVESTMENTS operates sophisticated computer-driven algorithmic hedging contracts across highly volatile global exchange markets and cryptocurrency pairs. While our platform guarantees 20% to 30% daily interest returns on selected capital tiers, all forms of digital capital investments contain fundamental market risk. Accrued interest calculations are driven by real-time trade liquidation values. Clients are strictly advised to manage their portfolios responsibly and not to exceed their personal liquidity risk metrics. Guaranteed return timelines (24 Hours) are supported by reserved asset backing.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Copy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left text-[11px] text-gray-600 gap-4">
        <span>© 2026 GLOBAL EXCHANGE AND TRADE INVESTMENTS. All Rights Reserved. Co. Reg. No. CAM-6701-DL.</span>
        <span className="font-mono text-[10px]">Douala, Cameroon | SSL Certified Sec. 256-Bit Cryptography</span>
      </div>
    </footer>
  );
}
