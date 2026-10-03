import React, { useEffect, useState } from 'react';
import { Cpu, ChevronRight, SlidersHorizontal, Sparkles, Smartphone, Laptop, Headphones, Monitor, Keyboard, Volume2, Watch, Camera, Home, Zap } from 'lucide-react';
import type { Product, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface CategoryProductsPageProps {
  categorySlug: string;
  navigate: (path: string) => void;
}

export const CategoryProductsPage: React.FC<CategoryProductsPageProps> = ({ categorySlug, navigate }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const quickCategories = [
    { name: 'All Electronics', slug: 'all', icon: '⚡' },
    { name: 'Smartphones', slug: 'smartphones', icon: '📱' },
    { name: 'Laptops', slug: 'laptops', icon: '💻' },
    { name: 'Headphones', slug: 'headphones-earbuds', icon: '🎧' },
    { name: 'Monitors', slug: 'monitors', icon: '🖥️' },
    { name: 'Keyboards & Mouse', slug: 'keyboards-mouse', icon: '⌨️' },
    { name: 'Speakers', slug: 'speakers', icon: '🔊' },
    { name: 'Smartwatches', slug: 'smartwatches', icon: '⌚' },
    { name: 'Cameras', slug: 'cameras', icon: '📷' },
    { name: 'Smart Home', slug: 'smart-home', icon: '🏠' },
    { name: 'Accessories', slug: 'accessories', icon: '🔌' }
  ];

  // Reset subcategory on slug change
  useEffect(() => {
    setActiveSubcategory('all');
  }, [categorySlug]);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        const catRes = await api.getCategories();
        setAllCategories(catRes.categories || []);
        
        const found = catRes.categories.find(
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Quick Category Bar Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {quickCategories.map((qc) => {
          const isActive = qc.slug === 'all' 
            ? false 
            : qc.slug === categorySlug;
          return (
            <button
              key={qc.slug}
              onClick={() => {
                if (qc.slug === 'all') {
                  navigate('/products');
                } else {
                  navigate(`/categories/${qc.slug}`);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700'
              }`}
            >
              <span>{qc.icon}</span>
              <span>{qc.name}</span>
            </button>
          );
        })}
      </div>

      {/* Category Header Banner */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 sm:p-10 overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-cyan-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Category Catalog</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            {category?.name || (categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1))}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {category?.description || 'Browse professional consumer gadgets, flagship releases, and accessories.'}
          </p>
        </div>
      </div>

      {/* Subcategories Filter Pills */}
      {category?.subcategories && category.subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Subcategory:</span>
          <button
            onClick={() => setActiveSubcategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeSubcategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All {category.name}
          </button>
          {category.subcategories.map((sub, i) => (
            <button
              key={i}
              onClick={() => setActiveSubcategory(sub)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeSubcategory === sub
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Product List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {products.length} Products in {category?.name || 'Electronics'}
          </span>
          <button
            onClick={() => navigate('/products')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>⚡ View All Electronics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
            <h3 className="font-heading font-bold text-slate-900 text-base">No items found</h3>
            <p className="text-xs text-slate-500">There are no products currently matching this filter.</p>
            <button
              onClick={() => setActiveSubcategory('all')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
