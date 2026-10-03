import React, { useEffect, useState, useMemo } from 'react';
import { 
  Filter, 
  X, 
  Search, 
  RotateCcw, 
  ChevronDown, 
  SlidersHorizontal, 
  Check, 
  Star,
  AlertCircle,
  Package,
  Layers
} from 'lucide-react';
import type { Product, Category, ProductFilters } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductsPageProps {
  navigate: (path: string) => void;
  initialFilters?: ProductFilters;
}

const categoryIcons: Record<string, string> = {
  smartphones: '📱',
  laptops: '💻',
  'headphones-earbuds': '🎧',
  monitors: '🖥️',
  'keyboards-mouse': '⌨️',
  speakers: '🔊',
  smartwatches: '⌚',
  cameras: '📷',
  'smart-home': '🏠'
};

export const ProductsPage: React.FC<ProductsPageProps> = ({ navigate, initialFilters = {} }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.category || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialFilters.subcategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialFilters.brand || 'all');
  const [minPrice, setMinPrice] = useState<number | undefined>(initialFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialFilters.maxPrice);
  const [minRating, setMinRating] = useState<number | undefined>(initialFilters.minRating);
  const [inStockOnly, setInStockOnly] = useState<boolean>(initialFilters.inStockOnly || false);
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters.search || '');
  const [sortBy, setSortBy] = useState<ProductFilters['sortBy']>(initialFilters.sortBy || 'newest');

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch Categories
  useEffect(() => {
    api.getCategories()
      .then(res => setCategories(res.categories || []))
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProducts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
        brand: selectedBrand !== 'all' ? selectedBrand : undefined,
        minPrice,
        maxPrice,
        minRating,
        inStockOnly,
        search: searchQuery,
        sortBy
      });
      setProducts(res.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, selectedBrand, minPrice, maxPrice, minRating, inStockOnly, searchQuery, sortBy]);

  // Derive unique brands
  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    ['Apple', 'Samsung', 'Sony', 'Dell', 'ASUS', 'Bose', 'Logitech', 'Keychron', 'DJI', 'OnePlus'].forEach(b => brands.add(b));
    return Array.from(brands).sort();
  }, [products]);

  // Subcategories for current category
  const activeSubcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    const cat = categories.find(c => c.id === selectedCategory || c.slug === selectedCategory);
    return cat?.subcategories || [];
  }, [selectedCategory, categories]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedBrand('all');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('newest');
  };

  const hasActiveFilters = selectedCategory !== 'all' || 
    selectedSubcategory !== 'all' || 
    selectedBrand !== 'all' || 
    minPrice !== undefined || 
    maxPrice !== undefined || 
    minRating !== undefined || 
    inStockOnly || 
    searchQuery.trim() !== '';

  const activeCategoryObj = categories.find(c => c.id === selectedCategory || c.slug === selectedCategory);
  const currentCategoryTitle = activeCategoryObj ? activeCategoryObj.name : 'All Electronics';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-white">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <span>BUYGEN Official Catalog</span>
            <span>•</span>
            <span>Verified Inventory</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            {currentCategoryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Showing {products.length} electronics matching your selection.
          </p>
        </div>

        {/* Top Controls: Search & Sort */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Direct Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search specifications, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 rounded-xl border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-3.5 pr-8 py-2.5 bg-slate-900/90 rounded-xl border border-slate-700/80 text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-cyan-400 cursor-pointer appearance-none"
            >
              <option value="newest">Sort: Newest Releases</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2.5 bg-cyan-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Categories & Filters</span>
          </button>
        </div>
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <span className="font-semibold text-slate-400">Filters:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold rounded-lg">
              {currentCategoryTitle}
              <button onClick={() => setSelectedCategory('all')} className="hover:text-rose-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSubcategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold rounded-lg">
              {selectedSubcategory}
              <button onClick={() => setSelectedSubcategory('all')} className="hover:text-rose-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedBrand !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-lg">
              Brand: {selectedBrand}
              <button onClick={() => setSelectedBrand('all')} className="hover:text-rose-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minPrice !== undefined && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-lg">
              Min: ₹{minPrice.toLocaleString('en-IN')}
              <button onClick={() => setMinPrice(undefined)} className="hover:text-rose-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {maxPrice !== undefined && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-lg">
              Max: ₹{maxPrice.toLocaleString('en-IN')}
              <button onClick={() => setMaxPrice(undefined)} className="hover:text-rose-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minRating !== undefined && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold rounded-lg">
              {minRating}★+
              <button onClick={() => setMinRating(undefined)} className="hover:text-rose-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold rounded-lg">
              In Stock Only
              <button onClick={() => setInStockOnly(false)} className="hover:text-rose-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Grid + Dedicated Left Navigation Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Left Navigation Sidebar */}
        <aside className="hidden md:block col-span-1 bg-[#0b0e24] rounded-3xl border border-slate-800 p-5 space-y-6 sticky top-24 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-heading font-black text-sm text-white">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Navigation & Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* PRIMARY CATEGORY NAVIGATION */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center justify-between">
              <span>Categories</span>
              <span className="text-[10px] text-slate-500 lowercase font-normal">click to browse</span>
            </h4>
            
            <div className="space-y-1">
              {/* All Electronics option */}
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>All Electronics</span>
                </div>
                {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-slate-950" />}
              </button>

              {/* Dynamic Categories List */}
              {categories.map((c) => {
                const isSelected = selectedCategory === c.slug || selectedCategory === c.id;
                const icon = categoryIcons[c.slug] || '🔌';
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelectedCategory(c.slug); setSelectedSubcategory('all'); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 font-black border border-cyan-500/50 shadow-xs'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span>{icon}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                      {c.productCount ?? ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategories (if current category has them) */}
          {activeSubcategories.length > 0 && (
            <div className="pt-3 border-t border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Subcategories</h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedSubcategory === 'all' ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  All Subcategories
                </button>
                {activeSubcategories.map((sub, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selectedSubcategory === sub ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brands Filter */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">Brand</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedBrand('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedBrand === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                All Brands
              </button>
              {allBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    selectedBrand.toLowerCase() === b.toLowerCase() ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{b}</span>
                  {selectedBrand.toLowerCase() === b.toLowerCase() && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Price Range (₹)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice ?? ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded-md border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>

        </aside>

        {/* Product Results Grid */}
        <main className="col-span-1 md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#0c0f26] rounded-2xl border border-slate-800 p-4 space-y-4 animate-pulse">
                  <div className="w-full pt-[75%] bg-slate-800/80 rounded-xl"></div>
                  <div className="h-4 bg-slate-800 rounded-md w-3/4"></div>
                  <div className="h-4 bg-slate-800 rounded-md w-1/2"></div>
                  <div className="h-8 bg-slate-800 rounded-xl mt-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="font-heading font-bold text-white">Failed to load catalog</h3>
              <p className="text-xs text-rose-300">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 bg-[#0c0f26] border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="font-heading font-black text-white text-xl">
                No Products Found in {currentCategoryTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                No items match your selected filters. Try broadening your criteria or reset filters to view available inventory.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs rounded-xl hover:opacity-95 transition cursor-pointer shadow-md shadow-cyan-500/20"
              >
                View All Electronics
              </button>
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

      {/* Mobile Category & Filter Slideover */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setMobileFilterOpen(false)}></div>
          <div className="relative ml-auto w-full max-w-xs bg-[#0b0e24] border-l border-slate-800 h-full p-6 shadow-2xl overflow-y-auto space-y-6 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading font-black text-base text-white">Categories & Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <h4 className="text-xs font-extrabold uppercase text-cyan-400 mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('all'); setMobileFilterOpen(false); }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold ${
                    selectedCategory === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  ⚡ All Electronics
                </button>
                {categories.map((c) => {
                  const isSelected = selectedCategory === c.slug || selectedCategory === c.id;
                  const icon = categoryIcons[c.slug] || '🔌';
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelectedCategory(c.slug); setMobileFilterOpen(false); }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{c.productCount ?? ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Price */}
            <div className="pt-3 border-t border-slate-800">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 mb-2">Price Range (₹)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice ?? ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice ?? ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-2.5 text-xs font-bold border border-slate-700 hover:bg-slate-900 rounded-xl text-slate-300"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 text-xs font-black bg-cyan-500 text-slate-950 rounded-xl shadow-md"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
