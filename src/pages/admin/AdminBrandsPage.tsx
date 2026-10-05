import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FolderTree,
  ExternalLink,
  Layers
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { Brand, Category } from '../../types/index.ts';

export const AdminBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [brandRes, catRes] = await Promise.all([
        api.getBrands(),
        api.getCategories()
      ]);
      setBrands(brandRes.brands || []);
      setCategories(catRes.categories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load brands.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setBrandName('');
    setBrandDescription('');
    setBrandLogoUrl('');
    setSelectedCategories([]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandDescription(brand.description || '');
    setBrandLogoUrl(brand.logoUrl || '');
    setSelectedCategories(brand.categoryIds || []);
    setIsActive(brand.active !== false);
    setIsModalOpen(true);
  };

  const toggleCategorySelection = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setError('Brand name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const brandPayload: Partial<Brand> = {
        name: brandName.trim(),
        description: brandDescription.trim(),
        logoUrl: brandLogoUrl.trim(),
        categoryIds: selectedCategories,
        active: isActive
      };

      if (editingBrand) {
        await api.updateBrand(editingBrand.id, brandPayload);
        setSuccessMsg(`Brand "${brandName}" updated in Firestore successfully.`);
      } else {
        await api.createBrand(brandPayload);
        setSuccessMsg(`Brand "${brandName}" created in Firestore successfully.`);
      }

      setIsModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save brand.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete brand "${name}" from Firestore?`)) {
      return;
    }

    try {
      setError(null);
      await api.deleteBrand(id);
      setSuccessMsg(`Brand "${name}" removed from Firestore.`);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete brand.');
    }
  };

  const filteredBrands = brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (selectedCategoryFilter !== 'all') {
      if (!b.categoryIds || b.categoryIds.length === 0) return true;
      return b.categoryIds.includes(selectedCategoryFilter);
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-heading font-black text-2xl text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            <span>Brands Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, manage and link electronics brands to store categories. All records persist directly in Cloud Firestore.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Brand</span>
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
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#0b0e24] p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search brands by name or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 sm:w-64">
          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Brands Table / List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading brand records from Firestore...</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="bg-[#0b0e24] border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-white text-base">No Brands Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchTerm || selectedCategoryFilter !== 'all' 
              ? 'No brands matched your filter criteria.'
              : 'No brands have been created yet. Click "Add New Brand" to create brands such as Apple, Samsung, Sony, Dell, etc.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition cursor-pointer"
          >
            + Create First Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.map((brand) => {
            const linkedCats = categories.filter(c => brand.categoryIds?.includes(c.id));

            return (
              <div 
                key={brand.id}
                className="bg-[#0b0e24] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {brand.logoUrl ? (
                        <img 
                          src={brand.logoUrl} 
                          alt={brand.name} 
                          className="w-10 h-10 rounded-xl object-contain bg-slate-900 border border-slate-800 p-1"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                          {brand.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-heading font-black text-sm text-white group-hover:text-amber-400 transition">
                          {brand.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {brand.id}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      brand.active !== false
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {brand.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {brand.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {brand.description}
                    </p>
                  )}

                  {/* Linked Categories */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                      <FolderTree className="w-3 h-3 text-cyan-400" />
                      <span>Associated Categories</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {linkedCats.length > 0 ? (
                        linkedCats.map(c => (
                          <span 
                            key={c.id}
                            className="text-[10px] font-semibold bg-slate-900 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md"
                          >
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">
                          Universal (All categories)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <span className="text-[10px] text-slate-500">
                    Created {new Date(brand.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(brand)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                      title="Edit Brand"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(brand.id, brand.name)}
                      className="p-1.5 hover:bg-rose-950/50 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e24] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>{editingBrand ? 'Edit Brand' : 'Add New Electronics Brand'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple, Samsung, Sony, Dell, OnePlus"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Brand Logo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or brand icon URL"
                  value={brandLogoUrl}
                  onChange={(e) => setBrandLogoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description / Tagline
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief brand description or warranty terms..."
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500 font-medium resize-none"
                />
              </div>

              {/* Category Association */}
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Link to Store Categories
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Select which categories offer products from this brand (e.g. Smartphones, Laptops):
                </p>
                {categories.length === 0 ? (
                  <p className="text-slate-500 italic p-2 bg-slate-950 rounded-lg">
                    No categories created yet. Create a category first in the Categories tab.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategorySelection(cat.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                            isSelected ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-700'
                          }`}>
                            {isSelected && <span className="text-[10px] font-black">✓</span>}
                          </div>
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="brandActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="brandActiveCheck" className="text-slate-300 font-bold cursor-pointer">
                  Brand is active and visible in customer catalogue filters
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {submitting ? 'Saving to Firestore...' : editingBrand ? 'Update Brand' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
