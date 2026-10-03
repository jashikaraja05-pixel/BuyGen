import type { Category, Product, Review } from '../types/index.ts';

// ZERO MOCK CATEGORIES: Store administrator creates categories explicitly.
export const initialCategories: Category[] = [];

// ZERO MOCK PRODUCTS: Admin creates and stocks all products explicitly.
export const initialProducts: Product[] = [];

// ZERO MOCK REVIEWS: Customer reviews are only generated from verified customer purchases.
export const initialReviews: Review[] = [];
