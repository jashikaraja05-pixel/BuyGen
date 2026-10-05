import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit2, 
  Tag, 
  Percent, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Copy,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { OfferBanner, Category, Brand } from '../../types/index.ts';
import { api } from '../../services/api.ts';

const PRESET_GRADIENTS = [
  { name: 'Cyber Indigo', value: 'from-indigo-950 via-purple-950 to-slate-950' },
  { name: 'Neon Cyan', value: 'from-cyan-950 via-blue-950 to-slate-950' },
  { name: 'Emerald Tech', value: 'from-emerald-950 via-teal-950 to-slate-950' },
  { name: 'Crimson Power', value: 'from-rose-950 via-amber-950 to-slate-950' },
  { name: 'Deep Space', value: 'from-slate-950 via-slate-900 to-black' }
];

const PRESET_IMAGES = [
  { name: 'Smartphones & Flagships', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop' },
  { name: 'Laptops & Workstations', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop' },
  { name: 'Headphones & Audio', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' },
  { name: 'Smartwatches & Gear', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop' }
];

export const AdminOffersPage: React.FC = () => {
  const [offers, setOffers] = useState<OfferBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferBanner | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('SPECIAL OFFER');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountPercentage, setDiscountPercentage] = useState<number | ''>(25);
  const [discountValue, setDiscountValue] = useState<number | ''>(500);
  const [targetCategory, setTargetCategory] = useState<string>('all');
  const [targetBrand, setTargetBrand] = useState<string>('all');
  const [minPurchase, setMinPurchase] = useState<number | ''>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [promoCode, setPromoCode] = useState('BUYGEN25');
  const [imageUrl, setImageUrl] = useState('');
  const [bgGradient, setBgGradient] = useState(PRESET_GRADIENTS[0].value);
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const [res, catRes, brandRes] = await Promise.all([
        api.getAdminOffers(),
        api.getCategories().catch(() => ({ categories: [] })),
        api.getBrands().catch(() => ({ brands: [] }))
      ]);
      setOffers(res.offers || []);
      setCategories(catRes.categories || []);
      setBrands(brandRes.brands || []);
    } catch (err) {
      console.error('Failed to load offers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    setTitle('');
    setSubtitle('Exclusive limited-time discount on top brand electronics with manufacturer warranty.');
    setBadge('SPECIAL OFFER');
    setDiscountType('percentage');
    setDiscountPercentage(30);
    setDiscountValue(500);
    setTargetCategory('all');
    setTargetBrand('all');
    setMinPurchase(0);
    setStartDate(new Date().toISOString().split('T')[0]);
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setEndDate(nextMonth.toISOString().split('T')[0]);
    setPromoCode('BUYGEN30');
    setImageUrl(PRESET_IMAGES[0].url);
    setBgGradient(PRESET_GRADIENTS[0].value);
    setActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (offer: OfferBanner) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setSubtitle(offer.subtitle || '');
    setBadge(offer.badge || 'SPECIAL OFFER');
    setDiscountType(offer.discountType || 'percentage');
    setDiscountPercentage(offer.discountPercentage ?? '');
    setDiscountValue(offer.discountValue ?? (offer.discountPercentage ?? ''));
    setTargetCategory(offer.category || 'all');
    setTargetBrand(offer.brand || 'all');
    setMinPurchase(offer.minPurchase ?? 0);
    setStartDate(offer.startDate || '');
    setEndDate(offer.endDate || '');
    setPromoCode(offer.promoCode || '');
    setImageUrl(offer.imageUrl || '');
    setBgGradient(offer.bgGradient || PRESET_GRADIENTS[0].value);
    setActive(offer.active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleToggleActive = async (offer: OfferBanner) => {
    try {
      const updated = await api.updateOffer(offer.id, { active: !offer.active });
      setOffers(prev => prev.map(o => o.id === offer.id ? updated.offer : o));
    } catch (err: any) {
      console.error('Failed to toggle offer active state', err);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await api.deleteOffer(id);
      setOffers(prev => prev.filter(o => o.id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error('Failed to delete offer', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Offer Title is required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim() || 'SPECIAL OFFER',
        discountType,
        discountPercentage: discountType === 'percentage' && discountPercentage !== '' ? Number(discountPercentage) : undefined,
        discountValue: discountValue !== '' ? Number(discountValue) : undefined,
        category: targetCategory,
        brand: targetBrand,
        minPurchase: minPurchase !== '' ? Number(minPurchase) : 0,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        promoCode: promoCode.trim().toUpperCase() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        bgGradient,
        active
      };

      if (editingOffer) {
        const res = await api.updateOffer(editingOffer.id, payload);
        setOffers(prev => prev.map(o => o.id === editingOffer.id ? res.offer : o));
      } else {
        const res = await api.createOffer(payload);
        setOffers(prev => [res.offer, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save offer banner.');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = offers.filter(o => o.active).length;

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="bg-[#0b0e24] p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4" />
            <span>Store Marketing & Promos</span>
            <span>•</span>
            <span className="text-cyan-300">{activeCount} Active on Storefront</span>
          </div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
            Promotional Offers & Banner Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Create high-impact promotional banners with custom imagery and discount codes. Active banners automatically auto-rotate every 5 seconds on the user homepage.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Offer Banner</span>
        </button>
      </div>

      {/* Offers List / Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-[#0b0e24] rounded-3xl border border-slate-800">
          Loading promotional banners...
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-[#0b0e24] rounded-3xl p-10 sm:p-16 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-black text-xl text-white">
            No Promotional Offers Added Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Create your first offer banner to showcase special sales, festival discounts, and brand highlights on the storefront hero carousel.
          </p>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
          >
            Create Offer Banner Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div 
              key={offer.id}
              className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                offer.active 
                  ? 'border-amber-500/40 bg-[#0c102c] shadow-xl ring-1 ring-amber-500/20' 
                  : 'border-slate-800/80 bg-slate-950/70 opacity-75'
              }`}
            >
              {/* Live Visual Banner Preview */}
              <div className={`p-5 sm:p-6 bg-gradient-to-r ${offer.bgGradient || 'from-indigo-950 via-purple-950 to-slate-950'} relative overflow-hidden border-b border-slate-800/80`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {offer.badge || 'OFFER'}
                      </span>
                      {offer.discountPercentage && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {offer.discountPercentage}% OFF
                        </span>
                      )}
                      {offer.promoCode && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          {offer.promoCode}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-black text-lg sm:text-xl text-white truncate">
                      {offer.title}
                    </h3>
                    {offer.subtitle && (
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {offer.subtitle}
                      </p>
                    )}

                    {/* Targeting and Validity details */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      {offer.discountValue && offer.discountType === 'fixed' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          Flat ₹{offer.discountValue} OFF
                        </span>
                      )}
                      {offer.category && offer.category !== 'all' && (
                        <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-cyan-300">
                          Category: {categories.find(c => c.id === offer.category)?.name || offer.category}
                        </span>
                      )}
                      {offer.brand && offer.brand !== 'all' && (
                        <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-amber-300">
                          Brand: {offer.brand}
                        </span>
                      )}
                      {offer.endDate && (
                        <span className={`px-2 py-0.5 rounded border ${
                          new Date(offer.endDate).getTime() < Date.now()
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                            : 'bg-slate-900/80 border-slate-700 text-slate-400'
                        }`}>
                          {new Date(offer.endDate).getTime() < Date.now() ? 'Expired' : `Valid till ${new Date(offer.endDate).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {offer.imageUrl && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-700/80 shadow-lg shrink-0 bg-slate-900">
                      <img 
                        src={offer.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Offer Card Controls */}
              <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#090d22]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(offer)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border ${
                      offer.active 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${offer.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span>{offer.active ? 'Active (Displaying)' : 'Disabled'}</span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Added {new Date(offer.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(offer)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    title="Edit banner"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit</span>
                  </button>

                  {deleteConfirmId === offer.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl transition cursor-pointer text-xs"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-xl"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(offer.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-500/30"
                      title="Delete banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="max-w-2xl w-full bg-[#0b0e24] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black flex items-center justify-center shadow-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-white">
                    {editingOffer ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Will display on the user storefront homepage carousel
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Live Interactive Preview Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Live Storefront Preview
              </label>
              <div className={`p-5 rounded-2xl bg-gradient-to-r ${bgGradient} border border-slate-700 shadow-xl flex items-center justify-between gap-4 text-white`}>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-slate-950">
                      {badge || 'SPECIAL OFFER'}
                    </span>
                    {discountPercentage && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-500/30 text-rose-200 border border-rose-500/40">
                        {discountPercentage}% OFF
                      </span>
                    )}
                    {promoCode && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/30 text-cyan-200 border border-cyan-500/40">
                        {promoCode}
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading font-black text-base text-white truncate">
                    {title || 'Your Offer Banner Title Goes Here'}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-1">
                    {subtitle || 'Promotional subtitle and deal terms'}
                  </p>
                </div>
                {imageUrl && (
                  <img src={imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-600 shrink-0 bg-slate-900" />
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MEGA ELECTRONICS FESTIVAL - UP TO 40% OFF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-hidden font-medium text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Subtitle / Deal Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exclusive launch discounts on smartphones, laptops and accessories"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FLASH DEAL"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-hidden font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white font-medium focus:outline-hidden cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    {discountType === 'percentage' ? 'Discount Value (%)' : 'Discount Value (₹)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={discountType === 'percentage' ? 'e.g. 25' : 'e.g. 1000'}
                    value={discountType === 'percentage' ? discountPercentage : discountValue}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : '';
                      if (discountType === 'percentage') {
                        setDiscountPercentage(val);
                      } else {
                        setDiscountValue(val);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-hidden font-mono font-bold"
                  />
                </div>
              </div>

              {/* Category & Brand Targeting */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Applicable Category
                  </label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white font-medium focus:outline-hidden cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Applicable Brand
                  </label>
                  <select
                    value={targetBrand}
                    onChange={(e) => setTargetBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white font-medium focus:outline-hidden cursor-pointer"
                  >
                    <option value="all">All Brands</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BUYGEN25"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-hidden font-mono font-bold uppercase"
                  />
                </div>
              </div>

              {/* Validity Dates and Min Purchase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    End Date (Expiry)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Min Purchase (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1999"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-hidden font-mono font-bold"
                  />
                </div>
              </div>

              {/* Banner Image Selection: File Upload + Presets */}
              <div className="space-y-2 pt-1">
                <label className="block font-bold text-slate-300 uppercase tracking-wider">
                  Banner Image (Upload or Pick Preset)
                </label>
                
                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold cursor-pointer transition flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Banner Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-white focus:outline-hidden text-xs"
                  />
                </div>

                {/* Quick Preset Images */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`p-1.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        imageUrl === preset.url ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                      }`}
                    >
                      <img src={preset.url} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <span className="text-[10px] text-slate-300 truncate font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Theme Selector */}
              <div className="space-y-2 pt-1">
                <label className="block font-bold text-slate-300 uppercase tracking-wider">
                  Banner Gradient Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_GRADIENTS.map((g, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBgGradient(g.value)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                        bgGradient === g.value ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg bg-gradient-to-r ${g.value}`} />
                      <span className="text-[11px] font-bold text-white truncate">{g.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Display on Storefront</span>
                  <span className="text-[11px] text-slate-400">Enable this banner in the homepage auto-sliding hero carousel</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer p-0.5 ${
                    active ? 'bg-amber-400' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-200 ${
                    active ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingOffer ? 'Update Banner' : 'Create & Publish Banner'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
