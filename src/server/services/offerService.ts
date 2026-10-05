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
      discountType: data.discountType || 'percentage',
      discountPercentage: Number(data.discountPercentage) || (data.discountType === 'percentage' ? Number(data.discountValue) || 10 : undefined),
      discountValue: Number(data.discountValue) || Number(data.discountPercentage) || 0,
      category: data.category || 'all',
      brand: data.brand || 'all',
      productId: data.productId || 'all',
      minPurchase: Number(data.minPurchase) || 0,
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      promoCode: (data.promoCode || 'BUYGEN').trim().toUpperCase(),
      imageUrl: data.imageUrl || '',
      bgGradient: data.bgGradient || 'from-indigo-950 via-purple-950 to-slate-950',
      active: data.active !== false,
      createdAt: now,
      updatedAt: now
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
