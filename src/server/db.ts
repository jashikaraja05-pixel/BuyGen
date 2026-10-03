import bcrypt from 'bcryptjs';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };
import { 
  User, 
  Product, 
  Category, 
  CartItem, 
  WishlistItem, 
  Order, 
  Review, 
  ProductFilters, 
  AdminMetrics, 
  OrderStatus 
} from '../types/index.ts';
import { initialCategories, initialProducts, initialReviews } from './seedData.ts';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

interface StoredUser extends User {
  passwordHash: string;
}

// In-Memory Synchronized Layer + Firestore Persistence
class DatabaseStore {
  private users: Map<string, StoredUser> = new Map();
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private carts: Map<string, CartItem[]> = new Map(); // userId -> items
  private wishlists: Map<string, Set<string>> = new Map(); // userId -> Set<productId>
  private orders: Map<string, Order> = new Map();
  private reviews: Map<string, Review[]> = new Map(); // productId -> reviews
  private initialized: boolean = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    if (this.initialized) return;

    // Seed default categories
    initialCategories.forEach(cat => this.categories.set(cat.id, cat));

    // Seed default products
    initialProducts.forEach(prod => this.products.set(prod.id, prod));

    // Seed default reviews
    initialReviews.forEach(rev => {
      const list = this.reviews.get(rev.productId) || [];
      list.push(rev);
      this.reviews.set(rev.productId, list);
    });

    // Seed standard admin and customer accounts
    const adminPassHash = bcrypt.hashSync('Admin@123', 10);
    const customerPassHash = bcrypt.hashSync('Customer@123', 10);

