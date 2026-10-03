import React, { useEffect, useState, useRef } from 'react';
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
  ChevronLeft,
  Percent,
  Plus,
  Copy,
  Check,
  ShoppingBag
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
  const [loading, setLoading] = useState(true);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 5-second Auto-Sliding Offer Carousel State
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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
      const activeOffers = (offerRes.offers || []).filter(o => o.active);
      setOffers(activeOffers);
    } catch (err) {
      console.error('Failed to load homepage data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-slide carousel every 5 seconds if multiple offers exist and carousel is not paused
  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [offers.length, isPaused, currentOfferIndex]);

  const handlePrevOffer = () => {
    if (offers.length <= 1) return;
    setCurrentOfferIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const handleNextOffer = () => {
    if (offers.length <= 1) return;
    setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      // Swiped Left -> Advance to next offer banner
      handleNextOffer();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Go to previous offer banner
      handlePrevOffer();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Filter products by selected category
  const displayedProducts = allProducts.filter(p => {
    if (selectedCategorySlug === 'all') return true;
    return (
      p.categoryId === selectedCategorySlug || 
      p.categoryName?.toLowerCase() === selectedCategorySlug.toLowerCase()
    );
  });

  const activeOffer = offers.length > 0 ? offers[currentOfferIndex] : null;

  return (
    <div className="space-y-8 pb-20">
      
      {/* 
        HERO SECTION: 
        When admin adds promotional offers, the existing placeholder is replaced 
        by this mobile-friendly, 5-second automatic sliding banner carousel!
      */}
      {offers.length > 0 && activeOffer ? (
        /* 1A. ACTIVE 5-SECOND AUTOMATIC CAROUSEL (Replaces placeholder when offers are enabled) */
        <section className="mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 relative">
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${activeOffer.bgGradient || 'from-indigo-950 via-purple-950 to-slate-950'} border-2 border-amber-500/40 shadow-2xl p-5 sm:p-8 md:p-10 text-white min-h-[270px] sm:min-h-[310px] flex flex-col justify-between transition-all duration-700 select-none`}
          >
            {/* 5-Second Timer Progress Bar Line */}
            {offers.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden rounded-t-3xl">
                <div 
                  key={`progress-${currentOfferIndex}-${isPaused}`}
                  className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 transition-all"
                  style={{
                    animation: isPaused ? 'none' : 'carouselProgress 5000ms linear'
                  }}
                />
              </div>
            )}

            {/* Ambient Backlight Orbs */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Banner Main Content */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 sm:space-y-4 max-w-2xl">
                
                {/* Badges & Promo Pill */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    <span>{activeOffer.badge || 'PROMOTIONAL OFFER'}</span>
                  </span>
                  
                  {activeOffer.discountPercentage && (
                    <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] sm:text-xs font-black rounded-lg">
                      UP TO {activeOffer.discountPercentage}% OFF
                    </span>
                  )}
                  
                  {activeOffer.promoCode && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(activeOffer.promoCode!)}
                      className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] sm:text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                      title="Click to copy promo code"
                    >
                      <span>CODE: {activeOffer.promoCode}</span>
                      {copiedCode === activeOffer.promoCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {isPaused && (
                    <span className="px-2 py-0.5 bg-slate-900/80 text-amber-300 text-[10px] font-mono rounded border border-amber-400/30 hidden sm:inline-block">
                      Paused
                    </span>
                  )}
                </div>

                {/* Big Offer Title (Responsive font sizes) */}
                <h1 className="font-heading font-black text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
                  {activeOffer.title}
                </h1>

                {/* Subtitle */}
                {activeOffer.subtitle && (
                  <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-medium max-w-xl">
                    {activeOffer.subtitle}
                  </p>
                )}
              </div>

              {/* Right Side: High-res Poster Photo & Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-4 shrink-0">
                {activeOffer.imageUrl && (
                  <div className="w-full sm:w-40 md:w-48 h-36 sm:h-40 md:h-48 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl bg-slate-900/80 group">
                    <img 
                      src={activeOffer.imageUrl} 
                      alt={activeOffer.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedCategorySlug('all')}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Shop Offers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => navigate('/admin/offers')}
                      className="px-3.5 py-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer"
                      title="Manage promotional banners in Admin"
                    >
                      Manage Offers
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Controls: Previous/Next Slide & Indicator Dots */}
            {offers.length > 1 && (
              <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pt-5 mt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevOffer}
                    className="p-2 bg-slate-950/70 hover:bg-slate-900 active:scale-95 border border-white/20 text-white rounded-xl transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Previous Offer (Swipe right on mobile)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextOffer}
                    className="p-2 bg-slate-950/70 hover:bg-slate-900 active:scale-95 border border-white/20 text-white rounded-xl transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Next Offer (Swipe left on mobile)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-slate-300 font-mono pl-1">
                    {currentOfferIndex + 1} of {offers.length} <span className="hidden sm:inline">(Auto-slides every 5s)</span>
                  </span>
                </div>

                {/* Pagination Dots with touch-friendly spacing */}
                <div className="flex items-center gap-1.5 py-1">
                  {offers.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentOfferIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        currentOfferIndex === idx 
                          ? 'w-7 bg-amber-400 shadow-xs shadow-amber-400/50' 
                          : 'w-2.5 bg-white/30 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      ) : (
        /* 1B. STORE HERO PLACEHOLDER (Displayed when admin has NOT added active offers) */
        <section className="mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 relative">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-10 text-white min-h-[260px] sm:min-h-[300px] flex flex-col justify-between">
            {/* Ambient Background Glows */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Official Electronics Store</span>
                  </span>
                  <span className="px-3 py-1 bg-slate-800/80 text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Verified 1-Year Warranty</span>
                  </span>
                </div>

                <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                  Next-Gen Shopping, <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Smarter Choices</span>
                </h1>

                <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-medium max-w-xl">
                  Discover high-performance smartphones, workstations, audio acoustics, and smart wearables with guaranteed authenticity and real-time tracking.
                </p>

                {/* Assurance Badges on Mobile & Desktop */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Express Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Warehouse Direct</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Genuine</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedCategorySlug('all')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-950" />
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/advisor')}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Tech Advisor</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin/offers')}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    title="Add promotional banners to activate the 5-second automatic carousel"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Promotional Offer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* 2. MAIN STORE LAYOUT: ATTRACTIVE LEFT CATEGORIES SIDEBAR + RIGHT PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: ALL CATEGORIES & ADMIN ADDED CATEGORIES LIST */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-24">
            
            <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
                  <Layers className="w-4 h-4" />
                  <span>All Categories</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {categories.length} Categories
                </span>
              </div>

              {/* Dynamic Category Items List */}
              <div className="space-y-1.5 text-xs font-bold">
                
                {/* 1. All Products */}
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

                {/* 2. Dynamic Categories added by Admin */}
                {categories.length === 0 ? (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center space-y-1 my-2">
                    <p className="text-[11px] font-bold text-slate-400">0 Categories in Database</p>
                    <p className="text-[10px] text-slate-500">
                      Categories added by store admin will dynamically list here.
                    </p>
                  </div>
                ) : (
                  categories.map((cat) => {
                    const isSelected = 
                      selectedCategorySlug === cat.id || 
                      selectedCategorySlug === cat.slug || 
                      selectedCategorySlug.toLowerCase() === cat.name.toLowerCase();
                    
                    const productCount = allProducts.filter(
                      p => p.categoryId === cat.id || p.categoryName?.toLowerCase() === cat.name.toLowerCase()
                    ).length;

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

                {/* 3. About Link */}
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

            {/* Quick Live Tracking CTA for customers */}
            <div className="bg-[#0b0e24] rounded-3xl border border-indigo-500/30 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Live Order Tracking</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Track your shipment journey from warehouse packaging to doorstep arrival in real time.
              </p>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="w-full py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Track My Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </aside>

          {/* RIGHT MAIN AREA: PRODUCTS DIRECTLY SHOWN (No redundant bottom search bar) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Clean Category Breadcrumb Header */}
            <div className="bg-[#0b0e24] rounded-2xl border border-slate-800 p-4 shadow-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-slate-400 font-medium">Viewing Category:</span>
                <span className="font-heading font-black text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/30 text-xs sm:text-sm">
                  {selectedCategorySlug === 'all' 
                    ? 'All Electronics' 
                    : (categories.find(c => c.id === selectedCategorySlug)?.name || selectedCategorySlug)}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-bold">
                <span className="text-white font-black">{displayedProducts.length}</span> verified {displayedProducts.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="p-16 text-center text-slate-400 text-xs bg-[#0b0e24] rounded-3xl border border-slate-800">
                Loading products catalog...
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="bg-[#0b0e24] rounded-3xl p-8 sm:p-14 border border-slate-800 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-black text-2xl text-white">
                  0 Products in This Category
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  When the store administrator adds products in the Admin Console, they will appear here instantly with full specs and ordering options.
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

      {/* About Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        navigate={navigate}
      />

    </div>
  );
};
