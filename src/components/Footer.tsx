import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Sparkles, Cpu, Award } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Free Express Dispatch</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Fast same-day processing on all flagship electronics orders.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Genuine Warranty</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Brand-authorized manufacturer warranty on every gadget sold.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">7-Day Replacement</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Hassle-free replacement policy for defective or transit-damaged items.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Smart Tech Advisor</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                AI requirement analysis connected to our live product catalog.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <img 
                src="/buygen-logo.jpg" 
                alt="BUYGEN" 
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-cyan-500/40 shadow-md shadow-cyan-500/20" 
              />
              <span className="font-heading font-black text-2xl tracking-tight text-white">
                BUY<span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">GEN</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3 max-w-sm leading-relaxed">
              "Next-Gen Shopping, Smarter Choices."
              The premier electronics marketplace delivering high-performance computing, audio fidelity, and smart gadgets with AI-guided buying advice.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                <Cpu className="w-3 h-3 text-cyan-400" />
                INFYHACKATHON 2.0
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                <Award className="w-3 h-3 text-emerald-400" />
                Production Grade
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Categories</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => navigate('/categories/smartphones')} className="hover:text-white transition">Smartphones</button></li>
              <li><button onClick={() => navigate('/categories/laptops')} className="hover:text-white transition">Laptops</button></li>
              <li><button onClick={() => navigate('/categories/headphones-earbuds')} className="hover:text-white transition">Headphones & ANC</button></li>
              <li><button onClick={() => navigate('/categories/monitors')} className="hover:text-white transition">Gaming Monitors</button></li>
              <li><button onClick={() => navigate('/categories/keyboards-mouse')} className="hover:text-white transition">Mechanical Keyboards</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Smart Experience</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => navigate('/advisor')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition">BUYGEN Tech Advisor</button></li>
              <li><button onClick={() => navigate('/compare')} className="hover:text-white transition">Product Comparison</button></li>
              <li><button onClick={() => navigate('/products')} className="hover:text-white transition">Live Spec Filtering</button></li>
              <li><button onClick={() => navigate('/wishlist')} className="hover:text-white transition">Saved Wishlist</button></li>
              <li><button onClick={() => navigate('/cart')} className="hover:text-white transition">Shopping Cart</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Customer & Admin</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => navigate('/orders')} className="hover:text-white transition">Order History</button></li>
              <li><button onClick={() => navigate('/profile')} className="hover:text-white transition">Account Profile</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition">Customer Login</button></li>
              <li><button onClick={() => navigate('/admin')} className="text-amber-400 hover:text-amber-300 font-semibold transition">Admin Dashboard</button></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 BUYGEN Electronics Marketplace. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>Simulated Checkout: UPI / Card / COD</span>
          <span>•</span>
          <span>Persistent Firestore DB</span>
        </p>
      </div>
    </footer>
  );
};
