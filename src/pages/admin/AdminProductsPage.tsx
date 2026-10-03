import React, { useEffect, useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ShoppingBag,
  Sparkles,
  Smartphone,
  History,
  ChevronRight,
  User,
  IndianRupee
} from 'lucide-react';
import type { Product, Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { DataTable, ColumnDef, FilterConfig } from '../../components/admin/DataTable.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const AdminProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [viewScope, setViewScope] = useState<'my' | 'all'>('my');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [colours, setColours] = useState<string>('');
  const [description, setDescription] = useState('');
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Processor', value: '' },
    { key: 'RAM', value: '' }
  ]);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Product Activity Modal State
  const [activityProduct, setActivityProduct] = useState<Product | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityData, setActivityData] = useState<any | null>(null);

  // Delete Confirmation Modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(viewScope === 'my' && user?.email ? { adminEmail: user.email } : {}),
        api.getCategories()
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
      if (catRes.categories?.length && !categoryId) {
        setCategoryId(catRes.categories[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewScope, user?.email]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategoryId(categories[0]?.id || '');
    setCustomCategoryName('');
    setSubcategory('');
    setPrice(0);
    setOriginalPrice(0);
    setDiscount(0);
    setStock(0);
    setColours('');
    setDescription('');
    setImage1('');
    setImage2('');
    setSpecs([
      { key: 'Processor', value: '' },
      { key: 'RAM', value: '' }
    ]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setBrand(product.brand);
    setCategoryId(product.categoryId);
    setCustomCategoryName('');
    setSubcategory(product.subcategory || '');
    setPrice(product.price);
    setOriginalPrice(product.originalPrice);
    setDiscount(product.discount || (product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0));
    setStock(product.stock);
    const existingColours = product.colors || product.availableColours || [];
    setColours(existingColours.join(', '));
    setDescription(product.description);
    setImage1(product.images[0] || '');
    setImage2(product.images[1] || '');
    
    const specEntries = Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value }));
    setSpecs(specEntries.length ? specEntries : [{ key: 'Processor', value: '' }, { key: 'RAM', value: '' }]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetCatId = categoryId;

    if (!targetCatId && customCategoryName.trim()) {
      try {
        const res = await api.createCategory({
          name: customCategoryName.trim(),
          slug: customCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: 'Store category',
          icon: 'Cpu'
        });
        targetCatId = res.category.id;
        setCategoryId(res.category.id);
      } catch (err: any) {
        setFormError('Failed to create category: ' + (err.message || 'Error'));
        return;
      }
    }

    if (!name.trim() || !brand.trim() || !targetCatId) {
      setFormError('Product Name, Brand, and Category are required.');
      return;
    }
    if (price <= 0) {
      setFormError('Price must be greater than zero.');
      return;
    }
    if (stock < 0) {
      setFormError('Stock cannot be negative.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const specifications: Record<string, string> = {};
      specs.forEach(s => {
        if (s.key.trim() && s.value.trim()) {
          specifications[s.key.trim()] = s.value.trim();
        }
      });

      const images = [image1.trim()];
      if (image2.trim()) images.push(image2.trim());

      const parsedColours = colours
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const calculatedDiscount = discount > 0 
        ? discount 
        : (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        categoryId: targetCatId,
        subcategory: subcategory.trim() || undefined,
        price,
        originalPrice: originalPrice > price ? originalPrice : price,
        discount: calculatedDiscount,
        stock,
        colors: parsedColours,
        availableColours: parsedColours,
        description: description.trim(),
        images,
        specifications,
        adminEmail: user?.email || 'admin@buygen.com'
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      await api.updateStock(productId, newStock);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewActivity = async (product: Product) => {
    try {
      setActivityProduct(product);
      setActivityLoading(true);
      const data = await api.getProductActivity(product.id);
      setActivityData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.deleteProduct(productToDelete.id);
      setProductToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered dataset before sorting in DataTable
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesStock = 
        stockFilter === 'all' ? true :
        stockFilter === 'instock' ? p.stock > 10 :
        stockFilter === 'lowstock' ? (p.stock > 0 && p.stock <= 10) :
        p.stock === 0;

      return matchesCat && matchesStock;
    });
  }, [products, selectedCategory, stockFilter]);

  // Column definitions for DataTable
  const columns: ColumnDef<Product>[] = [
    {
      id: 'item',
      header: 'Item',
      sortable: true,
      sortKey: (p) => p.name,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800" />
          <div className="max-w-[200px] sm:max-w-xs truncate">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</span>
            <p className="font-bold text-white truncate">{p.name}</p>
            {p.subcategory && (
              <span className="text-[10px] text-slate-400 block truncate">{p.subcategory}</span>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'category',
      header: 'Category',
      sortable: true,
      sortKey: (p) => p.categoryName,
      hideOnMobile: true,
      cell: (p) => (
        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
          {p.categoryName}
        </span>
      )
    },
    {
      id: 'price',
      header: 'Price',
      sortable: true,
      sortKey: (p) => p.price,
      cell: (p) => (
        <div>
          <span className="font-mono font-bold text-white">₹{p.price.toLocaleString('en-IN')}</span>
          {p.originalPrice > p.price && (
            <span className="text-[10px] text-slate-400 line-through block">
              ₹{p.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'discount',
      header: 'Discount',
      sortable: true,
      sortKey: (p) => p.discount,
      hideOnTablet: true,
      cell: (p) => (
        p.discount > 0 ? (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
            {p.discount}% OFF
          </span>
        ) : (
          <span className="text-slate-500">—</span>
        )
      )
    },
    {
      id: 'colours',
      header: 'Colours',
      sortable: false,
      hideOnTablet: true,
      cell: (p) => {
        const cols = p.colors || p.availableColours || [];
        if (!cols || cols.length === 0) return <span className="text-slate-500 text-xs">—</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[130px]">
            {cols.map((col, idx) => (
              <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                {col}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      id: 'stock',
      header: 'Stock & Status',
      sortable: true,
      sortKey: (p) => p.stock,
      cell: (p) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuickStockUpdate(p.id, Math.max(0, p.stock - 1))}
              disabled={p.stock === 0}
              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer shadow-2xs transition"
              title="Decrease stock by 1"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              value={p.stock}
              onChange={(e) => handleQuickStockUpdate(p.id, Math.max(0, Number(e.target.value)))}
              className={`w-16 py-1 px-1.5 border rounded-lg text-center text-xs font-black transition shadow-2xs ${
                p.stock === 0 
                  ? 'border-rose-500/50 bg-rose-950/40 text-rose-300' 
                  : p.stock <= 10 
                  ? 'border-amber-500/50 bg-amber-950/40 text-amber-300' 
                  : 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
              }`}
            />
            <button
              onClick={() => handleQuickStockUpdate(p.id, p.stock + 1)}
              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black flex items-center justify-center text-xs cursor-pointer shadow-2xs transition"
              title="Increase stock by 1"
            >
              +
            </button>
          </div>
          <div>
            {p.stock === 0 ? (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Out of Stock (0)
              </span>
            ) : p.stock <= 10 ? (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Low Stock ({p.stock})
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                In Stock ({p.stock})
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'orders',
      header: 'Orders Placed',
      sortable: true,
      sortKey: (p) => p.orderCount || 0,
      cell: (p) => {
        const count = p.orderCount || 0;
        const units = p.unitsSold || 0;
        const isLowWithOrders = (p.stock <= 10 && count > 0);

        return (
          <div className="space-y-1">
            <button
              onClick={() => handleViewActivity(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer border ${
                isLowWithOrders
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-xs'
                  : count > 0
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Click to view all customer purchase records and orders for this product"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>{count} {count === 1 ? 'Order' : 'Orders'}</span>
              <span className="text-[10px] font-bold opacity-80 font-mono">({units} units)</span>
            </button>
            {isLowWithOrders && (
              <span className="text-[10px] font-black text-amber-400 block leading-tight">
                ⚠️ Low stock ({p.stock} left)
              </span>
            )}
          </div>
        );
      }
    },
    {
      id: 'rating',
      header: 'Rating',
      sortable: true,
      sortKey: (p) => p.rating,
      hideOnTablet: true,
      cell: (p) => (
        <span className="font-black text-amber-400">{p.rating} ★</span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      sortable: false,
      headerClassName: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleViewActivity(p)}
            className="px-2.5 py-1.5 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition cursor-pointer flex items-center gap-1.5 border border-cyan-500/30 font-bold shadow-2xs"
            title="View customer purchases and order history for this product"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold hidden sm:inline">Orders</span>
          </button>
          <button
            onClick={() => openEditModal(p)}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Edit product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setProductToDelete(p)}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Filters configuration for DataTable
  const filterConfigs: FilterConfig[] = [
    {
      id: 'category',
      label: 'Category',
      value: selectedCategory,
      options: [
        { label: 'All Categories', value: 'all' },
        ...categories.map(c => ({ label: c.name, value: c.id }))
      ],
      onChange: setSelectedCategory
    },
    {
      id: 'stock',
      label: 'Stock Status',
      value: stockFilter,
      options: [
        { label: 'All Stock Levels', value: 'all' },
        { label: 'In Stock (>10)', value: 'instock' },
        { label: 'Low Stock (≤10)', value: 'lowstock' },
        { label: 'Out of Stock (0)', value: 'outofstock' }
      ],
      onChange: setStockFilter
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Reusable, responsive DataTable */}
      <DataTable<Product>
        title="Product Management"
        subtitle="Manage live consumer electronics catalog, adjust prices, edit specifications, and track stock levels."
        data={filteredProducts}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search by name, brand, or specifications..."
        searchFilter={(p, q) => 
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          Object.entries(p.specifications || {}).some(([k, v]) => 
            k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
          )
        }
        filters={filterConfigs}
        defaultSort={{ columnId: 'item', direction: 'asc' }}
        pageSize={8}
        actions={
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setViewScope('my')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewScope === 'my' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                My Stocked Items
              </button>
              <button
                type="button"
                onClick={() => setViewScope('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewScope === 'all' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Store Inventory
              </button>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        }
        renderCard={(p) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <img src={p.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-950" />
              <div className="flex-1 truncate">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</span>
                <h4 className="font-bold text-white text-sm truncate">{p.name}</h4>
                <span className="text-xs text-cyan-400 font-semibold">{p.categoryName}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="font-mono font-black text-white text-sm">₹{p.price.toLocaleString('en-IN')}</span>
                {p.discount > 0 && (
                  <span className="ml-1.5 text-[10px] text-emerald-400 font-black">({p.discount}% OFF)</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {p.stock === 0 ? (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Out of Stock (0)
                  </span>
                ) : p.stock <= 10 ? (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Low Stock ({p.stock})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    In Stock ({p.stock})
                  </span>
                )}
              </div>
            </div>
            {(p.orderCount || 0) > 0 && (
              <div className="text-[11px] font-bold text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                <span>Customer Orders:</span>
                <span className="font-black text-cyan-300">{p.orderCount} orders ({p.unitsSold || 0} units)</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleViewActivity(p)}
                className="px-2.5 py-1.5 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1 transition"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Orders</span>
              </button>
              <button
                onClick={() => openEditModal(p)}
                className="px-3 py-1.5 bg-slate-900 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer transition"
              >
                Edit Details
              </button>
              <button
                onClick={() => setProductToDelete(p)}
                className="px-3 py-1.5 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 font-bold text-xs rounded-lg cursor-pointer transition"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      />

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b0e24] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <h3 className="font-heading font-black text-xl text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Product 1 (or any custom product name)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brand Name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  {categories.length > 0 ? (
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden cursor-pointer"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smartphones, Audio, Laptops"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Subcategory (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Over-Ear ANC, Gaming Laptops"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Warehouse Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Selling Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Original / MRP Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    placeholder="e.g. 10"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Available Colours (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cosmic Black, Titanium Gray, Aurora Blue"
                    value={colours}
                    onChange={(e) => setColours(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Separate multiple colors with commas so customers can choose their variant.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detailed specifications, flagship features, audio drivers, battery life..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Primary Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={image1}
                    onChange={(e) => setImage1(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Secondary Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={image2}
                    onChange={(e) => setImage2(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Dynamic Specifications */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Key Specifications & Attributes
                  </label>
                  <button
                    type="button"
                    onClick={() => setSpecs(prev => [...prev, { key: '', value: '' }])}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    + Add Spec Row
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {specs.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Feature (e.g. Display)"
                        value={s.key}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[idx].key = e.target.value;
                          setSpecs(updated);
                        }}
                        className="w-1/2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 120Hz AMOLED)"
                        value={s.value}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[idx].value = e.target.value;
                          setSpecs(updated);
                        }}
                        className="w-1/2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                      {specs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 bg-slate-900 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e24] border border-rose-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-white">
            <h3 className="font-heading font-black text-center text-lg text-white">
              Delete Product?
            </h3>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-200">{productToDelete.name}</strong> from the catalog? This action will permanently remove it from store listings.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 text-xs font-bold border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Purchase Activity & Related Orders Modal */}
      {activityProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b0e24] border border-cyan-500/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col text-white">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={activityProduct.images[0]}
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-800 bg-slate-950"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activityProduct.brand}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{activityProduct.categoryName}</span>
                  </div>
                  <h3 className="font-heading font-black text-lg text-white leading-tight">
                    {activityProduct.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>Price: ₹{activityProduct.price.toLocaleString('en-IN')}</span>
                    <span>•</span>
                    <span className={activityProduct.stock === 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      Current Stock: {activityProduct.stock} units
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setActivityProduct(null); setActivityData(null); }}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer bg-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Units Sold</span>
                <span className="text-xl font-black text-white">{activityData?.totalUnitsSold ?? 0}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ₹{(activityData?.totalRevenue ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders Count</span>
                <span className="text-xl font-black text-cyan-400">{activityData?.orders?.length ?? 0}</span>
              </div>
            </div>

            {/* Orders list */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[160px] pr-1">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                Customer Purchase Records ({activityData?.orders?.length || 0})
              </h4>

              {activityLoading ? (
                <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                  Loading order history from database...
                </div>
              ) : !activityData || activityData.orders.length === 0 ? (
                <div className="py-10 text-center bg-slate-950 rounded-2xl border border-dashed border-slate-800">
                  <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">No orders placed for this product yet.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    When customers purchase this item, the authenticated customer details, order ID, and quantities ordered will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activityData.orders.map((ord: any) => (
                    <div
                      key={ord.orderId}
                      className="p-3.5 bg-slate-950 hover:bg-slate-900 transition rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-cyan-400 text-xs">#{ord.orderId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {ord.orderStatus}
                          </span>
                          {ord.selectedColor && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                              Colour: {ord.selectedColor}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ord.customerName}</span>
                          <span className="text-slate-400 font-normal">({ord.customerEmail})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(ord.orderDate).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </div>
                      </div>

                      <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                        <div className="text-[11px] text-slate-400">
                          Qty: <span className="font-black text-white text-sm">{ord.quantity}</span> × ₹{ord.priceAtPurchase.toLocaleString('en-IN')}
                        </div>
                        <div className="font-black text-cyan-300 text-sm mt-0.5 font-mono">
                          ₹{ord.itemTotal.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Paid via {ord.paymentMethod}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => { setActivityProduct(null); setActivityData(null); }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer border border-slate-700"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

