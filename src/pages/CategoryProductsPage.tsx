import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  ChevronRight, 
  SlidersHorizontal, 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Headphones, 
  Monitor, 
  Keyboard, 
  Volume2, 
  Watch, 
  Camera, 
  Home, 
  Zap,
  Package,
  Layers
} from 'lucide-react';
import type { Product, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface CategoryProductsPageProps {
  categorySlug: string;
  navigate: (path: string) => void;
}

const categoryIcons: Record<string, string> = {
  all: '⚡',
  smartphones: '📱',
  laptops: '💻',
  'headphones-earbuds': '🎧',
  monitors: '🖥️',
  'keyboards-mouse': '⌨️',
  speakers: '🔊',
  smartwatches: '⌚',
  cameras: '📷',
  'smart-home': '🏠',
  accessories: '🔌'
};

export const CategoryProductsPage: React.FC<CategoryProductsPageProps> = ({ categorySlug, navigate }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Reset subcategory on slug change
  useEffect(() => {
    setActiveSubcategory('all');
  }, [categorySlug]);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        const catRes = await api.getCategories();
        const cats = catRes.categories || [];
        setAllCategories(cats);
        
        const found = cats.find(
          c => c.slug.toLowerCase() === categorySlug.toLowerCase() || c.id.toLowerCase() === categorySlug.toLowerCase()
        );
        setCategory(found || null);

        const prodRes = await api.getProducts({
          category: found ? found.id : categorySlug,
          subcategory: activeSubcategory !== 'all' ? activeSubcategory : undefined
        });
        setProducts(prodRes.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [categorySlug, activeSubcategory]);

  const currentCategoryName = category?.name || (categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 text-white">
      
      {/* Category Header Banner */}
      <div className="relative rounded-3xl bg-[#0b0e24] text-white p-6 sm:p-10 overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dedicated Category Catalog</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white flex items-center gap-3">
            <span>{categoryIcons[categorySlug] || '⚡'}</span>
            <span>{currentCategoryName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {category?.description || `Explore verified ${currentCategoryName} with live warehouse inventory, express dispatch, and genuine warranty.`}
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Category Navigation + Right Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Category Switcher */}
        <aside className="lg:col-span-3 bg-[#0b0e24] rounded-3xl border border-slate-800 p-5 space-y-6 shadow-xl sticky top-24">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Browse Electronics</span>
            </h3>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 text-slate-300 hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                <span>⚡</span>
                <span>All Electronics</span>
              </button>

              {allCategories.map((c) => {
                const isActive = c.slug === categorySlug || c.id === categorySlug;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => navigate(`/categories/${c.slug}`)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-xs'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span>{categoryIcons[c.slug] || '🔌'}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    {c.productCount !== undefined && (
                      <span className={`text-[10px] font-mono ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {c.productCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory Filter if available */}
          {category?.subcategories && category.subcategories.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Subcategories
              </h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveSubcategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeSubcategory === 'all'
                      ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  All {category.name}
                </button>
                {category.subcategories.map((sub, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSubcategory(sub)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      activeSubcategory === sub
                        ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Side: Product Catalog for this Category */}
        <main className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between bg-[#0b0e24] px-5 py-3.5 rounded-2xl border border-slate-800 text-xs">
            <span className="font-semibold text-slate-300">
              Showing <strong className="text-white">{products.length}</strong> items in <span className="text-cyan-400">{currentCategoryName}</span>
            </span>
            <button
              onClick={() => navigate('/products')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Electronics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-slate-900 rounded-2xl border border-slate-800"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 bg-[#0b0e24] rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-black text-white text-lg">No Products in {currentCategoryName}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No items currently match this category or subcategory filter. Products added in the Admin Console will appear here immediately.
              </p>
              {activeSubcategory !== 'all' && (
                <button
                  onClick={() => setActiveSubcategory('all')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Reset Subcategory Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} navigate={navigate} />
              ))}
            </div>
          )}
        </main>

      </div>

    </div>
  );
};
