import React from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface WishlistPageProps {
  navigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { wishlist, wishlistCount, moveToCart, toggleWishlist, loading } = useWishlist();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-slate-900">Sign In to Save Products</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Your saved wishlist items persist in the persistent database once you log in.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-semibold text-indigo-600 animate-pulse">Loading saved items...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-slate-900">Your Wishlist is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Save your favorite gadgets and electronics to track prices or purchase later.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="font-heading font-black text-3xl text-slate-900">
          My Saved Wishlist ({wishlistCount})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Items saved to your account. Move them to cart or compare their specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div key={product.id} className="relative group">
            <ProductCard product={product} navigate={navigate} />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => moveToCart(product.id)}
                disabled={product.stock <= 0}
                className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Move to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
