import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface SearchResultsPageProps {
  searchQuery: string;
  navigate: (path: string) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ searchQuery, navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [interpreted, setInterpreted] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doSearch = async () => {
      try {
        setLoading(true);
        const res = await api.smartSearch(searchQuery);
        setProducts(res.products || []);
        setInterpreted(res.interpreted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      doSearch();
    }
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          <Search className="w-3.5 h-3.5" />
          <span>Product Search</span>
        </div>
        <h1 className="font-heading font-black text-3xl text-white">
          Results for "{searchQuery}"
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Found {products.length} matching products from our warehouse catalog.
        </p>
      </div>

      {interpreted && interpreted.maxPrice && (
        <div className="p-3.5 rounded-2xl bg-[#0b0e24] border border-cyan-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Applied Filter:</span>
            <span className="px-2.5 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-cyan-300 font-semibold">
              Budget: Under ₹{interpreted.maxPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            onClick={() => navigate('/advisor')}
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Ask Tech Advisor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-900 rounded-2xl border border-slate-800"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 bg-[#0b0e24] rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-white text-lg">No Exact Matches Found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            We couldn't find any electronics directly matching "{searchQuery}". Try our BUYGEN Smart Tech Advisor for guided recommendations.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/advisor')}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition"
            >
              Consult Tech Advisor
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition"
            >
              Browse All
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} navigate={navigate} />
          ))}
        </div>
      )}

    </div>
  );
};
