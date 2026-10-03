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
  MessageSquare
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
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review submission form
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

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
      } catch (err: any) {
        setError(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
      await addToCart(product.id, quantity);
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
      await addToCart(product.id, quantity);
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewError('You must be logged in to post a review.');
      return;
    }
    if (!userComment.trim()) {
      setReviewError('Please write your review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);
      const res = await api.addReview(product.id, userRating, userComment.trim());
      setReviews(res.reviews);
      setProduct(res.product);
      setUserComment('');
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-2xl text-slate-900">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verified buyers who purchased and tested this electronic item.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Write Review Form */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Write a Review</span>
            </h3>

            {reviewError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{userRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Your Review Comment
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your experience with build quality, real-world battery life, performance, and thermals..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                {submittingReview ? 'Posting Review...' : 'Submit Verified Review'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-500 text-xs">
                No reviews yet. Be the first customer to review this gadget!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {rev.userName.charAt(0)}
                      </div>
                      <span className="font-heading font-bold text-xs sm:text-sm text-slate-900">{rev.userName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified Purchase
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
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
