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
  Sparkles,
  AlertCircle
} from 'lucide-react';
import type { Product, Category, ProductFilters } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductsPageProps {
  navigate: (path: string) => void;
  initialFilters?: ProductFilters;
}

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

  // Fetch Categories once
  useEffect(() => {
    api.getCategories()
      .then(res => setCategories(res.categories || []))
      .catch(err => console.error(err));
  }, []);

  // Fetch Products whenever filters change
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
    products.forEach(p => brands.add(p.brand));
    // Also add defaults
    ['Apple', 'Samsung', 'Sony', 'Dell', 'ASUS', 'Bose', 'Logitech', 'Keychron', 'DJI', 'Anker', 'Philips Hue', 'OnePlus'].forEach(b => brands.add(b));
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Marketplace Catalog</span>
            <span>•</span>
            <span>Consumer Electronics</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900">
            {selectedCategory !== 'all' 
              ? categories.find(c => c.id === selectedCategory || c.slug === selectedCategory)?.name || 'Electronics'
              : 'All Electronics'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {products.length} verified products with real-time stock and specifications.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search specs, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-3 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer appearance-none"
            >
              <option value="newest">Sort: Newest Releases</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Horizontal Category Switcher Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
        <button
          onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
          }`}
        >
          <span>⚡ All Electronics</span>
        </button>
        {categories.map((c) => {
          const isSelected = selectedCategory === c.slug || selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => { setSelectedCategory(c.slug); setSelectedSubcategory('all'); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
              }`}
            >
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="font-semibold text-slate-500">Active Filters:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-indigo-700 font-semibold rounded-lg">
              Category: {categories.find(c => c.id === selectedCategory || c.slug === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {selectedSubcategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-indigo-700 font-semibold rounded-lg">
              Subcategory: {selectedSubcategory}
              <button onClick={() => setSelectedSubcategory('all')}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {selectedBrand !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-indigo-700 font-semibold rounded-lg">
              Brand: {selectedBrand}
              <button onClick={() => setSelectedBrand('all')}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {minPrice !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-indigo-700 font-semibold rounded-lg">
              Min: ₹{minPrice.toLocaleString('en-IN')}
              <button onClick={() => setMinPrice(undefined)}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {maxPrice !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-indigo-700 font-semibold rounded-lg">
              Max: ₹{maxPrice.toLocaleString('en-IN')}
              <button onClick={() => setMaxPrice(undefined)}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {minRating !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-indigo-700 font-semibold rounded-lg">
              Rating: {minRating}★+
              <button onClick={() => setMinRating(undefined)}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-emerald-700 font-semibold rounded-lg">
              In Stock Only
              <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        </div>
      )}

      {/* Main Grid + Filter Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block col-span-1 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 sticky top-28 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-heading font-bold text-sm text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filter Catalog</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Category</h4>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              <button
                onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                  selectedCategory === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategory(c.slug); setSelectedSubcategory('all'); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    selectedCategory === c.slug || selectedCategory === c.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] text-slate-400">({c.productCount || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories (if selected) */}
          {activeSubcategories.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Subcategory</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedSubcategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedSubcategory === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Subcategories
                </button>
                {activeSubcategories.map((sub, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selectedSubcategory === sub ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Brand</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedBrand('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedBrand === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Brands
              </button>
              {allBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    selectedBrand.toLowerCase() === b.toLowerCase() ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{b}</span>
                  {selectedBrand.toLowerCase() === b.toLowerCase() && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Price Range (₹)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice ?? ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            {/* Quick Price Buttons */}
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <button
                onClick={() => { setMinPrice(undefined); setMaxPrice(30000); }}
                className="p-1.5 text-[11px] bg-slate-50 hover:bg-indigo-50 text-slate-700 rounded-md text-center"
              >
                Under ₹30K
              </button>
              <button
                onClick={() => { setMinPrice(30000); setMaxPrice(70000); }}
                className="p-1.5 text-[11px] bg-slate-50 hover:bg-indigo-50 text-slate-700 rounded-md text-center"
              >
                ₹30K - ₹70K
              </button>
              <button
                onClick={() => { setMinPrice(70000); setMaxPrice(150000); }}
                className="p-1.5 text-[11px] bg-slate-50 hover:bg-indigo-50 text-slate-700 rounded-md text-center"
              >
                ₹70K - ₹1.5L
              </button>
              <button
                onClick={() => { setMinPrice(150000); setMaxPrice(undefined); }}
                className="p-1.5 text-[11px] bg-slate-50 hover:bg-indigo-50 text-slate-700 rounded-md text-center"
              >
                Above ₹1.5L
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Customer Rating</h4>
            <div className="space-y-1 text-xs">
              {[4.8, 4.5, 4.0].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinRating(minRating === star ? undefined : star)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition ${
                    minRating === star ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{star} Stars & Above</span>
                  </div>
                  {minRating === star && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>

          {/* AI Advisor Promotion */}
          <div className="p-3.5 rounded-xl bg-gradient-to-tr from-indigo-900 to-slate-900 text-white">
            <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Need Buying Advice?</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Use BUYGEN AI Tech Advisor to compare specs and choose the best device.
            </p>
            <button
              onClick={() => navigate('/advisor')}
              className="mt-2.5 w-full py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Ask Tech Advisor
            </button>
          </div>

        </aside>

        {/* Product Results */}
        <main className="col-span-1 md:col-span-3">
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4 animate-pulse">
                  <div className="w-full pt-[75%] bg-slate-200 rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                  <div className="h-8 bg-slate-200 rounded-xl mt-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="font-heading font-bold text-rose-900">Failed to load catalog</h3>
              <p className="text-xs text-rose-700">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200/80 rounded-2xl text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-lg">No Products Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                We couldn't find any electronics matching your selected filters. Try broadening your criteria or resetting filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition cursor-pointer"
              >
                Reset All Filters
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

      {/* Mobile Filter Slideover Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setMobileFilterOpen(false)}></div>
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category selection */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory('all'); setMobileFilterOpen(false); }}
                  className={`w-full text-left p-2 rounded-lg text-xs ${selectedCategory === 'all' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'}`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCategory(c.slug); setMobileFilterOpen(false); }}
                    className={`w-full text-left p-2 rounded-lg text-xs ${selectedCategory === c.slug ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price inputs */}
            <div className="pt-2 border-t">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Price Range (₹)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice ?? ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="p-2 border rounded-lg text-xs"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice ?? ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="p-2 border rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl"
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
