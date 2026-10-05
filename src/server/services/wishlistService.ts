import { storage } from '../config/storage.ts';
import type { Product } from '../../types/index.ts';

export const wishlistService = {
  getWishlist(userId: string): Product[] {
    const productIds = storage.getWishlist(userId);
    const products: Product[] = [];

    for (const pid of productIds) {
      const p = storage.getProductById(pid);
      if (p) {
        products.push(p);
      }
    }

    return products;
  },

  toggleWishlist(userId: string, productId: string): { inWishlist: boolean; wishlist: Product[] } {
    let items = storage.getWishlist(userId);
    let inWishlist: boolean;

    if (items.includes(productId)) {
      items = items.filter(id => id !== productId);
      inWishlist = false;
    } else {
      items.push(productId);
      inWishlist = true;
    }

    storage.saveWishlist(userId, items);
    const wishlist = this.getWishlist(userId);
    return { inWishlist, wishlist };
  }
};