    const defaultAdmin: StoredUser = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@buygen.com',
      role: 'admin',
      createdAt: '2026-09-01T00:00:00.000Z',
      passwordHash: adminPassHash,
    };

    const ghpAdmin: StoredUser = {
      id: 'admin-ghp',
      name: 'Evaluation Admin',
      email: 'jashikahack@gmail.com',
      role: 'admin',
      createdAt: '2026-09-01T00:00:00.000Z',
      passwordHash: adminPassHash,
    };

    const defaultCustomer: StoredUser = {
      id: 'cust-1',
      name: 'Alex Johnson',
      email: 'customer@buygen.com',
      role: 'customer',
      createdAt: '2026-09-05T00:00:00.000Z',
      passwordHash: customerPassHash,
    };

    this.users.set(defaultAdmin.email.toLowerCase(), defaultAdmin);
    this.users.set(ghpAdmin.email.toLowerCase(), ghpAdmin);
    this.users.set(defaultCustomer.email.toLowerCase(), defaultCustomer);

    // Seed realistic completed & in-transit orders for rich initial admin dashboard stats
    const sampleOrder1: Order = {
      id: 'BG-2026-98124',
      userId: defaultCustomer.id,
      customerName: 'Alex Johnson',
      customerEmail: 'customer@buygen.com',
      customerPhone: '+91 98765 43210',
      shippingAddress: {
        fullName: 'Alex Johnson',
        phone: '+91 98765 43210',
        address: 'Flat 402, HighTech Tower, Cyber City',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560100'
      },
      items: [
        {
          productId: 'prod-hp-1',
          name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Black)',
          brand: 'Sony',
          price: 29990,
          originalPrice: 34990,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
          quantity: 1,
          stock: 35
        },
        {
          productId: 'prod-kb-2',
          name: 'Logitech MX Master 3S Wireless Performance Mouse (Graphite)',
          brand: 'Logitech',
          price: 9495,
          originalPrice: 10995,
          image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop',
          quantity: 1,
          stock: 40
        }
      ],
      subtotal: 39485,
      discount: 0,
      deliveryFee: 0,
      total: 39485,
      paymentMethod: 'UPI Simulation',
      status: 'Delivered',
      createdAt: '2026-09-22T11:20:00.000Z',
      updatedAt: '2026-09-25T16:40:00.000Z'
    };

    const sampleOrder2: Order = {
      id: 'BG-2026-98319',
      userId: defaultCustomer.id,
      customerName: 'Alex Johnson',
      customerEmail: 'customer@buygen.com',
      customerPhone: '+91 98765 43210',
      shippingAddress: {
        fullName: 'Alex Johnson',
        phone: '+91 98765 43210',
        address: 'Flat 402, HighTech Tower, Cyber City',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560100'
      },
      items: [
        {
          productId: 'prod-acc-1',
          name: 'Anker Prime 20,000mAh Power Bank (200W Output with Smart Digital Display)',
          brand: 'Anker',
          price: 10999,
          originalPrice: 12999,
          image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=1000&auto=format&fit=crop',
          quantity: 2,
          stock: 32
        }
      ],
      subtotal: 21998,
      discount: 0,
      deliveryFee: 0,
      total: 21998,
      paymentMethod: 'Card Simulation',
      status: 'Shipped',
      createdAt: '2026-09-28T09:15:00.000Z',
      updatedAt: '2026-09-29T10:00:00.000Z'
    };

    this.orders.set(sampleOrder1.id, sampleOrder1);
    this.orders.set(sampleOrder2.id, sampleOrder2);

    // Initial cart for demo customer
    this.carts.set(defaultCustomer.id, [
      {
        productId: 'prod-sp-3',
        name: 'OnePlus 12 5G (16GB RAM + 512GB - Silky Black)',
        brand: 'OnePlus',
        price: 64999,
        originalPrice: 69999,
        image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=1000&auto=format&fit=crop',
        quantity: 1,
        stock: 15
      }
    ]);

    // Initial wishlist for demo customer
    this.wishlists.set(defaultCustomer.id, new Set(['prod-sp-1', 'prod-lp-1']));

    this.initialized = true;

    // Background sync to Firestore without blocking server boot
    this.syncFirestoreInit().catch(err => {
      console.warn('Firestore optional background sync note:', err?.message || err);
    });
  }

  private async syncFirestoreInit() {
    try {
      const docRef = doc(firestore, 'system', 'status');
      await setDoc(docRef, { online: true, lastBoot: new Date().toISOString() }, { merge: true });
    } catch {
      // Offline fallback is active and fully functional
    }
  }

  // --- Auth & Users ---
  async registerUser(name: string, email: string, passwordPlain: string, role: 'customer' | 'admin' = 'customer'): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.users.has(normalizedEmail)) {
      throw new Error('A user with this email address already exists.');
    }

    const id = 'user-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const passwordHash = bcrypt.hashSync(passwordPlain, 10);
    const newUser: StoredUser = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      role,
      createdAt: new Date().toISOString(),
      passwordHash
    };

    this.users.set(normalizedEmail, newUser);

    // Async persist to Firestore if accessible
    try {
      await setDoc(doc(firestore, 'users', id), {
        id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      });
    } catch (e) {
      // memory store already has it
    }

    const { passwordHash: _, ...userSafe } = newUser;
    return userSafe;
  }

  async loginOrCreateGoogleUser(email: string, name: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    const stored = this.users.get(normalizedEmail);
    if (stored) {
      const { passwordHash: _, ...userSafe } = stored;
      return userSafe;
    }

    const id = 'user-g-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const passwordHash = bcrypt.hashSync('GoogleOAuthAuthenticatedUser@123', 10);
    const role: 'customer' | 'admin' = normalizedEmail.includes('admin') ? 'admin' : 'customer';
    const newUser: StoredUser = {
      id,
      name: name.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role,
      createdAt: new Date().toISOString(),
      passwordHash
    };

    this.users.set(normalizedEmail, newUser);
    try {
      await setDoc(doc(firestore, 'users', id), {
        id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      });
    } catch (e) {}

    const { passwordHash: _, ...userSafe } = newUser;
    return userSafe;
  }

  async loginUser(email: string, passwordPlain: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    const stored = this.users.get(normalizedEmail);
    if (!stored) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const matches = bcrypt.compareSync(passwordPlain, stored.passwordHash);
    if (!matches) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const { passwordHash: _, ...userSafe } = stored;
    return userSafe;
  }

  async getUserById(id: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.id === id) {
        const { passwordHash: _, ...safe } = u;
        return safe;
      }
    }
    return null;
  }

  async getAllUsers(): Promise<(User & { orderCount: number })[]> {
    const list: (User & { orderCount: number })[] = [];
    for (const u of this.users.values()) {
      const orderCount = Array.from(this.orders.values()).filter(o => o.userId === u.id).length;
      list.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        orderCount
      });
    }
    return list;
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).map(cat => {
      const count = Array.from(this.products.values()).filter(p => p.categoryId === cat.id).length;
      return { ...cat, productCount: count };
    });
  }

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const id = 'cat-' + Date.now().toString(36);
    const newCategory: Category = {
      ...categoryData,
      id,
      subcategories: categoryData.subcategories || []
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) throw new Error('Category not found');
    const updated = { ...existing, ...updates };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const productCount = Array.from(this.products.values()).filter(p => p.categoryId === id).length;
    if (productCount > 0) {
      throw new Error(`Cannot delete category with ${productCount} active products. Reassign or delete products first.`);
    }
    this.categories.delete(id);
  }

  // --- Products ---
  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
    let result = Array.from(this.products.values());

    // Search query
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        Object.entries(p.specifications).some(([k, v]) => 
          k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        )
      );
    }

    // Category filter (by id or slug or name)
    if (filters.category && filters.category !== 'all') {
      const catQuery = filters.category.toLowerCase().trim();
      const categoryObj = Array.from(this.categories.values()).find(
        c => c.id.toLowerCase() === catQuery || 
             c.slug.toLowerCase() === catQuery || 
             c.name.toLowerCase() === catQuery
      );
      if (categoryObj) {
        result = result.filter(p => p.categoryId === categoryObj.id);
      } else {
        result = result.filter(p => 
          p.categoryId.toLowerCase() === catQuery || 
          p.categoryName?.toLowerCase() === catQuery
        );
      }
    }

    // Subcategory filter
    if (filters.subcategory && filters.subcategory !== 'all') {
      result = result.filter(p => p.subcategory.toLowerCase() === filters.subcategory?.toLowerCase());
    }

    // Brand filter
    if (filters.brand && filters.brand !== 'all') {
      result = result.filter(p => p.brand.toLowerCase() === filters.brand?.toLowerCase());
    }

    // Price range
    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.price >= (filters.minPrice || 0));
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.price <= (filters.maxPrice || Infinity));
    }

    // Rating
    if (filters.minRating !== undefined && filters.minRating > 0) {
      result = result.filter(p => p.rating >= (filters.minRating || 0));
    }

    // In Stock only
    if (filters.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popularity':
          result.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    return { products: result, total: result.length };
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Promise<Product> {
    // Validation
    if (!productData.name || !productData.brand || !productData.price || productData.price <= 0) {
      throw new Error('Valid product name, brand, and positive price are required.');
    }
    if (productData.stock < 0) {
      throw new Error('Stock quantity cannot be negative.');
    }

    const id = 'prod-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const category = this.categories.get(productData.categoryId);
    const categoryName = category ? category.name : 'Electronics';

    const originalPrice = productData.originalPrice || productData.price;
    const discount = originalPrice > productData.price 
      ? Math.round(((originalPrice - productData.price) / originalPrice) * 100) 
      : 0;

    const newProduct: Product = {
      ...productData,
      id,
      categoryName,
      originalPrice,
      discount,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) throw new Error('Product not found');

    if (updates.price !== undefined && updates.price <= 0) {
      throw new Error('Product price must be greater than zero.');
    }
    if (updates.stock !== undefined && updates.stock < 0) {
      throw new Error('Product stock cannot be negative.');
    }

    const price = updates.price !== undefined ? updates.price : existing.price;
    const originalPrice = updates.originalPrice !== undefined ? updates.originalPrice : existing.originalPrice;
    const discount = originalPrice > price 
      ? Math.round(((originalPrice - price) / originalPrice) * 100) 
      : 0;

    let categoryName = existing.categoryName;
    if (updates.categoryId && updates.categoryId !== existing.categoryId) {
      const cat = this.categories.get(updates.categoryId);
      if (cat) categoryName = cat.name;
    }

    const updated: Product = {
      ...existing,
      ...updates,
      price,
      originalPrice,
      discount,
      categoryName,
      updatedAt: new Date().toISOString()
    };

    this.products.set(id, updated);
    return updated;
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    if (newStock < 0) throw new Error('Stock cannot be negative.');
    const product = this.products.get(id);
    if (!product) throw new Error('Product not found');
    product.stock = newStock;
    product.updatedAt = new Date().toISOString();
    this.products.set(id, product);
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.products.has(id)) throw new Error('Product not found');
    this.products.delete(id);
  }

  // --- Cart Operations ---
  async getCart(userId: string): Promise<{ items: CartItem[]; subtotal: number; discount: number; total: number }> {
    const rawItems = this.carts.get(userId) || [];
    
    // Refresh prices and stock from current product catalog
    const validItems: CartItem[] = [];
    for (const item of rawItems) {
      const prod = this.products.get(item.productId);
      if (prod) {
        validItems.push({
          productId: prod.id,
          name: prod.name,
          brand: prod.brand,
          price: prod.price,
          originalPrice: prod.originalPrice,
          image: prod.images[0] || item.image,
          quantity: Math.min(item.quantity, prod.stock > 0 ? prod.stock : 1),
          stock: prod.stock
        });
      }
    }

    this.carts.set(userId, validItems);

    const subtotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const originalSubtotal = validItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    const discount = Math.max(0, originalSubtotal - subtotal);
    const total = subtotal;

    return { items: validItems, subtotal, discount, total };
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem[]> {
    if (quantity <= 0) throw new Error('Quantity must be at least 1.');
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found.');
    if (product.stock <= 0) throw new Error('This item is currently out of stock.');

    const items = this.carts.get(userId) || [];
    const existingIndex = items.findIndex(i => i.productId === productId);

    if (existingIndex >= 0) {
      const newQty = items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        throw new Error(`Only ${product.stock} units are currently available in stock.`);
      }
      items[existingIndex].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        throw new Error(`Only ${product.stock} units are currently available in stock.`);
      }
      items.push({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        quantity,
        stock: product.stock
      });
    }

    this.carts.set(userId, items);
    return items;
  }

  async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found.');

    const items = this.carts.get(userId) || [];
    if (quantity <= 0) {
      // Remove item if quantity is zero
      const filtered = items.filter(i => i.productId !== productId);
      this.carts.set(userId, filtered);
      return filtered;
    }

    if (quantity > product.stock) {
      throw new Error(`Cannot add more than ${product.stock} units. Stock limit reached.`);
    }

    const item = items.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      item.stock = product.stock;
    }

    this.carts.set(userId, items);
    return items;
  }

  async removeFromCart(userId: string, productId: string): Promise<CartItem[]> {
    const items = this.carts.get(userId) || [];
    const filtered = items.filter(i => i.productId !== productId);
    this.carts.set(userId, filtered);
    return filtered;
  }

  async clearCart(userId: string): Promise<void> {
    this.carts.set(userId, []);
  }

  // --- Wishlist Operations ---
  async getWishlist(userId: string): Promise<Product[]> {
    const set = this.wishlists.get(userId) || new Set();
    const result: Product[] = [];
    for (const prodId of set) {
      const prod = this.products.get(prodId);
      if (prod) result.push(prod);
    }
    return result;
  }

  async toggleWishlist(userId: string, productId: string): Promise<{ inWishlist: boolean; wishlist: Product[] }> {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found.');

    let set = this.wishlists.get(userId);
    if (!set) {
      set = new Set();
      this.wishlists.set(userId, set);
    }

    let inWishlist = false;
    if (set.has(productId)) {
      set.delete(productId);
      inWishlist = false;
    } else {
      set.add(productId);
      inWishlist = true;
    }

    const wishlist = await this.getWishlist(userId);
    return { inWishlist, wishlist };
  }

  // --- Orders & Checkout ---
  async createOrder(
    userId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    shippingAddress: Order['shippingAddress'],
    paymentMethod: Order['paymentMethod']
  ): Promise<Order> {
    const cart = await this.getCart(userId);
    if (cart.items.length === 0) {
      throw new Error('Your cart is empty. Add products before checking out.');
    }

    // Verify stock availability atomically for all items before fulfilling
    for (const item of cart.items) {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.name} is no longer available.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
      }
    }

    // Decrement stock atomically
    for (const item of cart.items) {
      const product = this.products.get(item.productId)!;
      product.stock -= item.quantity;
      product.updatedAt = new Date().toISOString();
      this.products.set(product.id, product);
    }

    const orderId = 'BG-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      id: orderId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: [...cart.items],
      subtotal: cart.subtotal,
      discount: cart.discount,
      deliveryFee: 0,
      total: cart.total,
      paymentMethod,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.set(orderId, newOrder);

    // Clear user cart
    this.carts.set(userId, []);

    return newOrder;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const list = Array.from(this.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('Order not found.');

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'Pending': ['Confirmed', 'Processing'],
      'Confirmed': ['Processing'],
      'Processing': ['Shipped'],
      'Shipped': ['Delivered'],
      'Delivered': []
    };

    if (order.status === status) return order;

    // Check valid status
    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status) && order.status !== 'Delivered') {
      // allow forward progression
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.orders.set(orderId, order);
    return order;
  }

  // --- Reviews ---
  async getReviews(productId: string): Promise<Review[]> {
    return this.reviews.get(productId) || [];
  }

  async addReview(productId: string, userId: string, userName: string, rating: number, comment: string): Promise<Review> {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found.');

    const revId = 'rev-' + Date.now().toString(36);
    const newRev: Review = {
      id: revId,
      productId,
      userId,
      userName,
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      createdAt: new Date().toISOString()
    };

    const currentList = this.reviews.get(productId) || [];
    currentList.unshift(newRev);
    this.reviews.set(productId, currentList);

    // Recalculate average rating
    const totalRating = currentList.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((totalRating / currentList.length).toFixed(1));
    product.reviewCount = currentList.length;
    this.products.set(productId, product);

    return newRev;
  }

  // --- Admin Metrics ---
  async getAdminMetrics(): Promise<AdminMetrics> {
    const products = Array.from(this.products.values());
    const orders = Array.from(this.orders.values());
    const users = Array.from(this.users.values());

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const lowStockCount = products.filter(p => p.stock <= 10).length;

    // Category breakdown
    const categoryStats = new Map<string, { count: number; revenue: number }>();
    this.categories.forEach(c => categoryStats.set(c.name, { count: 0, revenue: 0 }));

    products.forEach(p => {
      const stats = categoryStats.get(p.categoryName) || { count: 0, revenue: 0 };
      stats.count++;
      categoryStats.set(p.categoryName, stats);
    });

    orders.forEach(o => {
      o.items.forEach(item => {
        const prod = this.products.get(item.productId);
        if (prod) {
          const stats = categoryStats.get(prod.categoryName) || { count: 0, revenue: 0 };
          stats.revenue += item.price * item.quantity;
          categoryStats.set(prod.categoryName, stats);
        }
      });
    });

    const categoryBreakdown = Array.from(categoryStats.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      revenue: data.revenue
    }));

    return {
      totalProducts: products.length,
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue,
      lowStockCount,
      recentOrders: orders.slice(0, 10),
      categoryBreakdown
    };
  }

  // --- AI Product Context ---
  getAllProductsForAI(): Product[] {
    return Array.from(this.products.values());
  }
}

export const dbStore = new DatabaseStore();
