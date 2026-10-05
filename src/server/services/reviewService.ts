import { storage } from '../config/storage.ts';
import type { Review, Order, Product } from '../../types/index.ts';

export const reviewService = {
  getVerifiedPurchaseOrders(userId: string, productId: string) {
    const userOrders: Order[] = storage.getUserOrders(userId);
    const existingReviews: Review[] = storage.getProductReviews(productId).filter(r => r.userId === userId);

    const verifiedOrders: any[] = [];

    for (const order of userOrders) {
      const match = order.items.find(i => i.productId === productId);
      if (match) {
        const existingRev = existingReviews.find(r => r.orderId === order.id);
        verifiedOrders.push({
          orderId: order.id,
          orderDate: order.createdAt,
          status: order.status,
          quantity: match.quantity,
          selectedColor: match.selectedColor,
          price: match.price,
          alreadyReviewed: Boolean(existingRev),
          existingReview: existingRev || null
        });
      }
    }

    return {
      hasPurchased: verifiedOrders.length > 0,
      orders: verifiedOrders
    };
  },

  addReview(
    userId: string,
    userName: string,
    productId: string,
    rating: number,
    comment: string,
    orderId: string
  ): { review: Review; product: Product; reviews: Review[] } {
    // Verify order exists and belongs to user
    const order = storage.getOrderById(orderId);
    if (!order) {
      throw new Error('Associated order was not found.');
    }

    if (order.userId !== userId) {
      throw new Error('You can only review purchases from your own verified orders.');
    }

    const itemExists = order.items.some(i => i.productId === productId);
    if (!itemExists) {
      throw new Error('This product was not part of the specified order.');
    }

    const reviewId = 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const cleanRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    const cleanComment = (comment || '').trim();

    const newReview: Review = {
      id: reviewId,
      productId,
      orderId,
      userId,
      userName: userName || 'Verified Customer',
      rating: cleanRating,
      comment: cleanComment,
      verifiedPurchase: true,
      orderDate: order.createdAt,
      createdAt: now,
      updatedAt: now
    };

    storage.createReview(newReview);
    const product = storage.getProductById(productId)!;
    const reviews = storage.getProductReviews(productId);

    return {
      review: newReview,
      product,
      reviews
    };
  }
};
