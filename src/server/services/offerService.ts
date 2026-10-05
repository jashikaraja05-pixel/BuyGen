import { storage } from '../config/storage.ts';
import type { OfferBanner } from '../../types/index.ts';

export const offerService = {
  getOffers(): OfferBanner[] {
    return storage.getOffers();
  },

  getAdminOffers(): OfferBanner[] {
    return storage.getAdminOffers();
  },

  createOffer(data: Partial<OfferBanner>): OfferBanner {
    const id = data.id || 'offer-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newOffer: OfferBanner = {
      id,
      title: (data.title || 'Special Promotion').trim(),
      subtitle: data.subtitle || '',
      badge: data.badge || 'LIMITED TIME DEAL',
      discountPercentage: Number(data.discountPercentage) || 10,
      promoCode: data.promoCode || 'BUYGEN',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop',
      bgGradient: data.bgGradient || 'from-cyan-600 via-indigo-600 to-purple-800',
      active: data.active !== false,
      createdAt: now
    };

    return storage.createOffer(newOffer);
  },

  updateOffer(id: string, updates: Partial<OfferBanner>): OfferBanner {
    return storage.updateOffer(id, updates);
  },

  deleteOffer(id: string): boolean {
    return storage.deleteOffer(id);
  }
};
