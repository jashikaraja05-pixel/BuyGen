import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar animation over ~2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + 5;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#060814] flex flex-col justify-between items-center px-6 py-12 select-none overflow-hidden text-white">
      {/* Background Cyber Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/25 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Tagline */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        <span>BUYGEN ELECTRONICS • NEXT-GEN SHOPPING, SMARTER CHOICES</span>
      </div>

      {/* Center 3D Brand Logo & Branding */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md w-full">
        {/* Glowing Logo with Neon Orbit Ring */}
        <div className="relative group">
          {/* Animated Neon Rings */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 opacity-60 blur-xl animate-pulse"></div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-80 blur-xs"></div>
          
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-cyan-400/80 bg-slate-950 p-1 flex items-center justify-center">
            <img 
              src="/buygen-logo.jpg" 
              alt="BUYGEN" 
              className="w-full h-full object-cover rounded-xl transform transition-transform duration-700 hover:scale-105" 
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white">
            BUY<span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">GEN</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-cyan-300">
            Next-Gen Shopping, Smarter Choices.
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            High-Performance Consumer Electronics with Smart Tech Advisor
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-64 space-y-2">
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 transition-all duration-150 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-cyan-400/80 font-mono">
            <span>INITIALIZING SECURE STORE</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* "GET STARTED" Button (Clickable or Auto-transition) */}
        <button
          onClick={onComplete}
          className="mt-4 px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm tracking-wider uppercase rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all flex items-center gap-2.5 cursor-pointer transform active:scale-95"
        >
          <span>GET STARTED</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>

      {/* Footer System Indicator */}
      <div className="relative z-10 flex items-center gap-6 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          Role-Based Auth (Customer / Admin)
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Real Database & Storage
        </span>
      </div>
    </div>
  );
};
