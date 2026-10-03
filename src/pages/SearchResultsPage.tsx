import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import { Product } from '../types/index.ts';
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
        // Uses the AI Smart Search endpoint that parses natural language and queries real DB
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>Smart Natural-Language Search</span>
        </div>
        <h1 className="font-heading font-black text-3xl text-slate-900">
          Results for "{searchQuery}"
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Found {products.length} matching products from our persistent catalog.
        </p>
      </div>

      {/* Clean budget badge if specified, without any typo detection messages */}
      {interpreted && interpreted.maxPrice && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-900">Applied Filter:</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-indigo-200 text-indigo-800 font-semibold">
              Budget: Under ₹{interpreted.maxPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            onClick={() => navigate('/advisor')}
            className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Ask Tech Advisor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-slate-900 text-lg">No Exact Matches</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            We couldn't find any electronics directly matching "{searchQuery}". Try our BUYGEN Smart Tech Advisor for guided recommendations.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/advisor')}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Consult Tech Advisor
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
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
