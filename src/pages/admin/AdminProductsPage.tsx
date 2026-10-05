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
  IndianRupee,
  Upload,
  Camera,
  Link,
  Maximize2,
  Minimize2,
  FileImage,
  FolderPlus
} from 'lucide-react';
import type { Product, Category, Brand } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { DataTable, ColumnDef, FilterConfig } from '../../components/admin/DataTable.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const AdminProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [viewScope, setViewScope] = useState<'my' | 'all'>('my');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalFullScreen, setIsModalFullScreen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [brandMode, setBrandMode] = useState<'select' | 'custom'>('select');
  const [categoryMode, setCategoryMode] = useState<'select' | 'custom'>('select');
  const [categoryId, setCategoryId] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [colours, setColours] = useState<string>('');
  const [description, setDescription] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  
  // Extra Brands / Series variants stocked under the same category
  interface ExtraBrandItem {
    id: string;
    brand: string;
    name: string;
    subcategory: string;
    stock: number;
    price: number;
    originalPrice: number;
  }
  const [extraBrands, setExtraBrands] = useState<ExtraBrandItem[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Processor', value: '' },
    { key: 'RAM', value: '' },
    { key: 'Storage', value: '' },
    { key: 'Display', value: '' }
  ]);
  const [bulkSpecsText, setBulkSpecsText] = useState('');
  const [showBulkSpecs, setShowBulkSpecs] = useState(false);
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
      const [prodRes, catRes, brandRes] = await Promise.all([
        api.getProducts(viewScope === 'my' && user?.email ? { adminEmail: user.email } : {}),
        api.getCategories(),
        api.getBrands().catch(() => ({ brands: [] }))
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
      setBrands(brandRes.brands || []);
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
    const defaultBrandName = brands.length > 0 ? brands[0].name : '';
    setBrand(defaultBrandName);
    setBrandMode(brands.length > 0 ? 'select' : 'custom');
    setCategoryMode(categories.length > 0 ? 'select' : 'custom');
    setCategoryId(categories[0]?.id || '');
    setCustomCategoryName('');
    setSubcategory('');
    setPrice(0);
    setOriginalPrice(0);
    setDiscount(0);
    setStock(10);
    setColours('');
    setDescription('');
    setImagesList([]);
    setCustomImageUrl('');
    setSpecs([
      { key: 'Processor', value: '' },
      { key: 'RAM', value: '' },
      { key: 'Storage', value: '' },
      { key: 'Display', value: '' },
      { key: 'Battery', value: '' }
    ]);
    setBulkSpecsText('');
    setShowBulkSpecs(false);
    setExtraBrands([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setExtraBrands([]);
    setName(product.name);
    setBrand(product.brand);
    setBrandMode('select');
    setCategoryMode('select');
    setCategoryId(product.categoryId);
    setCustomCategoryName(product.categoryName || '');
    setSubcategory(product.subcategory || '');
    setPrice(product.price);
    setOriginalPrice(product.originalPrice);
    setDiscount(product.discount || (product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0));
    setStock(product.stock);
    const existingColours = product.colors || product.availableColours || [];
    setColours(existingColours.join(', '));
    setDescription(product.description);
    const imgs = product.images && product.images.length > 0 ? product.images : [];
    setImagesList(imgs);
    setCustomImageUrl('');
    
    const specEntries = Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value }));
    setSpecs(specEntries.length ? specEntries : [
      { key: 'Processor', value: '' },
      { key: 'RAM', value: '' },
      { key: 'Storage', value: '' },
      { key: 'Display', value: '' }
    ]);
    setBulkSpecsText(specEntries.map(s => `${s.key}: ${s.value}`).join('\n'));
    setShowBulkSpecs(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Media file upload handler (converts browsed file to base64 Data URL)
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImagesList((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (customImageUrl.trim()) {
      setImagesList((prev) => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyBulkSpecs = () => {
    if (!bulkSpecsText.trim()) return;
    const lines = bulkSpecsText.split('\n');
    const newSpecs: { key: string; value: string }[] = [];
    lines.forEach(line => {
      const parts = line.split(/[:=]/);
      if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join(':').trim();
        if (k && v) newSpecs.push({ key: k, value: v });
      }
    });
    if (newSpecs.length > 0) {
      setSpecs(newSpecs);
      setShowBulkSpecs(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetCatId = categoryId;
    let targetCatName = '';

    // Handle Category: either chosen from dropdown or typed directly
    if (categoryMode === 'custom' || (!targetCatId && customCategoryName.trim())) {
      if (!customCategoryName.trim()) {
        setFormError('Please enter a Category Name.');
        return;
      }
      targetCatName = customCategoryName.trim();
      try {
        const res = await api.createCategory({
          name: customCategoryName.trim(),
          slug: customCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: `Consumer electronics under ${customCategoryName.trim()}`,
          icon: 'Cpu'
        });
        targetCatId = res.category.id;
        targetCatName = res.category.name;
        setCategoryId(res.category.id);
        const catRes = await api.getCategories();
        setCategories(catRes.categories || []);
      } catch (catErr: any) {
        // Fallback: createProduct backend will auto-create category from targetCatName
        console.warn('Category creation API fallback:', catErr?.message);
      }
    } else {
      const found = categories.find(c => c.id === targetCatId);
      targetCatName = found ? found.name : 'General';
    }

    if (!name.trim()) {
      setFormError('Product Title is required.');
      return;
    }
    if (!brand.trim()) {
      setFormError('Brand is required.');
      return;
    }
    if (price <= 0) {
      setFormError('Selling Price must be greater than zero.');
      return;
    }
    if (stock < 0) {
      setFormError('Warehouse Stock Quantity cannot be negative.');
      return;
    }

    // Specifications
    const specifications: Record<string, string> = {};
    specs.forEach(s => {
      if (s.key.trim() && s.value.trim()) {
        specifications[s.key.trim()] = s.value.trim();
      }
    });

    // Images
    const finalImages = [...imagesList];
    if (finalImages.length === 0) {
      finalImages.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop');
    }

    try {
      setSaving(true);
      setFormError(null);

      // Auto-register brand in Firestore linked to category if not already present
      const existingBrand = brands.find(b => b.name.toLowerCase() === brand.trim().toLowerCase());
      if (!existingBrand) {
        try {
          await api.createBrand({
            name: brand.trim(),
            categoryIds: targetCatId ? [targetCatId] : [],
            active: true
          });
        } catch (bErr) {
          console.warn('Brand auto-registration note:', bErr);
        }
      } else if (targetCatId && (!existingBrand.categoryIds || !existingBrand.categoryIds.includes(targetCatId))) {
        try {
          const updatedCatIds = [...(existingBrand.categoryIds || []), targetCatId];
          await api.updateBrand(existingBrand.id, { categoryIds: updatedCatIds });
        } catch (bErr) {
          console.warn('Brand category link note:', bErr);
        }
      }

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
        categoryName: targetCatName,
        subcategory: subcategory.trim() || undefined,
        price,
        originalPrice: originalPrice > price ? originalPrice : price,
        discount: calculatedDiscount,
        stock,
        colors: parsedColours,
        availableColours: parsedColours,
        description: description.trim() || `${brand} ${name} consumer electronics device with verified warranty.`,
        images: finalImages,
        specifications,
        adminEmail: user?.email || 'admin@buygen.com'
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);

        // Also stock any extra brand variants added under this category
        for (const eb of extraBrands) {
          if (eb.brand.trim() && eb.name.trim()) {
            const ebPrice = eb.price > 0 ? eb.price : price;
            const ebOrig = eb.originalPrice > 0 ? eb.originalPrice : (originalPrice > 0 ? originalPrice : ebPrice);
            const ebDiscount = ebOrig > ebPrice ? Math.round(((ebOrig - ebPrice) / ebOrig) * 100) : calculatedDiscount;
            await api.createProduct({
              ...payload,
              brand: eb.brand.trim(),
              name: eb.name.trim(),
              subcategory: eb.subcategory.trim() || subcategory.trim() || undefined,
              price: ebPrice,
              originalPrice: ebOrig,
              discount: ebDiscount,
              stock: eb.stock >= 0 ? eb.stock : stock,
              description: `${eb.brand.trim()} ${eb.name.trim()} consumer electronics device with verified warranty.`
            });
          }
        }
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
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden ${
          isModalFullScreen ? 'p-0' : 'p-2 sm:p-4'
        }`}>
          {/* Floating always-visible close button in top right of screen */}
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="fixed top-4 right-4 z-[70] px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl shadow-2xl transition cursor-pointer flex items-center gap-1.5 ring-2 ring-white/20 active:scale-95 group font-black text-xs"
            title="Close Product Modal (Cross / Esc)"
          >
            <X className="w-5 h-5 text-white stroke-[3]" />
            <span className="hidden sm:inline">Close (Esc)</span>
          </button>

          <div className={`bg-[#0b0e24] border border-cyan-500/40 shadow-2xl text-white flex flex-col overflow-hidden transition-all duration-200 ${
            isModalFullScreen 
              ? 'w-full h-full rounded-none' 
              : 'max-w-5xl w-full rounded-3xl h-[94vh]'
          }`}>
            
            {/* 1. STICKY TOP HEADER - ALWAYS IN VIEWPORT WITH PROMINENT CROSS (X) BUTTON */}
            <div className="sticky top-0 z-30 bg-[#0c102c] px-5 sm:px-8 py-4 border-b border-slate-800 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-white flex items-center gap-2">
                    <span>{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Inventory Form
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Category selection, warehouse stock, specifications column, and photo upload
                  </p>
                </div>
              </div>

              {/* Window Controls: Fullscreen toggle & Prominent Crossing (X) Close button */}
              <div className="flex items-center gap-2 pr-12 sm:pr-0">
                <button
                  type="button"
                  onClick={() => setIsModalFullScreen(!isModalFullScreen)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer text-xs font-bold flex items-center gap-1.5"
                  title={isModalFullScreen ? 'Exit Full Screen' : 'View Full Screen'}
                >
                  {isModalFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isModalFullScreen ? 'Windowed' : 'Full Screen'}</span>
                </button>

                {/* Big, Obvious Crossing (X) Close Button */}
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-600/30 group active:scale-95"
                  title="Close Window (Cross Symbol)"
                >
                  <X className="w-5 h-5 text-white stroke-[3]" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* 2. SCROLLABLE FORM BODY */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-xs sm:text-sm">
              
              {/* STEP 1: CATEGORY SELECTION & WAREHOUSE STOCK */}
              <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">1</span>
                    <h4 className="font-heading font-black text-sm uppercase tracking-wider text-white">
                      Category & Stock Quantity
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Choose existing or type new</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Selection / Creation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Category *
                      </label>
                      <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setCategoryMode('select')}
                          className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                            categoryMode === 'select' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Choose Category
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryMode('custom')}
                          className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                            categoryMode === 'custom' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          + Type New Name
                        </button>
                      </div>
                    </div>

                    {categoryMode === 'select' && categories.length > 0 ? (
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden cursor-pointer font-medium"
                      >
                        <option value="">-- Choose From {categories.length} Categories --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Type Category Name (e.g. Smartphones, Laptops, Audio, Monitors)"
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-cyan-500/50 rounded-xl text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-hidden font-medium"
                        />
                        <p className="text-[11px] text-cyan-400/90 mt-1">
                          ✓ This category will be automatically added to the active database.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Stock Quantity */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Warehouse Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="e.g. 50"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden font-mono font-bold"
                    />
                    <span className="text-[11px] text-slate-400 block">
                      Number of available units in inventory for this category/product.
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 2: PRODUCT IDENTITY & BRAND (WITH MULTI-BRAND STOCKING SUPPORT) */}
              <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">2</span>
                    <div>
                      <h4 className="font-heading font-black text-sm uppercase tracking-wider text-white">
                        Product Title & Brand (Brand Series Stocking)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Specify model, brand title, and add additional brand variants under this category
                      </p>
                    </div>
                  </div>

                  {!editingProduct && (
                    <button
                      type="button"
                      onClick={() => setExtraBrands(prev => [
                        ...prev, 
                        { 
                          id: 'eb-' + Date.now() + Math.random().toString(36).slice(2, 5), 
                          brand: '', 
                          name: '', 
                          subcategory: subcategory || '', 
                          stock: stock > 0 ? stock : 10, 
                          price: price > 0 ? price : 0, 
                          originalPrice: originalPrice > 0 ? originalPrice : 0 
                        }
                      ])}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Another Brand / Series</span>
                    </button>
                  )}
                </div>

                {/* Primary Brand & Product */}
                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
                    Primary Brand & Model
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Brand *
                        </label>
                        <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setBrandMode('select')}
                            className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                              brandMode === 'select' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Choose Brand
                          </button>
                          <button
                            type="button"
                            onClick={() => setBrandMode('custom')}
                            className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                              brandMode === 'custom' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            + Type Brand
                          </button>
                        </div>
                      </div>

                      {brandMode === 'select' && brands.length > 0 ? (
                        <select
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden cursor-pointer font-medium"
                        >
                          <option value="">-- Select from {brands.length} Registered Brands --</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          placeholder="e.g. Apple, Samsung, OnePlus, Google, Xiaomi"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden font-medium"
                        />
                      )}

                      {/* Quick clickable brand suggestion pills */}
                      {brands.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {brands.slice(0, 8).map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setBrand(b.name);
                                setBrandMode('select');
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer border ${
                                brand.toLowerCase() === b.name.toLowerCase()
                                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                                  : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                              }`}
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Product Title / Model *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. iPhone 16 Pro Max 256GB"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Subcategory / Series (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. iPhone 16 Series, Galaxy S24 Series, M3 Pro Max Series"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Extra Brands / Series Variants Added by User */}
                {extraBrands.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Additional Brands to Stock Under This Category:</span>
                    </span>

                    {extraBrands.map((eb, index) => (
                      <div key={eb.id} className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/30 space-y-3 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                            Brand #{index + 2} Entry
                          </span>
                          <button
                            type="button"
                            onClick={() => setExtraBrands(prev => prev.filter(item => item.id !== eb.id))}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remove this brand variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                              Brand Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Samsung, OnePlus, Google"
                              value={eb.brand}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExtraBrands(prev => prev.map(item => item.id === eb.id ? { ...item, brand: val } : item));
                              }}
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                              Product Title / Model *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Galaxy S24 Ultra 5G"
                              value={eb.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExtraBrands(prev => prev.map(item => item.id === eb.id ? { ...item, name: val } : item));
                              }}
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                              Warehouse Stock *
                            </label>
                            <input
                              type="number"
                              min="0"
                              required
                              placeholder="e.g. 15"
                              value={eb.stock}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setExtraBrands(prev => prev.map(item => item.id === eb.id ? { ...item, stock: val } : item));
                              }}
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 text-xs font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                              Series / Subcategory
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. S24 Series"
                              value={eb.subcategory}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExtraBrands(prev => prev.map(item => item.id === eb.id ? { ...item, subcategory: val } : item));
                              }}
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                              Selling Price (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder="e.g. 129999"
                              value={eb.price || ''}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setExtraBrands(prev => prev.map(item => item.id === eb.id ? { ...item, price: val } : item));
                              }}
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                              MRP Original Price (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder="e.g. 139999"
                              value={eb.originalPrice || ''}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setExtraBrands(prev => prev.map(item => item.id === eb.id ? { ...item, originalPrice: val } : item));
                              }}
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 3: DEDICATED SPECIFICATION COLUMN (FULL SECTION) */}
              <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-cyan-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">3</span>
                    <div>
                      <h4 className="font-heading font-black text-sm uppercase tracking-wider text-white">
                        Full Product Specifications Column
                      </h4>
                      <p className="text-[11px] text-slate-400">Add detailed hardware and software specifications</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkSpecs(!showBulkSpecs)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      {showBulkSpecs ? 'Switch to Rows View' : 'Paste / Type Bulk Specs'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpecs(prev => [...prev, { key: '', value: '' }])}
                      className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Spec Row</span>
                    </button>
                  </div>
                </div>

                {/* Quick Preset Pills */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Click to quickly add preset spec attributes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Processor', 'RAM', 'Storage', 'Display', 'Battery', 'Operating System', 'Graphics', 'Camera', 'Connectivity'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (!specs.some(s => s.key.toLowerCase() === preset.toLowerCase())) {
                            setSpecs(prev => [...prev, { key: preset, value: '' }]);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white rounded-lg text-xs font-medium cursor-pointer transition"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bulk Specs Text Mode */}
                {showBulkSpecs ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">
                      Paste specifications formatted as <strong className="text-slate-200">Key: Value</strong> (one per line):
                    </p>
                    <textarea
                      rows={5}
                      value={bulkSpecsText}
                      onChange={(e) => setBulkSpecsText(e.target.value)}
                      placeholder={"Processor: Apple M3 Max\nRAM: 36GB Unified Memory\nStorage: 1TB NVMe SSD\nDisplay: 16.2 Liquid Retina XDR 120Hz\nBattery: 100Wh with 140W MagSafe Fast Charge"}
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleApplyBulkSpecs}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                    >
                      Apply Pasted Specs to Rows
                    </button>
                  </div>
                ) : (
                  /* Structured Spec Rows */
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                          className="w-1/3 p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400"
                        />
                        <input
                          type="text"
                          placeholder="Specification Details (e.g. 120Hz LTPO AMOLED, 2600 nits)"
                          value={s.value}
                          onChange={(e) => {
                            const updated = [...specs];
                            updated[idx].value = e.target.value;
                            setSpecs(updated);
                          }}
                          className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400"
                        />
                        {specs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition"
                            title="Remove row"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 4: PRICING & COLOURS */}
              <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">4</span>
                  <h4 className="font-heading font-black text-sm uppercase tracking-wider text-white">
                    Pricing & Color Variants
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Selling Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 74999"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      MRP / Original Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 84999"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Discount % (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="e.g. 12"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Available Colours (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Titanium Black, Natural Titanium, Desert Gold, Blue Sapphire"
                      value={colours}
                      onChange={(e) => setColours(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Separate each color with commas so customers can choose variants on product details.
                    </p>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Product Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Highlight key capabilities, build materials, audio acoustics, battery longevity, and included accessories..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 5: PRODUCT PHOTOS & MEDIA (BROWSE, CAMERA, OR LINK) */}
              <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">5</span>
                    <div>
                      <h4 className="font-heading font-black text-sm uppercase tracking-wider text-white">
                        Product Photos & Media
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Browse device files, take camera photo, or provide image/video link
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400">
                    {imagesList.length} Media Added
                  </span>
                </div>

                {/* Upload & Browse Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A: Browse Files / Capture Camera */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-dashed border-cyan-500/40 hover:border-cyan-400 transition text-center space-y-2">
                    <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                    <div>
                      <span className="font-bold text-xs text-white block">
                        Browse Device Files / Take Photo
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Select image from computer, phone gallery, or camera
                      </span>
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-md transition">
                      <Camera className="w-4 h-4" />
                      <span>Choose Files or Take Photo</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFilesSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Option B: Enter Web URL / Video Link */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                      <Link className="w-4 h-4 text-amber-400" />
                      <span>Or Enter Image / Video URL:</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Supports any web image URL, direct mp4 video, or external media link.
                    </span>
                  </div>
                </div>

                {/* Previews of Added Images */}
                {imagesList.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block">
                      Attached Product Images ({imagesList.length}) - 1st is Primary Display:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {imagesList.map((imgUrl, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-square">
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute top-1 left-1 bg-cyan-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                              Primary
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-lg opacity-80 group-hover:opacity-100 transition cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. STICKY FOOTER ACTIONS */}
              <div className="sticky bottom-0 bg-[#0c102c] -mx-5 -mb-5 sm:-mx-8 sm:-mb-8 p-4 sm:p-6 border-t border-slate-800 flex items-center justify-between gap-4 z-20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving Product...' : editingProduct ? 'Save Product Changes' : 'Create & Stock Product'}
                  </button>
                </div>
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

