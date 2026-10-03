import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Check, 
  ArrowRight, 
  ShoppingCart, 
  Star, 
  Cpu, 
  Tag, 
  CheckCircle2, 
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { AIAdvisorResponse } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface AdvisorPageProps {
  initialQuery?: string;
  navigate: (path: string) => void;
}

export const AdvisorPage: React.FC<AdvisorPageProps> = ({ initialQuery = '', navigate }) => {
  const { addToCart } = useCart();
  const [prompt, setPrompt] = useState<string>(initialQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIAdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = [
    'I need a laptop under ₹70,000 with 16GB RAM for programming.',
    'Best ANC headphones under ₹35,000 for frequent travel with long battery.',
    'Smartphone with exceptional zoom camera and 512GB storage under ₹1,50,000.',
    '4K gaming monitor with high refresh rate for competitive gameplay.',
    'Custom mechanical keyboard with tactile switches and multi-device Bluetooth.'
  ];

  const handleAsk = async (textToAsk?: string) => {
    const query = (textToAsk || prompt).trim();
    if (!query) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.askTechAdvisor(query);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Smart Tech Advisor encountered an issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setPrompt(initialQuery);
      handleAsk(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-[#0b0e24] text-white p-8 sm:p-12 overflow-hidden border border-cyan-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Smart Hardware Consulting</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            BUY<span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">GEN</span> Tech Advisor
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Enter your requirements and preferences. The intelligent advisor analyzes your budget, target processor, RAM, and usage needs, matches against our warehouse inventory, and recommends verified products.
          </p>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <label className="block font-heading font-bold text-sm text-white">
          What kind of tech or setup are you looking for?
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. I need a laptop under ₹70,000 with 16GB RAM for programming..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="flex-1 p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 transition"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !prompt.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <span>Match Hardware</span>
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Popular Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(s);
                  handleAsk(s);
                }}
                className="text-left text-[11px] px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading animation */}
      {loading && (
        <div className="p-12 bg-[#0b0e24] rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mx-auto"></div>
          <h3 className="font-heading font-bold text-white text-base">
            Analyzing Hardware Requirements & Scanning Live Catalog...
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Extracting budget parameters, filtering in-stock electronics, and formulating comparison rationale.
          </p>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Extracted Requirements Summary Card */}
          <div className="bg-[#0b0e24] text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Synthesized Search Criteria</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {result.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
              {result.extractedRequirements?.budget && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Budget Cap</span>
                  <span className="font-bold text-white">₹{result.extractedRequirements.budget.toLocaleString('en-IN')}</span>
                </div>
              )}
              {result.extractedRequirements?.category && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                  <span className="font-bold text-white">{result.extractedRequirements.category}</span>
                </div>
              )}
              {result.extractedRequirements?.useCase && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Use Case</span>
                  <span className="font-bold text-white truncate block">{result.extractedRequirements.useCase}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Stream */}
          <div className="space-y-6">
            <h2 className="font-heading font-black text-2xl text-white">
              Hardware Recommendations
            </h2>

            <div className="space-y-6">
              {result.recommendations.map((rec: any, idx: number) => {
                const prod = rec.product;
                if (!prod) return null;

                const isPrimary = rec.type === 'recommended';

                return (
                  <div
                    key={idx}
                    className={`rounded-3xl p-6 sm:p-8 border shadow-xl transition ${
                      isPrimary 
                        ? 'bg-[#0b0e24] border-cyan-500/50 ring-1 ring-cyan-500/30' 
                        : 'bg-[#0c0f26] border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      
                      {/* Product Thumbnail */}
                      <div className="w-full lg:w-48 h-48 rounded-2xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isPrimary ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {isPrimary ? '⭐ Recommended For You' : 'Alternative Option'}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase">{prod.brand}</span>
                          </div>

                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            In Stock ({prod.stock} units)
                          </span>
                        </div>

                        <div>
                          <h3 
                            onClick={() => navigate(`/products/${prod.id}`)}
                            className="font-heading font-bold text-lg sm:text-xl text-white hover:text-cyan-400 cursor-pointer transition"
                          >
                            {prod.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-heading font-black text-2xl text-white">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-xs text-slate-500 line-through">
                                ₹{prod.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Why it matches */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                          <span className="font-bold flex items-center gap-1 text-cyan-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                            Why this matches your criteria:
                          </span>
                          <p className="leading-relaxed text-slate-300">
                            {rec.whyItMatches}
                          </p>
                          {rec.difference && (
                            <p className="text-slate-400 pt-1 border-t border-slate-800 font-medium">
                              <strong className="text-slate-200">Key difference:</strong> {rec.difference}
                            </p>
                          )}
                        </div>

                        {/* Key Specifications Bullets */}
                        {rec.keySpecs && rec.keySpecs.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {rec.keySpecs.map((spec: string, sIdx: number) => (
                              <span key={sIdx} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-medium">
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            onClick={() => addToCart(prod.id, 1)}
                            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                          <button
                            onClick={() => navigate(`/products/${prod.id}`)}
                            className="px-5 py-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            View Product Details
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
