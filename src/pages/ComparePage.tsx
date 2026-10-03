import React, { useEffect, useState } from 'react';
import { 
  SlidersHorizontal, 
  Trash2, 
  ShoppingCart, 
  Star, 
  Sparkles, 
  Plus, 
  Check, 
  AlertCircle,
  X,
  Cpu
} from 'lucide-react';
import type { Product } from '../types/index.ts';
import { useCompare } from '../context/CompareContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { api } from '../services/api.ts';

interface ComparePageProps {
  navigate: (path: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ navigate }) => {
  const { compareProducts, removeFromCompare, clearCompare, addToCompare } = useCompare();
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);

  useEffect(() => {
    api.getProducts().then(res => setAllProducts(res.products || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const runComparison = async () => {
      if (compareProducts.length < 2) {
        setAnalysis('');
        return;
      }
      try {
        setAnalyzing(true);
        const res = await api.compareProducts(compareProducts.map(p => p.id));
        setAnalysis(res.analysis);
      } catch (err) {
        console.error(err);
      } finally {
        setAnalyzing(false);
      }
    };

    runComparison();
  }, [compareProducts]);

  // Aggregate all specification keys across compared products
  const allSpecKeys = Array.from(
    new Set(compareProducts.flatMap(p => Object.keys(p.specifications || {})))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Side-by-Side Hardware Comparison</span>
          </div>
          <h1 className="font-heading font-black text-3xl text-white">
            Compare Electronics ({compareProducts.length}/3)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Select up to 3 consumer devices to compare hardware specs, pricing, and hardware match.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {compareProducts.length < 3 && (
            <button
              onClick={() => setSelectorOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}

          {compareProducts.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-3.5 py-2 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 bg-slate-900 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* When 0 products are selected */}
      {compareProducts.length === 0 ? (
        <div className="p-16 bg-[#0b0e24] rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-white text-lg">No Products in Comparison</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Click the compare button on any product card or click "Add Product" above to begin your technical spec comparison.
          </p>
          <button
            onClick={() => setSelectorOpen(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            Select Products to Compare
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Comparison Matrix Table */}
          <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 shadow-xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60">
                  <th className="p-4 sm:p-6 w-1/4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Product Specification
                  </th>
                  {compareProducts.map((prod) => (
                    <th key={prod.id} className="p-4 sm:p-6 w-1/4 align-top">
                      <div className="relative space-y-3">
                        <button
                          onClick={() => removeFromCompare(prod.id)}
                          className="absolute -top-2 -right-2 p-1 bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 rounded-full transition cursor-pointer border border-slate-800"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="w-24 h-24 rounded-xl bg-slate-950 overflow-hidden mx-auto border border-slate-800">
                          <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>

                        <div className="text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{prod.brand}</span>
                          <h4 
                            onClick={() => navigate(`/products/${prod.id}`)}
                            className="font-heading font-bold text-xs sm:text-sm text-white hover:text-cyan-400 cursor-pointer line-clamp-2 transition"
                          >
                            {prod.name}
                          </h4>
                          <p className="font-heading font-black text-base text-cyan-300 mt-1">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </p>
                        </div>

                        <button
                          onClick={() => addToCart(prod.id, 1)}
                          disabled={prod.stock <= 0}
                          className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </th>
                  ))}
                  {/* Empty placeholder slot if < 3 */}
                  {compareProducts.length < 3 && (
                    <th className="p-4 sm:p-6 w-1/4 align-middle text-center bg-slate-950/20 border-l border-dashed border-slate-800">
                      <button
                        onClick={() => setSelectorOpen(true)}
                        className="p-6 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl text-slate-400 hover:text-cyan-300 flex flex-col items-center gap-2 mx-auto cursor-pointer transition"
                      >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs font-bold">Add 3rd Product</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 text-xs sm:text-sm font-medium">
                
                {/* Brand row */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-400 bg-slate-950/40">Brand</td>
                  {compareProducts.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 font-semibold text-white">{p.brand}</td>
                  ))}
                  {compareProducts.length < 3 && <td></td>}
                </tr>

                {/* Rating row */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-400 bg-slate-950/40">Customer Rating</td>
                  {compareProducts.map(p => (
                    <td key={p.id} className="p-4 sm:p-5">
                      <div className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{p.rating} / 5.0</span>
                        <span className="text-slate-500 font-normal">({p.reviewCount})</span>
                      </div>
                    </td>
                  ))}
                  {compareProducts.length < 3 && <td></td>}
                </tr>

                {/* Stock row */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-400 bg-slate-950/40">Availability</td>
                  {compareProducts.map(p => (
                    <td key={p.id} className="p-4 sm:p-5">
                      {p.stock > 0 ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> In Stock ({p.stock})
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold">Out of Stock</span>
                      )}
                    </td>
                  ))}
                  {compareProducts.length < 3 && <td></td>}
                </tr>

                {/* Dynamic Spec Rows */}
                {allSpecKeys.map((key) => (
                  <tr key={key}>
                    <td className="p-4 sm:p-5 font-bold text-slate-400 bg-slate-950/40">{key}</td>
                    {compareProducts.map(p => (
                      <td key={p.id} className="p-4 sm:p-5 text-slate-300">
                        {p.specifications[key] || '—'}
                      </td>
                    ))}
                    {compareProducts.length < 3 && <td></td>}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Technical Comparison Analysis Section */}
          {analysis && (
            <div className="bg-[#0b0e24] text-white rounded-3xl p-6 sm:p-8 space-y-4 border border-cyan-500/30 shadow-xl">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Technical Comparison Verdict</span>
              </div>

              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line space-y-2">
                {analysis}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Product Selector Modal */}
      {selectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e24] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-black text-base text-white">
                Choose Product to Compare
              </h3>
              <button onClick={() => setSelectorOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {allProducts.map((p) => {
                const inList = compareProducts.some(cp => cp.id === p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!inList) {
                        addToCompare(p);
                        setSelectorOpen(false);
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                      inList 
                        ? 'bg-slate-950/60 border-slate-800/80 opacity-50 cursor-not-allowed' 
                        : 'hover:border-cyan-500/50 bg-slate-950 hover:bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800" />
                      <div className="truncate">
                        <p className="font-bold text-xs text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.brand} • {p.categoryName}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-heading font-bold text-xs text-cyan-300 block">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-bold text-cyan-400">
                        {inList ? 'Selected' : '+ Select'}
                      </span>
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
