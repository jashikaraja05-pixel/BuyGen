import { storage } from '../config/storage.ts';
import type { Brand } from '../../types/index.ts';

export const brandService = {
  getAllBrands(category?: string): Brand[] {
    return storage.getAllBrands(category);
  },

  getBrandById(id: string): Brand | null {
    return storage.getBrandById(id);
  },

  createBrand(data: Partial<Brand>): Brand {
    const name = (data.name || '').trim();
    if (!name) {
      throw new Error('Brand name is required.');
    }

    const id = data.id || 'brand-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36).substring(2, 6);
    const slug = data.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const now = new Date().toISOString();

    const newBrand: Brand = {
      id,
      name,
      slug,
      description: data.description?.trim() || '',
      logoUrl: data.logoUrl?.trim() || '',
      categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
      active: data.active !== false,
      createdAt: now,
      updatedAt: now
    };

    return storage.createBrand(newBrand);
  },

  updateBrand(id: string, updates: Partial<Brand>): Brand {
    return storage.updateBrand(id, updates);
  },

  deleteBrand(id: string): boolean {
    return storage.deleteBrand(id);
  }
};
