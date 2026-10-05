import { storage } from '../config/storage.ts';
import type { Product, ProductFilters, Review, Order } from '../../types/index.ts';

export const productService = {
  getAllProducts(filters: ProductFilters = {}): { products: Product[]; total: number } {
    return storage.getAllProducts(filters);
  },

  getProductById(id: string): { product: Product | null; reviews: Review[]; related: Product[] } {
    const product = storage.getProductById(id);
    if (!product) {
      return { product: null, reviews: [], related: [] };
    }

    const reviews = storage.getProductReviews(id);
    const related = storage.getAllProducts({ category: product.categoryId }).products
      .filter(p => p.id !== id)
      .slice(0, 4);

    return { product, reviews, related };
  },

  createProduct(data: Partial<Product>, adminEmail?: string): Product {
    const id = data.id || 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const price = Number(data.price) || 0;
    const originalPrice = Number(data.originalPrice) || price;
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const stock = Number(data.stock) >= 0 ? Math.floor(Number(data.stock)) : 0;

    const newProduct: Product = {
      id,
      name: (data.name || 'New Product').trim(),
      brand: (data.brand || 'BUYGEN').trim(),
      categoryId: data.categoryId || 'cat-electronics',
      categoryName: data.categoryName || 'Consumer Electronics',
      subcategory: data.subcategory || 'General',
      description: data.description || '',
      price,
      originalPrice,
      discount,
      stock,
      rating: Number(data.rating) || 5.0,
      reviewCount: Number(data.reviewCount) || 1,
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
      ],
      colors: Array.isArray(data.colors) ? data.colors : (Array.isArray(data.availableColours) ? data.availableColours : []),
      availableColours: Array.isArray(data.availableColours) ? data.availableColours : (Array.isArray(data.colors) ? data.colors : []),
      specifications: data.specifications || {},
      featured: Boolean(data.featured),
      trending: Boolean(data.trending),
      newArrival: Boolean(data.newArrival),
      badge: data.badge || (data.newArrival ? 'New Launch' : ''),
      adminEmail: adminEmail || 'admin@buygen.com',
      createdAt: now,
      updatedAt: now
    };

    return storage.createProduct(newProduct);
  },

  updateProduct(id: string, updates: Partial<Product>): Product {
    return storage.updateProduct(id, updates);
  },

  updateStock(id: string, stock: number): Product {
    return storage.updateStock(id, stock);
  },

  deleteProduct(id: string): boolean {
    return storage.deleteProduct(id);
  },

  createProductsBatch(productsData: Partial<Product>[], adminEmail?: string): Product[] {
    const now = new Date().toISOString();
    const products: Product[] = productsData.map(data => {
      const id = data.id || 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const price = Number(data.price) || 0;
      const originalPrice = Number(data.originalPrice) || price;
      const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
      const stock = Number(data.stock) >= 0 ? Math.floor(Number(data.stock)) : 0;

      return {
        id,
        name: (data.name || 'New Product').trim(),
        brand: (data.brand || 'BUYGEN').trim(),
        categoryId: data.categoryId || 'cat-electronics',
        categoryName: data.categoryName || 'Consumer Electronics',
        subcategory: data.subcategory || 'General',
        description: data.description || '',
        price,
        originalPrice,
        discount,
        stock,
        rating: Number(data.rating) || 5.0,
        reviewCount: Number(data.reviewCount) || 1,
        images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
        ],
        colors: Array.isArray(data.colors) ? data.colors : [],
        availableColours: Array.isArray(data.availableColours) ? data.availableColours : [],
        specifications: data.specifications || {},
        featured: Boolean(data.featured),
        trending: Boolean(data.trending),
        newArrival: Boolean(data.newArrival),
        badge: data.badge,
        adminEmail: adminEmail || 'admin@buygen.com',
        createdAt: now,
        updatedAt: now
      };
    });

    return storage.batchCreateProducts(products);
  },

  getProductActivity(id: string) {
    const product = storage.getProductById(id);
    if (!product) {
      throw new Error('Product not found.');
    }

    const allOrders: Order[] = storage.getAllOrders();
    const matchingActivity: any[] = [];
    let totalUnitsSold = 0;
    let totalRevenue = 0;

    for (const order of allOrders) {
      const matchItem = order.items.find(i => i.productId === id);
      if (matchItem) {
        totalUnitsSold += matchItem.quantity;
        totalRevenue += matchItem.price * matchItem.quantity;

        matchingActivity.push({
          orderId: order.id,
          userId: order.userId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          quantity: matchItem.quantity,
          priceAtPurchase: matchItem.price,
          itemTotal: matchItem.price * matchItem.quantity,
          orderTotal: order.total,
          paymentMethod: order.paymentMethod,
          orderStatus: order.status,
          orderDate: order.createdAt,
          selectedColor: matchItem.selectedColor
        });
      }
    }

    return {
      product,
      orders: matchingActivity,
      totalUnitsSold,
      totalRevenue
    };
  },

  cleanCatalog() {
    return storage.cleanCatalog();
  }
};
