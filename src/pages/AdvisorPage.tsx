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
import { AIAdvisorResponse } from '../types/index.ts';
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
      setError(err.message || 'Advisor error. Please retry.');
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 overflow-hidden border border-indigo-900 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI-Powered Electronic Consulting</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            BUYGEN Smart Tech Advisor
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Enter your natural-language requirements. The advisor analyzes your budget, processor, RAM, and use case, queries our real product database, and recommends the best matched devices with explicit justifications.
          </p>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <label className="block font-heading font-bold text-sm text-slate-900">
          What kind of tech are you looking for?
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. I need a laptop under ₹70,000 with 16GB RAM for programming..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !prompt.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Consulting Advisor...' : 'Analyze & Match'}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Try One Of These Real Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => { setPrompt(p); handleAsk(p); }}
                className="px-3 py-1.5 rounded-full text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition cursor-pointer text-left"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading animation */}
      {loading && (
        <div className="p-12 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
          <h3 className="font-heading font-bold text-slate-900 text-base">
            Analyzing Requirements & Scanning Database...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Extracting budget criteria, filtering in-stock electronics, and formulating comparison rationale.
          </p>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Extracted Requirements Summary Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Requirements Synthesized</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {result.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
              {result.extractedRequirements?.budget && (
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Budget Cap</span>
                  <span className="font-bold text-white">₹{result.extractedRequirements.budget.toLocaleString('en-IN')}</span>
                </div>
              )}
              {result.extractedRequirements?.category && (
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                  <span className="font-bold text-white">{result.extractedRequirements.category}</span>
                </div>
              )}
              {result.extractedRequirements?.useCase && (
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Use Case</span>
                  <span className="font-bold text-white truncate block">{result.extractedRequirements.useCase}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Stream */}
          <div className="space-y-6">
            <h2 className="font-heading font-black text-2xl text-slate-900">
              Personalized Recommendations
            </h2>

            <div className="space-y-6">
              {result.recommendations.map((rec: any, idx: number) => {
                const prod = rec.product;
                if (!prod) return null;

                const isPrimary = rec.type === 'recommended';

                return (
                  <div
                    key={idx}
                    className={`rounded-3xl p-6 sm:p-8 border shadow-xs transition ${
                      isPrimary 
                        ? 'bg-gradient-to-r from-indigo-50/50 via-white to-white border-indigo-200 ring-2 ring-indigo-500/10' 
                        : 'bg-white border-slate-200/80'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      
                      {/* Product Thumbnail */}
                      <div className="w-full lg:w-48 h-48 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isPrimary ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'
                            }`}>
                              {isPrimary ? '⭐ Recommended For You' : 'Alternative Option'}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase">{prod.brand}</span>
                          </div>

                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            In Stock ({prod.stock} units)
                          </span>
                        </div>

                        <div>
                          <h3 
                            onClick={() => navigate(`/products/${prod.id}`)}
                            className="font-heading font-bold text-lg sm:text-xl text-slate-900 hover:text-indigo-600 cursor-pointer transition"
                          >
                            {prod.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-heading font-black text-2xl text-slate-900">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{prod.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Why it matches */}
                        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1.5 text-xs text-indigo-950">
                          <span className="font-bold flex items-center gap-1 text-indigo-900">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            Why this matches your criteria:
                          </span>
                          <p className="leading-relaxed text-indigo-900">
                            {rec.whyItMatches}
                          </p>
                          {rec.difference && (
                            <p className="text-indigo-800 pt-1 border-t border-indigo-200/60 font-medium">
                              <strong>Key difference:</strong> {rec.difference}
                            </p>
                          )}
                        </div>

                        {/* Key Specifications Bullets */}
                        {rec.keySpecs && rec.keySpecs.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {rec.keySpecs.map((spec: string, sIdx: number) => (
                              <span key={sIdx} className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium">
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            onClick={() => addToCart(prod.id, 1)}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                          <button
                            onClick={() => navigate(`/products/${prod.id}`)}
                            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
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
