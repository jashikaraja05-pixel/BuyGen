import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Cpu, 
  Zap, 
  Flame, 
  Tag, 
  ChevronRight,
  SlidersHorizontal,
  Star
} from 'lucide-react';
import { Product, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick prompt chips for AI Advisor
  const promptChips = [
    'Laptop under ₹70,000 with 16GB RAM for programming',
    'Best ANC headphones under ₹30,000 for travel',
    'Smartphone with 200MP camera and long battery',
    '240Hz OLED gaming monitor for esports',
    'Mechanical keyboard with tactile switches'
  ];

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.getCategories(),
          api.getProducts()
        ]);

        setCategories(catRes.categories || []);

        const all = prodRes.products || [];
        setFeaturedProducts(all.filter(p => p.featured).slice(0, 4));
        setTrendingProducts(all.filter(p => p.trending).slice(0, 4));
        setNewArrivals(all.filter(p => p.newArrival).slice(0, 4));
        setDealProducts(all.filter(p => p.discount >= 10).slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 border border-slate-800 shadow-2xl">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Next-Gen Shopping, Smarter Choices</span>
            </div>

            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1]">
              Elevate Your Setup with <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">Pro Consumer Tech.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
              Explore flagships, gaming laptops, audiophile sound, and 4K displays. Powered by our interactive <strong className="text-white">BUYGEN AI Smart Tech Advisor</strong> to match your exact performance and budget requirements.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/products')}
                className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>⚡ All Electronics</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/categories/smartphones')}
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 font-bold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>📱 Smartphones</span>
              </button>

              <button
                onClick={() => navigate('/advisor')}
                className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Advisor</span>
              </button>
            </div>

            {/* Micro assurance */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Genuine Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Express Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Simulated Checkout</span>
              </div>
            </div>
          </div>

          {/* Hero Gadget Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/80 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Featured Innovation
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden bg-slate-800/90 aspect-video mb-4 relative">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop"
                  alt="MacBook Pro M3 Max"
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-heading font-bold text-lg text-white">
                Apple MacBook Pro 16" M3 Max
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                14-core CPU, 30-core GPU, 36GB Unified RAM, Liquid Retina XDR 120Hz display.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Special Price</span>
                  <p className="font-heading font-extrabold text-xl text-white">₹3,49,900</p>
                </div>
                <button
                  onClick={() => navigate('/products/prod-lp-1')}
                  className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Interactive AI Tech Advisor Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 border border-indigo-800/60 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>BUYGEN Smart Tech Advisor</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                Find the Perfect Tech in Plain English.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Tell us your budget, use case, or desired specifications. Our AI extracts requirements and matches directly against real in-stock products in our database.
              </p>
            </div>

            <button
              onClick={() => navigate('/advisor')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <span>Launch Tech Advisor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="relative z-10 mt-6 pt-6 border-t border-indigo-800/50">
            <p className="text-xs text-slate-400 font-medium mb-3">Try asking the advisor:</p>
            <div className="flex flex-wrap gap-2">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/advisor?q=${encodeURIComponent(chip)}`)}
                  className="px-3 py-1.5 rounded-full text-xs bg-slate-800/80 hover:bg-indigo-900/60 border border-indigo-700/60 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>"{chip}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Browse Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Top-tier consumer electronics curated across 10 specialized categories.
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/categories/${cat.slug}`)}
              className="group p-5 bg-[#0c0f26] rounded-2xl border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-400 group-hover:bg-gradient-to-tr group-hover:from-cyan-500 group-hover:to-indigo-600 group-hover:text-white transition flex items-center justify-center font-bold text-lg mb-3">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-white group-hover:text-cyan-400 transition text-sm">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>{cat.productCount || 0} Products</span>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                  Featured Products
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Hand-picked flagship gadgets with verified stock.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>See More</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Trending Electronics */}
      {trendingProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                  Trending Right Now
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Most viewed and purchased consumer gadgets this week.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/products?sortBy=popularity')}
              className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>See More</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Special Discounts & Deals */}
      {dealProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                  Exclusive Deals & Discounts
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Save up to 18% on high-performance gaming gear and accessories.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>All Deals</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealProducts.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* 7. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
                  New Arrivals
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Fresh releases hot off the manufacturer line.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/products?sortBy=newest')}
              className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>See All New</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
