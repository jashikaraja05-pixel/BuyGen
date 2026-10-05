import { storage } from '../config/storage.ts';
import type { Category } from '../../types/index.ts';

export const categoryService = {
  getAllCategories(): Category[] {
    return storage.getAllCategories();
  },

  createCategory(data: Partial<Category>): Category {
    const id = data.id || 'cat-' + (data.slug || data.name || Date.now().toString()).toLowerCase().replace(/[^a-z0-9]/g, '-');
    const slug = data.slug || (data.name || 'category').toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newCategory: Category = {
      id,
      name: (data.name || 'New Category').trim(),
      slug,
      parentId: data.parentId,
      description: data.description || '',
      icon: data.icon || 'Grid',
      subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
      productCount: 0
    };

    return storage.createCategory(newCategory);
  },

  updateCategory(id: string, updates: Partial<Category>): Category {
    return storage.updateCategory(id, updates);
  },

  deleteCategory(id: string): boolean {
    return storage.deleteCategory(id);
  },

  clearAllCategories(): boolean {
    return storage.clearAllCategories();
  }
};
