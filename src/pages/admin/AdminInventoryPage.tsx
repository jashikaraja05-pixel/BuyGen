import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  TrendingDown, 
  Boxes,
  ArrowUpDown,
  Plus,
  Minus,
  Save
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { Product } from '../../types/index.ts';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'lowstock' | 'outofstock'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editedStocks, setEditedStocks] = useState<Record<string, number>>({});

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProducts({ stockStatus: 'all' });
      setProducts(res.products || []);
      
      const initialStockMap: Record<string, number> = {};
      for (const p of res.products || []) {
        initialStockMap[p.id] = p.stock;
      }
      setEditedStocks(initialStockMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStockChange = (productId: string, value: number) => {
    setEditedStocks(prev => ({
      ...prev,
      [productId]: Math.max(0, Math.floor(value))
    }));
  };

  const handleQuickSaveStock = async (product: Product) => {
    const newStock = editedStocks[product.id];
    if (newStock === undefined || isNaN(newStock) || newStock < 0) {
      setError('Please enter a valid stock quantity (0 or greater).');
      return;
    }

    try {
      setUpdatingId(product.id);
      setError(null);
      await api.updateStock(product.id, newStock);
      setSuccessMsg(`Stock for "${product.name}" updated to ${newStock} in Firestore.`);
      await loadProducts();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update stock in Firestore.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const inStockProducts = products.filter(p => p.stock > 5);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === 'lowstock') return p.stock > 0 && p.stock <= 5;
    if (stockFilter === 'outofstock') return p.stock === 0;
    if (stockFilter === 'instock') return p.stock > 5;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-heading font-black text-2xl text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-400" />
            <span>Inventory & Stock Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Firestore inventory ledger. Stock updates immediately affect customer cart availability and prevention of overselling.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProducts}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync from Firestore</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0b0e24] border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Inventory Units
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-heading font-black text-2xl text-white">
              {totalUnits.toLocaleString()}
            </span>
            <span className="text-xs text-cyan-400 font-bold">
              {products.length} SKUs
            </span>
          </div>
        </div>

        <div className="bg-[#0b0e24] border border-emerald-500/20 p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Healthy Stock (>5)</span>
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-heading font-black text-2xl text-emerald-400">
              {inStockProducts.length}
            </span>
            <span className="text-xs text-slate-400">Products</span>
          </div>
        </div>

        <div className="bg-[#0b0e24] border border-amber-500/30 p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock (1 - 5)</span>
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-heading font-black text-2xl text-amber-400">
              {lowStockProducts.length}
            </span>
            <span className="text-xs text-slate-400">Needs Restock</span>
          </div>
        </div>

        <div className="bg-[#0b0e24] border border-rose-500/30 p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Out of Stock (0)</span>
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-heading font-black text-2xl text-rose-400">
              {outOfStockProducts.length}
            </span>
            <span className="text-xs text-rose-400/80 font-bold">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Tabs */}
      <div className="flex flex-col md:flex-row gap-3 bg-[#0b0e24] p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search products by title, brand, SKU or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'instock', 'lowstock', 'outofstock'] as const).map((tab) => {
            const labels = {
              all: `All (${products.length})`,
              instock: `In Stock (${inStockProducts.length})`,
              lowstock: `Low Stock (${lowStockProducts.length})`,
              outofstock: `Out of Stock (${outOfStockProducts.length})`
            };
            const isActive = stockFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStockFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Fetching real-time inventory from Cloud Firestore...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#0b0e24] border border-slate-800 rounded-2xl p-12 text-center space-y-2">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="font-heading font-bold text-white text-sm">No Products Found</h4>
          <p className="text-xs text-slate-400">
            {searchTerm || stockFilter !== 'all' 
              ? 'No products matched your search or stock filter.' 
              : 'The product catalogue is empty. Create products in the Products tab first.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#0b0e24] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-3">Category & Brand</th>
                  <th className="py-3.5 px-3">Price</th>
                  <th className="py-3.5 px-3">Current Stock</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Stock Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredProducts.map((product) => {
                  const currentStockVal = editedStocks[product.id] ?? product.stock;
                  const isModified = currentStockVal !== product.stock;
                  const isUpdating = updatingId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-slate-900/40 transition">
                      {/* Product image & name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400'}
                            alt={product.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400';
                            }}
                          />
                          <div className="max-w-xs truncate">
                            <span className="font-heading font-bold text-white block truncate">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              SKU: {product.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-3">
                        <span className="text-white block font-semibold">
                          {product.categoryName}
                        </span>
                        <span className="text-[11px] text-amber-400 font-bold">
                          {product.brand}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-[10px] text-slate-500 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Stock Number */}
                      <td className="py-3 px-3 font-mono font-bold text-sm">
                        <span className={
                          product.stock === 0 ? 'text-rose-400' :
                          product.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'
                        }>
                          {product.stock} units
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        {product.stock === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            Out of Stock
                          </span>
                        ) : product.stock <= 5 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Low Stock ({product.stock})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Quick Adjuster */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStockChange(product.id, currentStockVal - 1)}
                            disabled={currentStockVal <= 0 || isUpdating}
                            className="w-7 h-7 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg flex items-center justify-center text-slate-300 font-bold transition cursor-pointer"
                            title="Decrease by 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentStockVal}
                            onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-center bg-slate-950 border border-slate-800 rounded-lg text-white font-mono font-bold text-xs focus:outline-hidden focus:border-amber-500"
                          />

                          <button
                            type="button"
                            onClick={() => handleStockChange(product.id, currentStockVal + 1)}
                            disabled={isUpdating}
                            className="w-7 h-7 bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 font-bold transition cursor-pointer"
                            title="Increase by 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickSaveStock(product)}
                            disabled={!isModified || isUpdating}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                              isModified 
                                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 animate-pulse' 
                                : 'bg-slate-900 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isUpdating ? 'Saving...' : 'Save'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
