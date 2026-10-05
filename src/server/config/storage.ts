import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts, initialReviews } from '../seedData.ts';
import { firestore, doc, setDoc, deleteDoc, getDocs, collections } from './firebase.ts';
import { getExpandedSearchTokens } from '../../lib/spellingNormalizer.ts';
import type { 
  User, 
  Product, 
  Category, 
  Brand,
  CartItem, 
  Order, 
  Review, 
  PaymentMethodConfig, 
  OfferBanner, 
  SearchLog, 
  UserLoginLog, 
  ProductFilters, 
  OrderStatus 
} from '../../types/index.ts';

export interface StoredUser extends User {
  passwordHash: string;
}

export interface StockReservation {
  id: string;
  items: { productId: string; quantity: number }[];
  expiresAt: number; // timestamp ms
}

interface DatabaseSchema {
  users: Record<string, StoredUser>;
  products: Record<string, Product>;
  categories: Record<string, Category>;
  brands: Record<string, Brand>;
  carts: Record<string, CartItem[]>;
  wishlists: Record<string, string[]>;
  orders: Record<string, Order>;
  reviews: Record<string, Review>;
  offers: Record<string, OfferBanner>;
  paymentMethods: Record<string, PaymentMethodConfig>;
  reservations: Record<string, StockReservation>;
  searchLogs: SearchLog[];
  loginLogs: UserLoginLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefined).filter(x => x !== undefined);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = cleanUndefined(v);
    }
  }
  return out;
}

function safeSetDoc(docRef: any, data: any, options?: any) {
  try {
    const cleaned = cleanUndefined(data);
    setDoc(docRef, cleaned, options).catch((err) => {
      console.warn('[Firestore safeSetDoc warning]:', err?.message || err);
    });
  } catch (err: any) {
    console.warn('[Firestore safeSetDoc caught]:', err?.message || err);
  }
}

function safeDeleteDoc(docRef: any) {
  try {
    deleteDoc(docRef).catch((err) => {
      console.warn('[Firestore safeDeleteDoc warning]:', err?.message || err);
    });
  } catch (err: any) {
    console.warn('[Firestore safeDeleteDoc caught]:', err?.message || err);
  }
}

const defaultPaymentMethods: PaymentMethodConfig[] = [
  {
    id: 'pm-upi',
    name: 'UPI / Dynamic QR Code Pay',
    type: 'upi',
    enabled: true,
    description: 'Scan & pay with any UPI App (Google Pay, PhonePe, Paytm, BHIM)',
    upiId: 'buygen.electronics@okhdfcbank',
    payeeName: 'BUYGEN Electronics Store',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Dbuygen.electronics%40okhdfcbank%26pn%3DBUYGEN%2520Electronics%26cu%3DINR',
    instructions: 'Scan the official store QR code with your preferred UPI app, verify the order total, and confirm simulated payment.'
  },
  {
    id: 'pm-cod',
    name: 'Cash on Delivery (COD)',
    type: 'cod',
    enabled: true,
    description: 'Pay via Cash or UPI QR to delivery executive upon doorstep arrival',
    instructions: 'Keep exact cash handy or scan delivery partner QR at the time of doorstep delivery.'
  },
  {
    id: 'pm-card',
    name: 'Credit / Debit Card',
    type: 'card',
    enabled: true,
    description: 'Visa, MasterCard, RuPay & American Express (Simulated Checkout)',
    instructions: 'Enter simulated card details for instant verified sandbox checkout.'
  },
  {
    id: 'pm-netbanking',
    name: 'Net Banking',
    type: 'netbanking',
    enabled: true,
    description: 'HDFC, ICICI, SBI, Axis, Kotak & all major banks',
    instructions: 'Select your preferred bank to proceed with direct banking verification.'
  }
];

class PersistentStorage {
  private data: DatabaseSchema;
  private initialized = false;

  constructor() {
    this.data = this.loadInitialData();
  }

