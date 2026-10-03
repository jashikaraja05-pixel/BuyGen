import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Check, SlidersHorizontal, AlertCircle, Zap } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCompare } from '../context/CompareContext.tsx';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isComparing, addToCompare, removeFromCompare } = useCompare();

  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isWishlisted = isInWishlist(product.id);
  const comparing = isComparing(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    try {
      setAdding(true);
      await addToCart(product.id, 1);
    } catch {
      // Toast handles feedback
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      navigate('/checkout');
    } catch {
      // Toast handles feedback
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setWishlistLoading(true);
      await toggleWishlist(product.id);
    } catch {
      // Handled
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (comparing) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group relative bg-[#0c0f26] rounded-2xl border border-slate-800/90 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer text-white"
    >
      {/* Badges & Actions */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {product.badge && (
            <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md bg-slate-950/90 text-cyan-300 border border-cyan-500/40 shadow-xs">
              {product.badge}
            </span>
          )}
          {product.discount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
              {product.discount}% OFF
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Compare button */}
          <button
            onClick={handleToggleCompare}
            title={comparing ? 'Remove from comparison' : 'Compare product'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition backdrop-blur-md shadow-xs ${
              comparing 
                ? 'bg-cyan-500 text-slate-950' 
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Wishlist button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition backdrop-blur-md shadow-xs ${
              isWishlisted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative pt-[75%] bg-slate-950 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-400/80 uppercase tracking-wider mb-1.5">
            <span>{product.brand}</span>
            <span className="text-slate-500">{product.subcategory || product.categoryName}</span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-semibold text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-cyan-400 transition">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-500">({product.reviewCount})</span>
          </div>

          {/* Available Colours */}
          {((product.colors && product.colors.length > 0) || (product.availableColours && product.availableColours.length > 0)) && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center -space-x-1">
                {(product.colors || product.availableColours || []).slice(0, 3).map((col, idx) => (
                  <span
                    key={idx}
                    title={col}
                    className="w-3 h-3 rounded-full border border-slate-900 ring-1 ring-slate-700/50"
                    style={{
                      backgroundColor:
                        col.toLowerCase().includes('black') ? '#0f172a' :
                        col.toLowerCase().includes('white') ? '#f1f5f9' :
                        col.toLowerCase().includes('blue') ? '#38bdf8' :
                        col.toLowerCase().includes('gray') || col.toLowerCase().includes('grey') || col.toLowerCase().includes('titanium') || col.toLowerCase().includes('silver') ? '#94a3b8' :
                        col.toLowerCase().includes('gold') ? '#facc15' :
                        col.toLowerCase().includes('green') ? '#4ade80' :
                        col.toLowerCase().includes('red') ? '#f87171' :
                        col.toLowerCase().includes('purple') ? '#c084fc' : '#64748b'
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {(product.colors || product.availableColours || []).length} {((product.colors || product.availableColours || []).length === 1) ? 'colour' : 'colours'}
              </span>
            </div>
          )}
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-white font-heading">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-500 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Stock status indicator */}
          <div className="flex items-center justify-between text-[11px] font-medium mt-2">
            {isOutOfStock ? (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Out of stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-400 font-semibold">
                Only {product.stock} left!
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> In Stock ({product.stock})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {/* Quick Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 active:scale-95'
              }`}
              title="Add to Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{adding ? '...' : 'Add Cart'}</span>
            </button>

            {/* Quick Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || adding}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white shadow-cyan-500/20 active:scale-95'
              }`}
              title="Instant Buy / Checkout"
            >
              <span>⚡ Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
