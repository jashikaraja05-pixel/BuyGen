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
  ThumbsUp
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
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

  // Check verified purchase orders for logged in customer
  useEffect(() => {
    if (user && product) {
      setLoadingPurchaseCheck(true);
      api.getVerifiedPurchaseOrders(product.id)
        .then(res => {
          setVerifiedPurchaseData(res);
          if (res.orders && res.orders.length > 0) {
            // Find first unreviewed order or default to the most recent one
            const unreviewed = res.orders.find(o => !o.alreadyReviewed);
            const target = unreviewed || res.orders[0];
            setSelectedOrderId(target.orderId);
            if (target.existingReview) {
              setUserRating(target.existingReview.rating);
              setUserComment(target.existingReview.comment);
            }
          } else {
            setSelectedOrderId('');
          }
        })
        .catch(err => {
          console.error('Failed to check verified purchase orders:', err);
        })
        .finally(() => {
          setLoadingPurchaseCheck(false);
        });
    } else {
      setVerifiedPurchaseData(null);
      setSelectedOrderId('');
    }
  }, [user, product?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-md w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
            <div className="h-24 bg-slate-200 rounded-xl"></div>
            <div className="h-12 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-heading font-bold text-2xl text-slate-900">Product Not Found</h2>
        <p className="text-slate-500 text-sm">{error || 'This product does not exist or has been removed.'}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700"
        >
          Return to Catalog
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
      setReviews(res.reviews);
      setProduct(res.product);
      setReviewSuccess(`Verified feedback linked to Order #${selectedOrderId} saved successfully!`);

      // Refresh verified purchase status
      const updatedCheck = await api.getVerifiedPurchaseOrders(product.id);
      setVerifiedPurchaseData(updatedCheck);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit verified review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-indigo-600">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button onClick={() => navigate('/products')} className="hover:text-indigo-600">Products</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button 
          onClick={() => navigate(`/categories/${product.categoryId}`)} 
          className="hover:text-indigo-600"
        >
          {product.categoryName}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl bg-slate-100 overflow-hidden border border-slate-200/80 aspect-square group shadow-xs">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                <span className="px-4 py-2 bg-rose-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg">
                  Currently Out of Stock
                </span>
              </div>
            )}
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-black uppercase rounded-lg bg-slate-900 text-white shadow-md">
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
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                    selectedImage === img ? 'border-indigo-600 shadow-md ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Purchase Form */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-indigo-700">{product.brand}</span>
              <span>{product.subcategory || product.categoryName}</span>
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Review Counter */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 text-amber-800 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {product.reviewCount} customer ratings
              </span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Buyer Reviewed</span>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-black text-3xl sm:text-4xl text-slate-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Inclusive of all simulated taxes & GST</p>
            </div>

            {product.discount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-xs">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Stock Availability */}
          <div className="flex items-center justify-between text-xs sm:text-sm py-2 border-y border-slate-100">
            <span className="font-semibold text-slate-600">Availability:</span>
            {isOutOfStock ? (
              <span className="text-rose-600 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Out of stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Only {product.stock} units left in stock!
              </span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> In Stock ({product.stock} units ready to dispatch)
              </span>
            )}
          </div>

          {/* Available Colours Selector */}
          {productColors.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Available Colours
                </span>
                {selectedColor && (
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
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
                          ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 ring-2 ring-indigo-500'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
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
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</span>
              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 text-slate-600 hover:text-indigo-600 disabled:text-slate-300 disabled:cursor-not-allowed transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-black text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2.5 text-slate-600 hover:text-indigo-600 disabled:text-slate-300 disabled:cursor-not-allowed transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-slate-400">
                (Max: {product.stock})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10 active:scale-95'
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
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-95'
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
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleCompare}
                className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  comparing
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{comparing ? 'In Compare List' : 'Compare Specs'}</span>
              </button>
            </div>
          </div>

          {/* Micro assurances */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Free Express Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-cyan-600" />
              <span>7-Day Replacement</span>
            </div>
          </div>

        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t border-slate-200">
        
        {/* Description */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-heading font-bold text-xl text-slate-900">
            Product Overview
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
            {product.description}
          </p>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>BUYGEN Quality Certified</span>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              Every unit is serialized, batch verified, and shipped in tamper-evident manufacturer packaging.
            </p>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-heading font-bold text-xl text-slate-900">
            Technical Specifications
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
            {Object.entries(product.specifications || {}).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 px-5 py-3 text-xs sm:text-sm">
                <span className="font-semibold text-slate-500">{key}</span>
                <span className="col-span-2 text-slate-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Reviews Section */}
      <div className="pt-8 border-t border-slate-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Order-Verified Reviews</span>
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">
              Customer Reviews & Ratings ({reviews.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Authentic customer feedback linked directly to verified purchases and order IDs.
            </p>
          </div>

          {/* Rating Summary Score Card */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="text-center">
              <span className="font-heading font-black text-3xl text-slate-900 leading-none">
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
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold block">
                Based on {reviews.length} verified buyer ratings
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Verified Purchase Feedback Form / Verification Status */}
          <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-6 sm:p-7 border border-slate-200/80 space-y-5 shadow-xs">
            
            {!user ? (
              /* Case 1: Guest / Not Logged In */
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    Sign In to Leave Feedback
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    To maintain strict integrity, reviews are verified against actual customer orders. Sign in to your account to review purchased products.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Sign In to Your Account
                </button>
              </div>
            ) : loadingPurchaseCheck ? (
              /* Checking purchase orders */
              <div className="py-12 text-center text-xs text-slate-400 animate-pulse space-y-2">
                <PackageCheck className="w-6 h-6 text-slate-300 mx-auto animate-bounce" />
                <p>Verifying customer order history for this item...</p>
              </div>
            ) : !verifiedPurchaseData?.hasPurchased ? (
              /* Case 2: Signed In, But Has Not Purchased This Product */
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider inline-block">
                    Verified Purchases Only
                  </span>
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    Order Verification Required
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    You haven’t ordered this product yet on your account ({user.email}). Only customers with confirmed purchase order IDs can submit ratings and feedback.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Order This Item to Review It
                  </button>
                </div>
              </div>
            ) : (
              /* Case 3: Signed In AND Verified Buyer! */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-heading font-black text-base text-slate-900">
                      Verified Buyer Feedback
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase">
                    Order Verified
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Thank you for shopping with BUYGEN! Select your order ID below to record your verified feedback.
                </p>

                {reviewSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{reviewSuccess}</span>
                  </div>
                )}

                {reviewError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-medium">{reviewError}</span>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Order ID Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Linked Purchase Order ID *</span>
                      <span className="text-[10px] text-emerald-600 font-semibold lowercase">
                        {verifiedPurchaseData.orders.length} eligible purchase{verifiedPurchaseData.orders.length > 1 ? 's' : ''}
                      </span>
                    </label>

                    {verifiedPurchaseData.orders.length === 1 ? (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <PackageCheck className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-mono font-bold text-slate-900">
                              Order #{verifiedPurchaseData.orders[0].orderId}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              Purchased on {new Date(verifiedPurchaseData.orders[0].orderDate).toLocaleDateString()}
                              {verifiedPurchaseData.orders[0].selectedColor ? ` • ${verifiedPurchaseData.orders[0].selectedColor}` : ''}
                            </span>
                          </div>
                        </div>
                        {verifiedPurchaseData.orders[0].alreadyReviewed ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Editing Feedback
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Ready to Review
                          </span>
                        )}
                      </div>
                    ) : (
                      <select
                        value={selectedOrderId}
                        onChange={(e) => handleOrderSelect(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600 cursor-pointer shadow-2xs"
                      >
                        {verifiedPurchaseData.orders.map((ord) => (
                          <option key={ord.orderId} value={ord.orderId}>
                            Order #{ord.orderId} • {new Date(ord.orderDate).toLocaleDateString()} ({ord.quantity} unit{ord.quantity > 1 ? 's' : ''}{ord.selectedColor ? ` - ${ord.selectedColor}` : ''}) {ord.alreadyReviewed ? '• [Already Reviewed]' : '• [New Feedback]'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Interactive Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Rating Score *
                    </label>
                    <div className="flex items-center gap-1.5 p-2.5 bg-white rounded-xl border border-slate-200">
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
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs font-bold text-slate-900 ml-2 font-mono">
                        {userRating} / 5.0
                      </span>
                    </div>

                    {/* Rating Descriptor Feedback */}
                    <div className="mt-1 text-[11px] font-semibold text-indigo-700">
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
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Your Feedback & Experience *
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {userComment.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe build quality, real-world battery life, sound, speed, thermals, and overall satisfaction..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-inner"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
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
              <h3 className="font-heading font-black text-base text-slate-900">
                Verified Customer Feedback ({reviews.length})
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Sorted by most recent
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="p-10 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-heading font-bold text-sm text-slate-800">No Verified Reviews Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
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
                      className={`p-5 bg-white rounded-3xl border transition space-y-3 shadow-xs ${
                        isCurrentUser 
                          ? 'border-indigo-300 ring-2 ring-indigo-50 bg-indigo-50/10' 
                          : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {rev.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                                {rev.userName}
                              </span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-800">
                                  Your Review
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {/* Order ID Link & Verification Badge */}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-mono">
                                <BadgeCheck className="w-3 h-3 text-emerald-600" />
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
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-slate-800 font-mono">
                          {rev.rating.toFixed(1)} ★
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
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
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-2xl text-slate-900">
                Related Electronics
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                More top choices from the {product.categoryName} category.
              </p>
            </div>
            <button
              onClick={() => navigate(`/categories/${product.categoryId}`)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
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
