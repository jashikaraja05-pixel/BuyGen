import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, AlertCircle, X, Check } from 'lucide-react';
import type { Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [subcategoriesStr, setSubcategoriesStr] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setSubcategoriesStr('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setSubcategoriesStr((cat.subcategories || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const subcategories = subcategoriesStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const generatedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: generatedSlug,
          description: description.trim(),
          subcategories
        });
      } else {
        await api.createCategory({
          name: name.trim(),
          slug: generatedSlug,
          description: description.trim(),
          icon: 'Cpu',
          subcategories
        });
      }

      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setError(null);
      await api.deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Cannot delete category');
      setCategoryToDelete(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all categories? Active Categories will be reset to 0.')) {
      return;
    }
    try {
      setError(null);
      await api.clearAllCategories();
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to clear all categories');
    }
  };

  return (
    <div className="space-y-8 text-white">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure electronics categories, delete unwanted ones, and organize inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {categories.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Delete all categories and reset active count to 0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset to 0 Categories</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Grid or Zero State */}
      {categories.length === 0 && !loading ? (
        <div className="p-12 bg-[#0b0e24] rounded-3xl border border-slate-800 text-center space-y-3 shadow-xl">
          <FolderTree className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-heading font-black text-lg text-white">0 Categories in Database</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "New Category" above to organize products in your store.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="p-6 bg-[#0b0e24] rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider">
                    /{cat.slug}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-900 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(cat)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-heading font-black text-lg text-white mt-2">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {cat.description}
                </p>

                {/* Subcategories tags */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cat.subcategories.map((sub, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold rounded-md">
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Active Products:</span>
                <span className="font-bold text-cyan-300">{cat.productCount || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e24] border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-black text-xl text-white">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gaming Laptops"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated from name"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description for category..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Subcategories (comma separated)
                </label>
                <input
                  type="text"
                  value={subcategoriesStr}
                  onChange={(e) => setSubcategoriesStr(e.target.value)}
                  placeholder="RTX 4090, OLED, Thin & Light"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-xl shadow-md cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e24] border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-white">
            <h3 className="font-heading font-black text-lg text-white">
              Delete "{categoryToDelete.name}"?
            </h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this category? Products currently assigned to this category will need re-categorization.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl cursor-pointer"
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
