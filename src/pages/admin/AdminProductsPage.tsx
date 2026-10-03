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
  SlidersHorizontal
} from 'lucide-react';
import { Product, Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { DataTable, ColumnDef, FilterConfig } from '../../components/admin/DataTable.tsx';

export const AdminProductsPage: React.FC = () => {
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
  const [stock, setStock] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Processor', value: '' },
    { key: 'RAM', value: '' }
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete Confirmation Modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
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
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategoryId(categories[0]?.id || '');
    setSubcategory('');
    setPrice(9999);
    setOriginalPrice(11999);
    setStock(15);
    setDescription('');
    setImage1('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop');
    setImage2('');
    setSpecs([
      { key: 'Processor', value: 'High-Performance Octa-Core' },
      { key: 'RAM', value: '16GB High Speed' }
    ]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setBrand(product.brand);
    setCategoryId(product.categoryId);
    setSubcategory(product.subcategory || '');
    setPrice(product.price);
    setOriginalPrice(product.originalPrice);
    setStock(product.stock);
    setDescription(product.description);
    setImage1(product.images[0] || '');
    setImage2(product.images[1] || '');
    
    const specEntries = Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value }));
    setSpecs(specEntries.length ? specEntries : [{ key: 'Feature', value: '' }]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !categoryId) {
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

      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        categoryId,
        subcategory: subcategory.trim() || undefined,
        price,
        originalPrice: originalPrice > price ? originalPrice : price,
        stock,
        description: description.trim(),
        images,
        specifications
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
          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200" />
          <div className="max-w-[200px] sm:max-w-xs truncate">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</span>
            <p className="font-bold text-slate-900 truncate">{p.name}</p>
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
        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
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
          <span className="font-mono font-bold text-slate-900">₹{p.price.toLocaleString('en-IN')}</span>
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
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            {p.discount}% OFF
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )
      )
    },
    {
      id: 'stock',
      header: 'Stock',
      sortable: true,
      sortKey: (p) => p.stock,
      cell: (p) => (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            value={p.stock}
            onChange={(e) => handleQuickStockUpdate(p.id, Number(e.target.value))}
            className={`w-16 p-1 border rounded-lg text-center text-xs font-bold ${
              p.stock === 0 
                ? 'border-rose-400 bg-rose-50 text-rose-800'
                : p.stock <= 10 
                ? 'border-amber-400 bg-amber-50 text-amber-800' 
                : 'border-slate-200'
            }`}
          />
          {p.stock === 0 ? (
            <span className="text-[10px] text-rose-600 font-bold uppercase">Out</span>
          ) : p.stock <= 10 ? (
            <span className="text-[10px] text-amber-600 font-bold uppercase">Low</span>
          ) : null}
        </div>
      )
    },
    {
      id: 'rating',
      header: 'Rating',
      sortable: true,
      sortKey: (p) => p.rating,
      hideOnTablet: true,
      cell: (p) => (
        <span className="font-bold text-amber-600">{p.rating} ★</span>
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
            onClick={() => openEditModal(p)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
            title="Edit product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setProductToDelete(p)}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
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
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        }
        renderCard={(p) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <img src={p.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</span>
                <h4 className="font-bold text-slate-900 text-sm truncate">{p.name}</h4>
                <span className="text-xs text-indigo-600 font-semibold">{p.categoryName}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="font-mono font-bold text-slate-900">₹{p.price.toLocaleString('en-IN')}</span>
                {p.discount > 0 && (
                  <span className="ml-1.5 text-[10px] text-emerald-700 font-bold">({p.discount}% OFF)</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px]">Stock:</span>
                <input
                  type="number"
                  min="0"
                  value={p.stock}
                  onChange={(e) => handleQuickStockUpdate(p.id, Number(e.target.value))}
                  className="w-14 p-1 border rounded text-center text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => openEditModal(p)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-100 cursor-pointer"
              >
                Edit Details
              </button>
              <button
                onClick={() => setProductToDelete(p)}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 font-bold text-xs rounded-lg hover:bg-rose-100 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      />

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-heading font-black text-xl text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony WH-1000XM5 Wireless Noise Cancelling Headphones"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony, Apple, Samsung"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subcategory (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Over-Ear ANC, Gaming Laptops"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Warehouse Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selling Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Original / MRP Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detailed specifications, flagship features, audio drivers, battery life..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={image1}
                    onChange={(e) => setImage1(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Secondary Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={image2}
                    onChange={(e) => setImage2(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Dynamic Specifications */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Key Specifications & Attributes
                  </label>
                  <button
                    type="button"
                    onClick={() => setSpecs(prev => [...prev, { key: '', value: '' }])}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
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
                        className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
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
                        className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
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

              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-heading font-black text-center text-lg text-slate-900">
              Delete Product?
            </h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-800">{productToDelete.name}</strong> from the catalog? This action will permanently remove it from store listings.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 text-xs font-bold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