  private loadInitialData(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {}
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.users) {
          if (!parsed.brands) parsed.brands = {};
          if (!parsed.reservations) parsed.reservations = {};
          return parsed;
        }
      } catch (err) {
        console.warn('[PersistentStorage] Failed to read database.json, re-initializing:', err);
      }
    }

    // Completely dynamic initial state - NO hardcoded products or categories!
    const schema: DatabaseSchema = {
      users: {},
      products: {},
      categories: {},
      brands: {},
      carts: {},
      wishlists: {},
      orders: {},
      reviews: {},
      offers: {},
      paymentMethods: {},
      reservations: {},
      searchLogs: [],
      loginLogs: []
    };

    // Seed default admin account so the store administrator can log in
    const adminId = 'admin_master_1';
    schema.users[adminId] = {
      id: adminId,
      name: 'Store Administrator',
      email: 'admin@buygen.com',
      passwordHash: bcrypt.hashSync('Admin@123', 10),
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    // Seed initial payment methods
    for (const pm of defaultPaymentMethods) {
      schema.paymentMethods[pm.id] = pm;
    }

    this.saveDataDirect(schema);
    return schema;
  }

  private saveDataDirect(schema: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = DB_FILE + '.tmp';
      fs.writeFileSync(tmpFile, JSON.stringify(schema, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[PersistentStorage] Failed to write database.json:', err);
    }
  }

  private persist() {
    this.saveDataDirect(this.data);
  }

  async initAndSync() {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Sync Categories from Cloud Firestore
    try {
      const catSnap = await getDocs(collections.categories);
      this.data.categories = {};
      if (!catSnap.empty) {
        for (const docSnap of catSnap.docs) {
          const c = docSnap.data() as Category;
          if (c && c.id) {
            this.data.categories[c.id] = c;
          }
        }
      }
    } catch (err) {
      console.warn('[Storage] Categories sync note:', err);
    }

    // 2. Sync Brands from Cloud Firestore
    try {
      const brandSnap = await getDocs(collections.brands);
      this.data.brands = {};
      if (!brandSnap.empty) {
        for (const docSnap of brandSnap.docs) {
          const b = docSnap.data() as Brand;
          if (b && b.id) {
            this.data.brands[b.id] = b;
          }
        }
      }
    } catch (err) {
      console.warn('[Storage] Brands sync note:', err);
    }

    // 3. Sync Products from Cloud Firestore
    try {
      const prodSnap = await getDocs(collections.products);
      this.data.products = {};
      if (!prodSnap.empty) {
        for (const docSnap of prodSnap.docs) {
          const p = docSnap.data() as Product;
          if (p && p.id) {
            this.data.products[p.id] = p;
          }
        }
      }
    } catch (err) {
      console.warn('[Storage] Products sync note:', err);
    }

    // 4. Sync Offers from Cloud Firestore
    try {
      const offerSnap = await getDocs(collections.offers);
      if (!offerSnap.empty) {
        for (const docSnap of offerSnap.docs) {
          const o = docSnap.data() as OfferBanner;
          if (o && o.id) {
            this.data.offers[o.id] = o;
          }
        }
      }
    } catch {}

    // 5. Sync Payment Methods from Cloud Firestore
    try {
      const pmSnap = await getDocs(collections.paymentMethods);
      if (!pmSnap.empty) {
        for (const docSnap of pmSnap.docs) {
          const pm = docSnap.data() as PaymentMethodConfig;
          if (pm && pm.id) {
            this.data.paymentMethods[pm.id] = pm;
          }
        }
      } else {
        for (const pm of defaultPaymentMethods) {
          this.data.paymentMethods[pm.id] = pm;
          safeSetDoc(doc(firestore, 'payment_methods', pm.id), pm);
        }
      }
    } catch {}

    // 6. Sync Orders from Cloud Firestore
    try {
      const orderSnap = await getDocs(collections.orders);
      if (!orderSnap.empty) {
        for (const docSnap of orderSnap.docs) {
          const o = docSnap.data() as Order;
          if (o && o.id) {
            this.data.orders[o.id] = o;
          }
        }
      }
    } catch {}

    // 7. Sync Users from Cloud Firestore
    try {
      const userSnap = await getDocs(collections.users);
      if (!userSnap.empty) {
        for (const docSnap of userSnap.docs) {
          const u = docSnap.data() as StoredUser;
          if (u && u.id) {
            this.data.users[u.id] = u;
          }
        }
      }
    } catch {}

    // 8. Ensure default administrator exists in both Firestore and cache
    const hasAdmin = Object.values(this.data.users).some(u => u.email === 'admin@buygen.com' && u.role === 'admin');
    if (!hasAdmin) {
      const adminId = 'admin_master_1';
      const adminUser: StoredUser = {
        id: adminId,
        name: 'Store Administrator',
        email: 'admin@buygen.com',
        passwordHash: bcrypt.hashSync('Admin@123', 10),
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      this.data.users[adminId] = adminUser;
      safeSetDoc(doc(firestore, 'users', adminId), adminUser);
      safeSetDoc(doc(firestore, 'admins', adminId), { email: 'admin@buygen.com', role: 'admin' });
    }

    this.persist();
  }

  // --- Users ---
  getUserById(id: string): StoredUser | null {
    return this.data.users[id] || null;
  }

  getUserByEmail(email: string): StoredUser | null {
    const clean = email.toLowerCase().trim();
    return Object.values(this.data.users).find(u => u.email.toLowerCase() === clean) || null;
  }

  createUser(user: StoredUser): StoredUser {
    this.data.users[user.id] = user;
    this.persist();

    // Mirror complete user record in Firestore
    safeSetDoc(doc(firestore, 'users', user.id), {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });

    return user;
  }

  updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    const cur = this.data.users[id];
    if (!cur) return null;
    const updated = { ...cur, ...updates, id };
    this.data.users[id] = updated;
    this.persist();

    safeSetDoc(doc(firestore, 'users', id), {
      id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      lastLogin: updated.lastLogin
    }, { merge: true });

    return updated;
  }

  getAllUsers(): StoredUser[] {
    return Object.values(this.data.users);
  }

  // --- Categories ---
  getAllCategories(): Category[] {
    const prods = Object.values(this.data.products);
    return Object.values(this.data.categories).map(cat => ({
      ...cat,
      productCount: prods.filter(p => p.categoryId === cat.id || p.categoryName?.toLowerCase() === cat.name?.toLowerCase()).length
    }));
  }

  getCategoryById(id: string): Category | null {
    return this.data.categories[id] || null;
  }

  createCategory(cat: Category): Category {
    this.data.categories[cat.id] = cat;
    this.persist();
    safeSetDoc(doc(firestore, 'categories', cat.id), cat);
    return cat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category {
    const cur = this.data.categories[id];
    if (!cur) throw new Error(`Category "${id}" not found.`);
    const updated = { ...cur, ...updates, id };
    this.data.categories[id] = updated;
    this.persist();
    safeSetDoc(doc(firestore, 'categories', id), updated);
    return updated;
  }

  deleteCategory(id: string): boolean {
    delete this.data.categories[id];
    this.persist();
    safeDeleteDoc(doc(firestore, 'categories', id));
    return true;
  }

  clearAllCategories(): boolean {
    for (const id of Object.keys(this.data.categories)) {
      safeDeleteDoc(doc(firestore, 'categories', id));
    }
    this.data.categories = {};
    this.persist();
    return true;
  }

  // --- Brands ---
  getAllBrands(category?: string): Brand[] {
    let brands = Object.values(this.data.brands);
    if (category && category !== 'all') {
      const cleanCat = category.toLowerCase();
      brands = brands.filter(b => {
        if (!b.categoryIds || b.categoryIds.length === 0) return true; // brand is general
        return b.categoryIds.some(cid => cid.toLowerCase() === cleanCat);
      });
    }
    return brands;
  }

  getBrandById(id: string): Brand | null {
    return this.data.brands[id] || null;
  }

  createBrand(brand: Brand): Brand {
    this.data.brands[brand.id] = brand;
    this.persist();
    safeSetDoc(doc(firestore, 'brands', brand.id), brand);
    return brand;
  }

  updateBrand(id: string, updates: Partial<Brand>): Brand {
    const cur = this.data.brands[id];
    if (!cur) throw new Error(`Brand "${id}" not found.`);
    const updated = { ...cur, ...updates, id, updatedAt: new Date().toISOString() };
    this.data.brands[id] = updated;
    this.persist();
    safeSetDoc(doc(firestore, 'brands', id), updated);
    return updated;
  }

  deleteBrand(id: string): boolean {
    delete this.data.brands[id];
    this.persist();
    safeDeleteDoc(doc(firestore, 'brands', id));
    return true;
  }

  clearAllBrands(): boolean {
    for (const id of Object.keys(this.data.brands)) {
      safeDeleteDoc(doc(firestore, 'brands', id));
    }
    this.data.brands = {};
    this.persist();
    return true;
  }

  // --- Products ---
  getAllProducts(filters: ProductFilters = {}): { products: Product[]; total: number } {
    let products = Object.values(this.data.products);

    if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase();
      products = products.filter(p => 
        (p.categoryId && p.categoryId.toLowerCase() === cat) || 
        (p.categoryName && p.categoryName.toLowerCase() === cat)
      );
    }

    if (filters.subcategory && filters.subcategory !== 'all') {
      const sub = filters.subcategory.toLowerCase();
      products = products.filter(p => p.subcategory && p.subcategory.toLowerCase() === sub);
    }

    if (filters.brand && filters.brand !== 'all') {
      const brand = filters.brand.toLowerCase();
      products = products.filter(p => p.brand && p.brand.toLowerCase() === brand);
    }

    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      products = products.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      products = products.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.minRating !== undefined && !isNaN(filters.minRating)) {
      products = products.filter(p => (p.rating || 0) >= filters.minRating!);
    }

    if (filters.inStockOnly) {
      products = products.filter(p => p.stock > 0);
    }

    if (filters.stockStatus) {
      if (filters.stockStatus === 'instock') products = products.filter(p => p.stock > 5);
      else if (filters.stockStatus === 'lowstock') products = products.filter(p => p.stock > 0 && p.stock <= 5);
      else if (filters.stockStatus === 'outofstock') products = products.filter(p => p.stock === 0);
    }

    if (filters.search && filters.search.trim()) {
      const rawSearch = filters.search.trim().toLowerCase();
      const tokens = getExpandedSearchTokens(rawSearch);

      products = products.filter(p => {
        const text = `${p.name} ${p.brand} ${p.categoryName} ${p.subcategory || ''} ${p.description || ''}`.toLowerCase();
        if (text.includes(rawSearch)) return true;
        return tokens.some(token => text.includes(token));
      });
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'popularity':
          products.sort((a, b) => ((b.unitsSold || 0) + (b.orderCount || 0)) - ((a.unitsSold || 0) + (a.orderCount || 0)));
          break;
        case 'newest':
        default:
          products.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          break;
      }
    }

    return { products, total: products.length };
  }

  getProductById(id: string): Product | null {
    return this.data.products[id] || null;
  }

  createProduct(product: Product): Product {
    this.data.products[product.id] = product;
    this.persist();

    safeSetDoc(doc(firestore, 'products', product.id), product);
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product {
    const cur = this.data.products[id];
    if (!cur) throw new Error(`Product "${id}" not found.`);
    const updated: Product = { ...cur, ...updates, id, updatedAt: new Date().toISOString() };
    this.data.products[id] = updated;
    this.persist();

    safeSetDoc(doc(firestore, 'products', id), updated);
    return updated;
  }

  updateStock(id: string, stock: number): Product {
    const cur = this.data.products[id];
    if (!cur) throw new Error(`Product "${id}" not found.`);
    const updated: Product = { ...cur, stock: Math.max(0, Math.floor(stock)), updatedAt: new Date().toISOString() };
    this.data.products[id] = updated;
    this.persist();

    safeSetDoc(doc(firestore, 'products', id), updated);
    return updated;
  }

  deleteProduct(id: string): boolean {
    delete this.data.products[id];
    this.persist();
    safeDeleteDoc(doc(firestore, 'products', id));
    return true;
  }

  batchCreateProducts(products: Product[]): Product[] {
    for (const p of products) {
      this.data.products[p.id] = p;
      safeSetDoc(doc(firestore, 'products', p.id), p);
    }
    this.persist();
    return products;
  }

  cleanCatalog() {
    const prodCount = Object.keys(this.data.products).length;
    const catCount = Object.keys(this.data.categories).length;
    const brandCount = Object.keys(this.data.brands).length;

    for (const id of Object.keys(this.data.products)) {
      safeDeleteDoc(doc(firestore, 'products', id));
    }
    for (const id of Object.keys(this.data.categories)) {
      safeDeleteDoc(doc(firestore, 'categories', id));
    }
    for (const id of Object.keys(this.data.brands)) {
      safeDeleteDoc(doc(firestore, 'brands', id));
    }

    this.data.products = {};
    this.data.categories = {};
    this.data.brands = {};
    this.persist();
    return { deletedProducts: prodCount, deletedCategories: catCount, deletedBrands: brandCount };
  }

  // Seed starter catalog on explicit admin demand
  seedStarterCatalog() {
    for (const cat of initialCategories) {
      this.data.categories[cat.id] = cat;
      safeSetDoc(doc(firestore, 'categories', cat.id), cat);
    }

    // Extract brands from initial products
    const brandsSet = new Set<string>();
    for (const p of initialProducts) {
      if (p.brand) brandsSet.add(p.brand);
    }

    for (const bName of brandsSet) {
      const bId = 'brand-' + bName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const brand: Brand = {
        id: bId,
        name: bName,
        slug: bName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        active: true,
        createdAt: new Date().toISOString()
      };
      this.data.brands[brand.id] = brand;
      safeSetDoc(doc(firestore, 'brands', brand.id), brand);
    }

    for (const p of initialProducts) {
      this.data.products[p.id] = p;
      safeSetDoc(doc(firestore, 'products', p.id), p);
    }

    this.persist();
    return {
      categoriesCount: Object.keys(this.data.categories).length,
      brandsCount: Object.keys(this.data.brands).length,
      productsCount: Object.keys(this.data.products).length
    };
  }

  // --- Carts ---
  getCart(userId: string): CartItem[] {
    return this.data.carts[userId] || [];
  }

  saveCart(userId: string, items: CartItem[]): CartItem[] {
    this.data.carts[userId] = items;
    this.persist();
    safeSetDoc(doc(firestore, 'carts', userId), { userId, items, updatedAt: new Date().toISOString() });
    return items;
  }

  // --- Wishlists ---
  getWishlist(userId: string): string[] {
    return this.data.wishlists[userId] || [];
  }

  saveWishlist(userId: string, items: string[]): string[] {
    this.data.wishlists[userId] = items;
    this.persist();
    safeSetDoc(doc(firestore, 'wishlists', userId), { userId, items, updatedAt: new Date().toISOString() });
    return items;
  }

  // --- Stock Reservation (Buy Now / Checkout flow) ---
  reserveStock(items: { productId: string; quantity: number }[]): { reservationId: string; expiresAt: string } {
    // 1. Check stock availability for all items first
    for (const item of items) {
      const prod = this.data.products[item.productId];
      if (!prod) {
        throw new Error(`Product "${item.productId}" is not found.`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}`);
      }
    }

    // 2. Decrement stock temporarily
    const reservationId = 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const expiresMs = Date.now() + 10 * 60 * 1000; // 10 minutes

    for (const item of items) {
      const prod = this.data.products[item.productId];
      const newStock = Math.max(0, prod.stock - item.quantity);
      this.data.products[item.productId] = {
        ...prod,
        stock: newStock,
        updatedAt: new Date().toISOString()
      };
      safeSetDoc(doc(firestore, 'products', prod.id), this.data.products[item.productId]);
    }

    this.data.reservations[reservationId] = {
      id: reservationId,
      items,
      expiresAt: expiresMs
    };

    this.persist();
    return { reservationId, expiresAt: new Date(expiresMs).toISOString() };
  }

  releaseReservation(reservationId: string): boolean {
    const res = this.data.reservations[reservationId];
    if (!res) return false;

    // Restore reserved items stock to Firestore
    for (const item of res.items) {
      const prod = this.data.products[item.productId];
      if (prod) {
        const restoredStock = prod.stock + item.quantity;
        this.data.products[item.productId] = {
          ...prod,
          stock: restoredStock,
          updatedAt: new Date().toISOString()
        };
        safeSetDoc(doc(firestore, 'products', prod.id), this.data.products[item.productId]);
      }
    }

    delete this.data.reservations[reservationId];
    this.persist();
    return true;
  }

  // --- Orders & Atomic Stock Reduction ---
  executeOrderTransaction(
    order: Order, 
    stockDecrements: { productId: string; decrement: number }[],
    reservationId?: string
  ): Order {
    if (reservationId && this.data.reservations[reservationId]) {
      // Stock was already reserved, clean up reservation and finalize
      delete this.data.reservations[reservationId];
      // Update unitsSold & orderCount on affected products
      for (const dec of stockDecrements) {
        const prod = this.data.products[dec.productId];
        if (prod) {
          this.data.products[dec.productId] = {
            ...prod,
            unitsSold: (prod.unitsSold || 0) + dec.decrement,
            orderCount: (prod.orderCount || 0) + 1,
            updatedAt: new Date().toISOString()
          };
          safeSetDoc(doc(firestore, 'products', prod.id), this.data.products[dec.productId]);
        }
      }
    } else {
      // Direct checkout without prior reservation: verify and deduct stock
      for (const dec of stockDecrements) {
        const prod = this.data.products[dec.productId];
        if (!prod) {
          throw new Error(`Product "${dec.productId}" was not found.`);
        }
        if (prod.stock < dec.decrement) {
          throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${dec.decrement}`);
        }
      }

      for (const dec of stockDecrements) {
        const prod = this.data.products[dec.productId];
        const newStock = Math.max(0, prod.stock - dec.decrement);
        this.data.products[dec.productId] = {
          ...prod,
          stock: newStock,
          unitsSold: (prod.unitsSold || 0) + dec.decrement,
          orderCount: (prod.orderCount || 0) + 1,
          updatedAt: new Date().toISOString()
        };
        safeSetDoc(doc(firestore, 'products', prod.id), this.data.products[dec.productId]);
      }
    }

    // Save order
    this.data.orders[order.id] = order;

    // Clear user cart
    this.data.carts[order.userId] = [];

    this.persist();

    // Mirror order in Firestore
    safeSetDoc(doc(firestore, 'orders', order.id), order);

    return order;
  }

  getOrderById(id: string): Order | null {
    return this.data.orders[id] || null;
  }

  getUserOrders(userId: string): Order[] {
    return Object.values(this.data.orders)
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllOrders(): Order[] {
    return Object.values(this.data.orders)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateOrderStatus(id: string, status: OrderStatus, shippingInfo?: any): Order {
    const cur = this.data.orders[id];
    if (!cur) throw new Error(`Order "${id}" not found.`);
    const updated: Order = {
      ...cur,
      status,
      shippingInfo: shippingInfo || cur.shippingInfo,
      updatedAt: new Date().toISOString()
    };
    this.data.orders[id] = updated;
    this.persist();

    safeSetDoc(doc(firestore, 'orders', id), updated);
    return updated;
  }

  // --- Reviews ---
  getProductReviews(productId: string): Review[] {
    return Object.values(this.data.reviews).filter(r => r.productId === productId);
  }

  getAllReviews(): Review[] {
    return Object.values(this.data.reviews);
  }

  createReview(review: Review): Review {
    this.data.reviews[review.id] = review;

    const allProdReviews = this.getProductReviews(review.productId);
    const totalStars = allProdReviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = parseFloat((totalStars / allProdReviews.length).toFixed(1));

    const prod = this.data.products[review.productId];
    if (prod) {
      this.data.products[review.productId] = {
        ...prod,
        rating: avgRating,
        reviewCount: allProdReviews.length,
        updatedAt: new Date().toISOString()
      };
      safeSetDoc(doc(firestore, 'products', prod.id), this.data.products[review.productId]);
    }

    this.persist();
    safeSetDoc(doc(firestore, 'reviews', review.id), review);
    return review;
  }

  // --- Offers ---
  getOffers(): OfferBanner[] {
    const nowTime = new Date().getTime();
    return Object.values(this.data.offers).filter(o => {
      if (o.active === false) return false;
      if (o.startDate) {
        const start = new Date(o.startDate).getTime();
        if (!isNaN(start) && nowTime < start) return false;
      }
      if (o.endDate) {
        const end = new Date(o.endDate).getTime();
        if (!isNaN(end) && nowTime > end) return false;
      }
      return true;
    });
  }

  getAdminOffers(): OfferBanner[] {
    return Object.values(this.data.offers);
  }

  createOffer(offer: OfferBanner): OfferBanner {
    this.data.offers[offer.id] = offer;
    this.persist();
    safeSetDoc(doc(firestore, 'offers', offer.id), offer);
    return offer;
  }

  updateOffer(id: string, updates: Partial<OfferBanner>): OfferBanner {
    const cur = this.data.offers[id];
    if (!cur) throw new Error(`Offer "${id}" not found.`);
    const updated = { ...cur, ...updates, id, updatedAt: new Date().toISOString() };
    this.data.offers[id] = updated;
    this.persist();
    safeSetDoc(doc(firestore, 'offers', id), updated);
    return updated;
  }

  deleteOffer(id: string): boolean {
    delete this.data.offers[id];
    this.persist();
    safeDeleteDoc(doc(firestore, 'offers', id));
    return true;
  }

  // --- Payment Methods ---
  getPaymentMethods(): PaymentMethodConfig[] {
    return Object.values(this.data.paymentMethods).filter(p => p.enabled);
  }

  getAdminPaymentMethods(): PaymentMethodConfig[] {
    return Object.values(this.data.paymentMethods);
  }

  createPaymentMethod(pm: PaymentMethodConfig): PaymentMethodConfig {
    this.data.paymentMethods[pm.id] = pm;
    this.persist();
    safeSetDoc(doc(firestore, 'payment_methods', pm.id), pm);
    return pm;
  }

  updatePaymentMethod(id: string, updates: Partial<PaymentMethodConfig>): PaymentMethodConfig {
    const cur = this.data.paymentMethods[id] || defaultPaymentMethods.find(p => p.id === id);
    const updated = { ...cur, ...updates, id } as PaymentMethodConfig;

    // Automatically update dynamic QR URL if UPI ID or payee name updated and no custom uploaded QR
    if (updated.type === 'upi' && updated.upiId && !updated.qrCodeCustomBase64) {
      const pName = encodeURIComponent(updated.payeeName || 'BUYGEN Electronics');
      const uId = encodeURIComponent(updated.upiId);
      updated.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D${uId}%26pn%3D${pName}%26cu%3DINR`;
    }

    this.data.paymentMethods[id] = updated;
    this.persist();
    safeSetDoc(doc(firestore, 'payment_methods', id), updated);
    return updated;
  }

  deletePaymentMethod(id: string): boolean {
    delete this.data.paymentMethods[id];
    this.persist();
    safeDeleteDoc(doc(firestore, 'payment_methods', id));
    return true;
  }

  // --- Logs ---
  addSearchLog(log: SearchLog) {
    this.data.searchLogs.unshift(log);
    if (this.data.searchLogs.length > 200) {
      this.data.searchLogs = this.data.searchLogs.slice(0, 200);
    }
    this.persist();
  }

  getSearchLogs(): SearchLog[] {
    return this.data.searchLogs;
  }

  addLoginLog(log: UserLoginLog) {
    this.data.loginLogs.unshift(log);
    if (this.data.loginLogs.length > 200) {
      this.data.loginLogs = this.data.loginLogs.slice(0, 200);
    }
    this.persist();
  }

  getLoginLogs(): UserLoginLog[] {
    return this.data.loginLogs;
  }

  clearLoginLogs() {
    this.data.loginLogs = [];
    this.persist();
  }
}

export const storage = new PersistentStorage();
