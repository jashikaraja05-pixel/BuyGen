import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  AlertCircle, 
  Share2, 
  SlidersHorizontal,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  MessageSquare,
  BadgeCheck,
  CheckCircle2,
  PackageCheck,
  Lock,
  ThumbsUp,
  Zap
} from 'lucide-react';
import type { Product, Review } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCompare } from '../context/CompareContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductDetailsPageProps {
  productId: string;
  navigate: (path: string) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ productId, navigate }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isComparing, addToCompare, removeFromCompare } = useCompare();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review submission and verified purchase state
  const [verifiedPurchaseData, setVerifiedPurchaseData] = useState<{
    hasPurchased: boolean;
    orders: {
      orderId: string;
      orderDate: string;
      status: string;
      quantity: number;
      selectedColor?: string;
      price: number;
      alreadyReviewed: boolean;
      existingReview?: Review | null;
    }[];
  } | null>(null);
  const [loadingPurchaseCheck, setLoadingPurchaseCheck] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Actions loading
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getProductById(productId);
        setProduct(data.product);
        setReviews(data.reviews || []);
        setRelated(data.related || []);
        setSelectedImage(data.product.images[0] || '');
        setQuantity(1);
        const availableCols = data.product.colors || data.product.availableColours || [];
        if (availableCols.length > 0) {
          setSelectedColor(availableCols[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Check verified purchase eligibility when user is logged in
  useEffect(() => {
    if (!user || !productId) {
      setVerifiedPurchaseData(null);
      return;
    }

    const checkEligibility = async () => {
      try {
        setLoadingPurchaseCheck(true);
        const res = await api.getVerifiedPurchaseOrders(productId);
        setVerifiedPurchaseData(res);
        if (res.orders && res.orders.length > 0) {
          const firstEligible = res.orders[0];
          setSelectedOrderId(firstEligible.orderId);
          if (firstEligible.existingReview) {
            setUserRating(firstEligible.existingReview.rating);
            setUserComment(firstEligible.existingReview.comment);
          }
        }
      } catch (err) {
        console.error('Failed to verify purchase status:', err);
      } finally {
        setLoadingPurchaseCheck(false);
      }
    };

    checkEligibility();
  }, [user, productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-cyan-300">Loading product specs & inventory...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 text-white">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-white">Product Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'The requested product is not available in our catalog.'}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
        >
          Browse All Electronics
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isWishlisted = isInWishlist(product.id);
  const comparing = isComparing(product.id);
  const productColors = product.colors || product.availableColours || [];

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity, selectedColor || undefined);
    } catch {
      // toast shown
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity, selectedColor || undefined);
      navigate('/checkout');
    } catch {
      // Handled
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    try {
      setWishlistLoading(true);
      await toggleWishlist(product.id);
    } catch {
      // Handled
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleToggleCompare = () => {
    if (comparing) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    const match = verifiedPurchaseData?.orders.find(o => o.orderId === orderId);
    if (match?.existingReview) {
      setUserRating(match.existingReview.rating);
      setUserComment(match.existingReview.comment);
    } else {
      setUserRating(5);
      setUserComment('');
    }
    setReviewSuccess(null);
    setReviewError(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewError('You must be signed in to post a verified review.');
      return;
    }
    if (!selectedOrderId) {
      setReviewError('A verified purchase Order ID is required. Reviews can only be submitted for items you have bought.');
      return;
    }
    if (!userComment.trim()) {
      setReviewError('Please write your review comment before submitting.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);
      setReviewSuccess(null);
      const res = await api.addReview(product.id, userRating, userComment.trim(), selectedOrderId);
      
      const newReview = res.review;
      setReviews(prev => [newReview, ...prev.filter(r => r.orderId !== selectedOrderId)]);
      setReviewSuccess('Your verified purchase review has been published!');
      
      setVerifiedPurchaseData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          orders: prev.orders.map(o => o.orderId === selectedOrderId ? {
            ...o,
            alreadyReviewed: true,
            existingReview: newReview
          } : o)
        };
      });

      if (res.product) {
        setProduct(res.product);
      }
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-white">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition cursor-pointer">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button onClick={() => navigate('/products')} className="hover:text-cyan-400 transition cursor-pointer">Products</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button 
          onClick={() => navigate(`/categories/${product.categoryId}`)} 
          className="hover:text-cyan-400 transition cursor-pointer"
        >
          {product.categoryName}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-200 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl bg-[#0b0e24] overflow-hidden border border-slate-800 aspect-square group shadow-2xl">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                <span className="px-4 py-2 bg-rose-600 text-white text-sm font-black uppercase tracking-wider rounded-xl shadow-lg">
                  Currently Out of Stock
                </span>
              </div>
            )}
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-black uppercase rounded-lg bg-slate-950/90 text-cyan-300 border border-cyan-500/30 shadow-md">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                    selectedImage === img ? 'border-cyan-400 shadow-md ring-2 ring-cyan-500/20' : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Purchase Form */}
        <div className="lg:col-span-6 bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">{product.brand}</span>
              <span>{product.subcategory || product.categoryName}</span>
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating & Review Counter */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {product.reviewCount} customer ratings
              </span>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Buyer Reviewed</span>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-black text-3xl sm:text-4xl text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-500 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Inclusive of all taxes & GST • Direct Dispatch</p>
            </div>

            {product.discount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-sm shadow-xs">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Stock Availability */}
          <div className="flex items-center justify-between text-xs sm:text-sm py-2 border-y border-slate-800">
            <span className="font-semibold text-slate-400">Availability:</span>
            {isOutOfStock ? (
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Out of stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-300 font-black flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Only {product.stock} units left in stock!
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> In Stock ({product.stock} units ready to dispatch)
              </span>
            )}
          </div>

          {/* Available Colours Selector */}
          {productColors.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Available Colours
                </span>
                {selectedColor && (
                  <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                    Selected: {selectedColor}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {productColors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-md ring-2 ring-cyan-400 border border-cyan-500/50'
                          : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0"
                        style={{
                          backgroundColor:
                            color.toLowerCase().includes('black') ? '#0f172a' :
                            color.toLowerCase().includes('white') ? '#f8fafc' :
                            color.toLowerCase().includes('blue') ? '#3b82f6' :
                            color.toLowerCase().includes('gray') || color.toLowerCase().includes('grey') || color.toLowerCase().includes('titanium') || color.toLowerCase().includes('silver') ? '#64748b' :
                            color.toLowerCase().includes('gold') ? '#eab308' :
                            color.toLowerCase().includes('green') ? '#22c55e' :
                            color.toLowerCase().includes('red') ? '#ef4444' :
                            color.toLowerCase().includes('purple') ? '#a855f7' : '#94a3b8'
                        }}
                      />
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Purchase Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
              <div className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-950">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-black text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2.5 text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-slate-400">
                (Available: {product.stock})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 active:scale-95'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock || addingToCart}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black shadow-cyan-500/25 active:scale-95'
                }`}
              >
                <span>⚡ Buy Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Wishlist & Compare toggles */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleCompare}
                className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  comparing
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{comparing ? 'In Compare List' : 'Compare Specs'}</span>
              </button>
            </div>
          </div>

          {/* Micro assurances */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Free Express Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              <span>7-Day Replacement</span>
            </div>
          </div>

        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-slate-800">
        
        {/* Description */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-heading font-bold text-xl text-white">
            Product Overview
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line">
            {product.description}
          </p>

          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>BUYGEN Quality Certified</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Every unit is serialized, batch verified, and shipped in tamper-evident packaging with live order tracking.
            </p>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-heading font-bold text-xl text-white">
            Technical Specifications
          </h2>
          <div className="bg-[#0b0e24] rounded-2xl border border-slate-800 overflow-hidden shadow-xl divide-y divide-slate-800/80">
            {Object.entries(product.specifications || {}).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 px-5 py-3.5 text-xs sm:text-sm">
                <span className="font-semibold text-slate-400">{key}</span>
                <span className="col-span-2 text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Reviews Section */}
      <div className="pt-8 border-t border-slate-800 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Order-Verified Reviews</span>
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Customer Reviews & Ratings ({reviews.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Authentic customer feedback linked directly to verified purchases and order IDs.
            </p>
          </div>

          {/* Rating Summary Score Card */}
          <div className="flex items-center gap-4 bg-[#0b0e24] p-4 rounded-2xl border border-slate-800">
            <div className="text-center">
              <span className="font-heading font-black text-3xl text-white leading-none">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">out of 5</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 font-semibold block">
                Based on {reviews.length} verified buyer ratings
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Verified Purchase Feedback Form / Verification Status */}
          <div className="lg:col-span-5 bg-[#0b0e24] rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5 shadow-xl">
            
            {!user ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-black text-lg text-white">
                    Sign In to Leave Feedback
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    To maintain strict integrity, reviews are verified against actual customer orders. Sign in to your account to review purchased products.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Sign In to Your Account
                </button>
              </div>
            ) : loadingPurchaseCheck ? (
              <div className="py-12 text-center text-xs text-slate-400 animate-pulse space-y-2">
                <PackageCheck className="w-6 h-6 text-slate-500 mx-auto animate-bounce" />
                <p>Verifying customer order history for this item...</p>
              </div>
            ) : !verifiedPurchaseData?.hasPurchased ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider inline-block">
                    Verified Purchases Only
                  </span>
                  <h3 className="font-heading font-black text-lg text-white">
                    Order Verification Required
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    You haven’t ordered this product yet on your account ({user.email}). Only customers with confirmed purchase order IDs can submit ratings and feedback.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Order This Item to Review It
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-heading font-black text-base text-white">
                      Verified Buyer Feedback
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md uppercase border border-emerald-500/40">
                    Order Verified
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Thank you for shopping with BUYGEN! Select your order ID below to record your verified feedback.
                </p>

                {reviewSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium">{reviewSuccess}</span>
                  </div>
                )}

                {reviewError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-medium">{reviewError}</span>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Order ID Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Linked Purchase Order ID *</span>
                      <span className="text-[10px] text-emerald-400 font-semibold lowercase">
                        {verifiedPurchaseData.orders.length} eligible purchase{verifiedPurchaseData.orders.length > 1 ? 's' : ''}
                      </span>
                    </label>

                    {verifiedPurchaseData.orders.length === 1 ? (
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <PackageCheck className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-mono font-bold text-cyan-300">
                              Order #{verifiedPurchaseData.orders[0].orderId}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              Purchased on {new Date(verifiedPurchaseData.orders[0].orderDate).toLocaleDateString()}
                              {verifiedPurchaseData.orders[0].selectedColor ? ` • ${verifiedPurchaseData.orders[0].selectedColor}` : ''}
                            </span>
                          </div>
                        </div>
                        {verifiedPurchaseData.orders[0].alreadyReviewed ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Editing Feedback
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Ready to Review
                          </span>
                        )}
                      </div>
                    ) : (
                      <select
                        value={selectedOrderId}
                        onChange={(e) => handleOrderSelect(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-hidden focus:border-cyan-400 cursor-pointer"
                      >
                        {verifiedPurchaseData.orders.map((ord) => (
                          <option key={ord.orderId} value={ord.orderId} className="bg-slate-900 text-white">
                            Order #{ord.orderId} • {new Date(ord.orderDate).toLocaleDateString()} ({ord.quantity} unit{ord.quantity > 1 ? 's' : ''}{ord.selectedColor ? ` - ${ord.selectedColor}` : ''}) {ord.alreadyReviewed ? '• [Already Reviewed]' : '• [New Feedback]'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Interactive Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Rating Score *
                    </label>
                    <div className="flex items-center gap-1.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeLevel = hoverRating || userRating;
                        const isFilled = star <= activeLevel;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setUserRating(star)}
                            className="p-1 cursor-pointer transition transform hover:scale-125 focus:outline-hidden"
                            title={`${star} Star${star > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors duration-150 ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_2px_6px_rgba(251,191,36,0.4)]'
                                  : 'text-slate-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs font-bold text-white ml-2 font-mono">
                        {userRating} / 5.0
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] font-semibold text-cyan-400">
                      {userRating === 5 && '★★★★★ 5 Stars - Outstanding / Highly Recommended'}
                      {userRating === 4 && '★★★★☆ 4 Stars - Very Good / High Quality & Performance'}
                      {userRating === 3 && '★★★☆☆ 3 Stars - Average / Decent Value for Money'}
                      {userRating === 2 && '★★☆☆☆ 2 Stars - Below Average / Has Notable Flaws'}
                      {userRating === 1 && '★☆☆☆☆ 1 Star - Poor / Did Not Meet Expectations'}
                    </div>
                  </div>

                  {/* Review Comment Box */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Your Feedback & Experience *
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {userComment.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe build quality, real-world battery life, sound, speed, thermals, and overall satisfaction..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 transition"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition cursor-pointer shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {submittingReview
                        ? 'Saving Review...'
                        : `Submit Review for Order #${selectedOrderId}`}
                    </span>
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Right Column: Customer Reviews Feed */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-base text-white">
                Verified Customer Feedback ({reviews.length})
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                Sorted by most recent
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="p-10 bg-[#0b0e24] rounded-3xl border border-slate-800 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="font-heading font-bold text-sm text-white">No Verified Reviews Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Be the first customer with a verified purchase order to leave your feedback and rating for this electronics item!
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {reviews.map((rev) => {
                  const isCurrentUser = user && rev.userId === user.id;
                  return (
                    <div
                      key={rev.id}
                      className={`p-5 bg-[#0b0e24] rounded-3xl border transition space-y-3 shadow-xl ${
                        isCurrentUser 
                          ? 'border-cyan-500/40 ring-1 ring-cyan-500/20' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center border border-cyan-500/40">
                            {rev.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-xs sm:text-sm text-white">
                                {rev.userName}
                              </span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                  Your Review
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-mono">
                                <BadgeCheck className="w-3 h-3 text-emerald-400" />
                                <span>Order #{rev.orderId || 'Verified'}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Star Rating Display */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i <= rev.rating 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-300 font-mono">
                          {rev.rating.toFixed(1)} ★
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {rev.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pt-8 border-t border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-2xl text-white">
                Related Electronics
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                More top choices from the {product.categoryName} category.
              </p>
            </div>
            <button
              onClick={() => navigate(`/categories/${product.categoryId}`)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
