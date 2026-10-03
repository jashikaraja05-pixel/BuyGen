import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Cpu, 
  Zap, 
  Tag, 
  Package,
  Layers,
  Info,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  ChevronRight,
  Flame,
  Percent,
  Plus
} from 'lucide-react';
import type { Product, Category, OfferBanner } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { AboutModal } from '../components/AboutModal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { user, isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<OfferBanner[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes, offerRes] = await Promise.all([
        api.getCategories().catch(() => ({ categories: [] })),
        api.getProducts().catch(() => ({ products: [] })),
        api.getOffers().catch(() => ({ offers: [] }))
      ]);

      setCategories(catRes.categories || []);
      setAllProducts(prodRes.products || []);
      setOffers(offerRes.offers || []);
    } catch (err) {
      console.error('Failed to load homepage data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products by selected category and search query
  const displayedProducts = allProducts.filter(p => {
    const matchesCategory = 
      selectedCategorySlug === 'all' || 
      p.categoryId === selectedCategorySlug || 
      p.categoryName?.toLowerCase() === selectedCategorySlug.toLowerCase();

    const matchesSearch = 
      !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const activeOffer = offers.length > 0 ? offers[0] : null;

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. TOP OFFERS DISPLAY BANNER (Shown prominently when added by Admin) */}
      {activeOffer ? (
        <section className="mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-2 border-amber-500/40 shadow-2xl p-6 sm:p-10 text-white">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    <span>{activeOffer.badge || 'OFFERS'}</span>
                  </span>
                  {activeOffer.discountPercentage && (
                    <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-lg">
                      UP TO {activeOffer.discountPercentage}% OFF
                    </span>
                  )}
                  {activeOffer.promoCode && (
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold rounded-lg">
                      CODE: {activeOffer.promoCode}
                    </span>
                  )}
                </div>

                <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                  {activeOffer.title}
                </h1>

                {activeOffer.subtitle && (
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                    {activeOffer.subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedCategorySlug('all')}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <span>Explore Offers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-xs text-amber-300/80 hover:text-amber-200 font-bold underline cursor-pointer"
                  >
                    Manage Offers in Admin Console
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Clean Header when no offer banner is active */
        <section className="mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#0d1230] to-slate-950 border border-slate-800 shadow-xl p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BUYGEN Official Consumer Electronics Marketplace</span>
                </div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  Authentic Electronics Catalog
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Browse live warehouse-tracked electronics. Only verified products added by store administrators appear in this catalog.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Promotional Offer Banner</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. MAIN LAYOUT: LEFT SIDEBAR NAVIGATION + RIGHT SCROLLABLE PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: CATEGORIES, ALL, AND ABOUT NAVIGATION */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-24">
            
            <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
                  <Layers className="w-4 h-4" />
                  <span>Navigation</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {categories.length} Categories
                </span>
              </div>

              {/* Navigation Items List */}
              <div className="space-y-1.5 text-xs font-bold">
                
                {/* 1. All Products (Scrollable) */}
                <button
                  type="button"
                  onClick={() => setSelectedCategorySlug('all')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between cursor-pointer ${
                    selectedCategorySlug === 'all'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4" />
                    <span>All Products</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    selectedCategorySlug === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {allProducts.length}
                  </span>
                </button>

                {/* 2. Admin Added Categories (ONLY what admin adds, 0 if unadded) */}
                {categories.length === 0 ? (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center space-y-1 my-2">
                    <p className="text-[11px] font-bold text-slate-400">0 Categories in Database</p>
                    <p className="text-[10px] text-slate-400">
                      Categories added by store admin will dynamically list here.
                    </p>
                  </div>
                ) : (
                  categories.map((cat) => {
                    const isSelected = selectedCategorySlug === cat.id || selectedCategorySlug === cat.slug || selectedCategorySlug.toLowerCase() === cat.name.toLowerCase();
                    const productCount = allProducts.filter(p => p.categoryId === cat.id || p.categoryName?.toLowerCase() === cat.name.toLowerCase()).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategorySlug(cat.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                            : 'text-slate-300 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono shrink-0 ml-1">
                          {productCount}
                        </span>
                      </button>
                    );
                  })
                )}

                {/* 3. About Navigation Link (Opens About modal with 4 cards) */}
                <div className="pt-2 border-t border-slate-800/80 mt-2">
                  <button
                    type="button"
                    onClick={() => setAboutModalOpen(true)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-cyan-300 hover:text-white hover:bg-cyan-500/10 border border-cyan-500/30 transition flex items-center justify-between cursor-pointer font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <Info className="w-4 h-4 text-cyan-400" />
                      <span>About BUYGEN</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>

              </div>
            </div>

            {/* User Session Quick Card */}
            {!user && (
              <div className="bg-[#0b0e24] rounded-3xl border border-indigo-500/30 p-5 shadow-xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                  Customer Sign In
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sign in or register to place electronics orders, save your wishlist, and enjoy instant checkout.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer text-center"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}

          </aside>

          {/* RIGHT MAIN AREA: SEARCH & SCROLLABLE PRODUCTS GRID */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Search & Active Filter Bar */}
            <div className="bg-[#0b0e24] rounded-2xl border border-slate-800 p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products by model, brand, processor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Viewing:</span>
                <span className="font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {selectedCategorySlug === 'all' 
                    ? 'All Products' 
                    : (categories.find(c => c.id === selectedCategorySlug)?.name || selectedCategorySlug)}
                </span>
                <span className="text-slate-400">({displayedProducts.length} items)</span>
              </div>
            </div>

            {/* Scrollable Products Grid */}
            {loading ? (
              <div className="p-16 text-center text-slate-400 text-xs">
                Loading products catalog...
              </div>
            ) : displayedProducts.length === 0 ? (
              /* CLEAN ZERO MOCK DATA STATE */
              <div className="bg-[#0b0e24] rounded-3xl p-8 sm:p-14 border border-slate-800 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-black text-2xl text-white">
                  {searchQuery ? 'No Products Found' : '0 Products in Catalog'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  {searchQuery 
                    ? `No products match your search query "${searchQuery}".`
                    : 'Zero mock products are loaded in the database. When the store administrator adds authentic products in the Admin Console, they will appear here instantly.'}
                </p>
                {isAdmin && (
                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/admin')}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
                    >
                      Open Admin Console & Add Product
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} navigate={navigate} />
                ))}
              </div>
            )}

          </main>

        </div>
      </section>

      {/* About Modal (Contains the 4 assurance cards: Express Dispatch, Genuine Warranty, 7-Day Replacement, Smart Tech Advisor) */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        navigate={navigate}
      />

    </div>
  );
};
