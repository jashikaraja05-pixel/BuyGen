import React from 'react';
import { X, ShieldCheck, Truck, RefreshCw, Cpu, CheckCircle2, Zap, Package, Headphones, Lock } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0e24] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img 
              src="/buygen-logo.jpg" 
              alt="BUYGEN" 
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/30"
            />
            <span className="absolute -inset-1 rounded-2xl bg-cyan-400/20 blur-xs -z-10"></span>
          </div>
          <div>
            <h2 className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2">
              <span>BUY<span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">GEN</span></span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Official Marketplace
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Next-Gen Consumer Electronics • Built for Reliability & Performance
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          
          <div>
            <h3 className="font-heading font-bold text-white text-base mb-1.5 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>About BUYGEN</span>
            </h3>
            <p className="text-slate-300">
              BUYGEN is a full-fledged consumer electronics marketplace delivering authentic computing devices, smartphones, audiophile equipment, monitors, and smart tech. All catalog items are maintained in real-time with verified inventory, direct order placement, and live stock tracking.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-300 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Real Inventory Tracking</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Stock deducts automatically upon each order. Zero mock stock — what you see is what is available in the warehouse.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">100% Genuine Warranty</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Every product is covered by manufacturer warranty with direct verification.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-300 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">7-Day Easy Replacement</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hassle-free replacement policy for defective or transit-damaged items.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Multiple Payment Methods</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dynamic UPI QR Code scanning, Cash on Delivery (COD), and Credit/Debit cards.
                </p>
              </div>
            </div>

          </div>

          {/* Under the hood AI */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
            <h4 className="font-bold text-indigo-200 text-xs sm:text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>How BUYGEN Works Under the Hood</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
              • <strong>Live Inventory Sync:</strong> Real warehouse quantities update instantly. When you buy an item, stock reduces automatically; when admin restocks, it reflects in real-time.<br/>
              • <strong>Inbuilt Intelligent Search:</strong> Silently recognizes misspelled keywords (e.g. typing "phene" finds phones, "lapotp" finds laptops) and matches precise hardware specs.<br/>
              • <strong>Custom Payment Gateway:</strong> Seamlessly checkout using dynamic UPI QR Code, Cash on Delivery (COD), Card, or Net Banking managed directly by store administrators.<br/>
              • <strong>Transparent Order Tracking:</strong> Real-time tracking from Pending to Confirmed, Packaging, and Shipped with tracking IDs.
            </p>
          </div>

        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">
            BUYGEN Electronics Marketplace © {new Date().getFullYear()}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); navigate('/products'); }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Browse Electronics
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
