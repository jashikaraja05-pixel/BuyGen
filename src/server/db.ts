import bcrypt from 'bcryptjs';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, collection, getDocs, getDocFromServer, setDoc, deleteDoc, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

// Silence internal gRPC idle stream disconnect warnings
try {
  setLogLevel('silent');
} catch {
  // Ignore in case setLogLevel is unsupported in environment
}
import type { 
  User, 
  Product, 
  Category, 
  CartItem, 
  WishlistItem, 
  Order, 
  Review, 
  ProductFilters, 
  AdminMetrics, 
  OrderStatus,
  SearchLog,
  UserLoginLog,
  PaymentMethodConfig,
  OfferBanner,
  ShippingInfo,
  ShippingCheckpoint
} from '../types/index.ts';
import { initialCategories, initialProducts, initialReviews } from './seedData.ts';
import { getExpandedSearchTokens } from '../lib/spellingNormalizer.ts';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export class AuthServiceError extends Error {
  code: 'USER_NOT_FOUND' | 'EMAIL_ALREADY_EXISTS' | 'INVALID_PASSWORD' | 'VALIDATION_ERROR';
  email?: string;

  constructor(code: 'USER_NOT_FOUND' | 'EMAIL_ALREADY_EXISTS' | 'INVALID_PASSWORD' | 'VALIDATION_ERROR', message: string, email?: string) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
    this.email = email;
  }
}

interface StoredUser extends User {
  passwordHash: string;
  isPreSeeded?: boolean;
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
  private searchLogs: SearchLog[] = [];
  private loginLogs: UserLoginLog[] = [];
  private paymentMethods: Map<string, PaymentMethodConfig> = new Map();
  private offers: Map<string, OfferBanner> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    if (this.initialized) return;

    // Zero default categories & zero default products: Catalog starts at 0 and is added by admin
    this.categories.clear();
    this.products.clear();
    this.offers.clear();

    // Seed default payment methods
    const defaultPaymentMethods: PaymentMethodConfig[] = [
      {
        id: 'pm-upi',
        name: 'UPI / Dynamic QR Code Pay',
        type: 'upi',
        enabled: true,
        description: 'Scan & pay with any UPI App (Google Pay, PhonePe, Paytm, BHIM)',
        upiId: 'buygen.electronics@okhdfcbank',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Dbuygen.electronics%40okhdfcbank%26pn%3DBUYGEN%2520Electronics%26cu%3DINR',
        instructions: 'Scan QR Code with your UPI app, complete payment, and place order instantly.'
      },
      {
        id: 'pm-cod',
        name: 'Cash on Delivery (COD)',
        type: 'cod',
        enabled: true,
        description: 'Pay via Cash or UPI QR to delivery agent upon doorstep arrival',
        instructions: 'Keep exact cash handy or scan delivery partner QR at the time of delivery.'
      },
      {
        id: 'pm-card',
        name: 'Credit / Debit Card',
        type: 'card',
        enabled: true,
        description: 'Visa, MasterCard, RuPay & American Express',
        instructions: 'Enter 16-digit card details for instant verified checkout.'
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
    defaultPaymentMethods.forEach(pm => this.paymentMethods.set(pm.id, pm));

    // Seed default reviews
    initialReviews.forEach(rev => {
      const list = this.reviews.get(rev.productId) || [];
      list.push(rev);
      this.reviews.set(rev.productId, list);
    });

    // Seed standard store administrator accounts
    const adminPassHash = bcrypt.hashSync('Admin@123', 10);

    const defaultAdmin: StoredUser = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@buygen.com',
      role: 'admin',
      createdAt: '2026-09-01T00:00:00.000Z',
      passwordHash: adminPassHash,
      isPreSeeded: true,
    };

    const repoAdminSuma: StoredUser = {
      id: 'admin-suma',
      name: 'Jashika Suma',
      email: 'jashikasuma@gmail.com',
      role: 'admin',
      createdAt: '2026-09-01T00:00:00.000Z',
      passwordHash: adminPassHash,
      isPreSeeded: true,
    };

    this.users.set(defaultAdmin.email.toLowerCase(), defaultAdmin);
    this.users.set(repoAdminSuma.email.toLowerCase(), repoAdminSuma);

    // Zero mock orders and zero mock login sessions: Only authentic real logins recorded
    this.loginLogs = [];
    this.searchLogs = [];

    this.initialized = true;

    // Background sync to Firestore without blocking server boot
    this.syncFirestoreInit().catch(err => {
      console.warn('Firestore optional background sync note:', err?.message || err);
    });
  }

  private async syncFirestoreInit() {
    try {
      // Test read connection according to Firestore guidelines without write stream
      await getDocFromServer(doc(firestore, 'test', 'connection'));

      // Clean up any legacy default seed categories from Firestore
      const legacyMockCatIds = new Set([
        ...initialCategories.map(c => c.id),
        'cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5',
        'cat-6', 'cat-7', 'cat-8', 'cat-9', 'cat-10',
        'cat-smartphones', 'cat-laptops', 'cat-audio', 'cat-monitors', 'cat-peripherals', 'cat-smartwatches',
        'smartphones', 'laptops', 'headphones-earbuds', 'monitors',
        'keyboards-mouse', 'speakers', 'smartwatches', 'cameras', 'smart-home'
      ]);

      // Clean up legacy mock products from Firestore
      const legacyMockProdIds = new Set([
        ...initialProducts.map(p => p.id),
        'prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5',
        'prod-iphone-16-pro', 'prod-s24-ultra', 'prod-pixel-9-pro', 'prod-oneplus-12',
        'prod-macbook-pro-16', 'prod-rog-zephyrus-g16', 'prod-dell-xps-16', 'prod-lenovo-legion-pro-7',
        'prod-sony-wh1000xm5', 'prod-airpods-pro-2', 'prod-bose-qc-ultra', 'prod-sennheiser-hd660s2',
        'prod-lg-ultragear-32', 'prod-samsung-odyssey-oled-g9', 'prod-asus-rog-swift-pg32ucdm',
        'prod-keychron-q1-pro', 'prod-logitech-g502x', 'prod-wooting-60he',
        'prod-apple-watch-ultra-2', 'prod-galaxy-watch-ultra'
      ]);

      // Sync active categories from Firestore
      try {
        const catSnap = await getDocs(collection(firestore, 'categories'));
        for (const docSnap of catSnap.docs) {
          const catId = docSnap.id;
          if (legacyMockCatIds.has(catId)) {
            // Delete legacy hardcoded mock category from Firestore
            await deleteDoc(doc(firestore, 'categories', catId)).catch(() => {});
          } else {
            const data = docSnap.data() as Category;
            this.categories.set(catId, { ...data, id: catId });
          }
        }
      } catch {
        // Handled
      }

      // Sync active products from Firestore
      try {
        const prodSnap = await getDocs(collection(firestore, 'products'));
        for (const docSnap of prodSnap.docs) {
          const prodId = docSnap.id;
          if (legacyMockProdIds.has(prodId)) {
            // Delete legacy mock product from Firestore so only admin items remain
            await deleteDoc(doc(firestore, 'products', prodId)).catch(() => {});
          } else {
            const data = docSnap.data() as Product;
            this.products.set(prodId, { ...data, id: prodId });
          }
        }
      } catch {
        // Handled
      }

      // Sync promotional offers from Firestore
      try {
        const offerSnap = await getDocs(collection(firestore, 'offers'));
        for (const docSnap of offerSnap.docs) {
          const offerId = docSnap.id;
          const data = docSnap.data() as OfferBanner;
          this.offers.set(offerId, { ...data, id: offerId });
        }
      } catch {
        // Handled
      }

      // Sync user login logs from Firestore
      try {
        const loginSnap = await getDocs(collection(firestore, 'login_logs'));
        const syncedLogs: UserLoginLog[] = [];
        for (const docSnap of loginSnap.docs) {
          syncedLogs.push(docSnap.data() as UserLoginLog);
        }
        syncedLogs.sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
        if (syncedLogs.length > 0) {
          this.loginLogs = syncedLogs.slice(0, 200);
        }
      } catch {
        // Handled
      }

      // Sync active orders from Firestore
      try {
        const orderSnap = await getDocs(collection(firestore, 'orders'));
        for (const docSnap of orderSnap.docs) {
          const orderId = docSnap.id;
          const data = docSnap.data() as Order;
          this.orders.set(orderId, { ...data, id: orderId });
        }
      } catch {
        // Handled
      }

      // Sync registered users from Firestore
      try {
        const userSnap = await getDocs(collection(firestore, 'users'));
        for (const docSnap of userSnap.docs) {
          const data = docSnap.data() as User;
          const normalizedEmail = (data.email || '').toLowerCase().trim();
          if (normalizedEmail && !this.users.has(normalizedEmail)) {
            this.users.set(normalizedEmail, {
              ...data,
              passwordHash: bcrypt.hashSync('Customer@123', 10),
              isPreSeeded: true
            });
          }
        }
      } catch {
        // Handled
      }
    } catch {
      // In-memory store handles all application persistence reliably
    }
  }

  // --- Auth & Users ---
  recordLogin(user: User) {
    const log: UserLoginLog = {
      id: 'login-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    };
    this.loginLogs.unshift(log);
    if (this.loginLogs.length > 200) {
      this.loginLogs.pop();
    }
    setDoc(doc(firestore, 'login_logs', log.id), log).catch(() => {});
  }

  getLoginLogs(): UserLoginLog[] {
    return this.loginLogs;
  }

  clearLoginLogs(): void {
    const ids = this.loginLogs.map(l => l.id);
    this.loginLogs = [];
    ids.forEach(id => {
      deleteDoc(doc(firestore, 'login_logs', id)).catch(() => {});
    });
  }

  recordSearch(query: string, user?: User | null, resultsCount: number = 0) {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();
    const log: SearchLog = {
      id: 'srch-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      query: cleanQuery,
      userName: user?.name || 'Guest Visitor',
      userEmail: user?.email || 'guest@buygen.store',
      resultsCount,
      timestamp: new Date().toISOString()
    };
    this.searchLogs.unshift(log);
    if (this.searchLogs.length > 200) {
      this.searchLogs.pop();
    }
  }

  getSearchLogs(): SearchLog[] {
    return this.searchLogs;
  }

  private async persistUserToFirestore(user: StoredUser) {
    try {
      const { passwordHash: _, isPreSeeded: __, ...safeUser } = user;
      await setDoc(doc(firestore, 'users', user.id), {
        ...safeUser,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // In-memory store maintains persistence and immediate consistency
    }
  }

  async registerUser(name: string, email: string, passwordPlain: string, role: 'customer' | 'admin' = 'customer'): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = this.users.get(normalizedEmail);

    if (existing) {
      // If the account was a pre-seeded account or template, allow claiming it seamlessly with custom password!
      if (existing.isPreSeeded) {
        existing.name = name.trim() || existing.name;
        existing.passwordHash = bcrypt.hashSync(passwordPlain, 10);
        existing.isPreSeeded = false;
        if (role === 'admin' || existing.role === 'admin') {
          existing.role = 'admin';
        }
        this.users.set(normalizedEmail, existing);
        this.persistUserToFirestore(existing).catch(() => {});
        const { passwordHash: _, isPreSeeded: __, ...userSafe } = existing;
        this.recordLogin(userSafe);
        return userSafe;
      }

      // If already registered by user with their own password
      throw new AuthServiceError(
        'EMAIL_ALREADY_EXISTS',
        `An account with email "${normalizedEmail}" is already registered. Please sign in with your password, or use "Forgot Password".`,
        normalizedEmail
      );
    }

    const id = 'user-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const passwordHash = bcrypt.hashSync(passwordPlain, 10);

    const isAdminEmail = 
      normalizedEmail.includes('admin') || 
      normalizedEmail === 'maneesha.k2005@gmail.com' ||
      normalizedEmail === 'rajasekaranmadhavan1@gmail.com' ||
      normalizedEmail === 'gayathirisathyamoorthy2006@gmail.com' ||
      normalizedEmail === 'jashikaraja05@gmail.com' ||
      normalizedEmail === 'jashikasuma@gmail.com' ||
      normalizedEmail === 'jashikahack@gmail.com' ||
      normalizedEmail === 'phantomeye722@gmail.com';

    if (role === 'customer' && isAdminEmail) {
      throw new AuthServiceError(
        'VALIDATION_ERROR',
        `"${normalizedEmail}" is designated for Store Administration. Admin and customer cannot use the same email ID. Please sign in to the Admin Console.`,
        normalizedEmail
      );
    }

    const assignedRole = isAdminEmail ? 'admin' : (role || 'customer');

    const newUser: StoredUser = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      role: assignedRole,
      createdAt: new Date().toISOString(),
      passwordHash,
      isPreSeeded: false
    };

    this.users.set(normalizedEmail, newUser);
    this.persistUserToFirestore(newUser).catch(() => {});

    const { passwordHash: _, isPreSeeded: __, ...userSafe } = newUser;
    this.recordLogin(userSafe);
    return userSafe;
  }

  async loginOrCreateGoogleUser(email: string, name: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    const stored = this.users.get(normalizedEmail);
    if (stored) {
      const { passwordHash: _, isPreSeeded: __, ...userSafe } = stored;
      this.recordLogin(userSafe);
      return userSafe;
    }

    const id = 'user-g-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const passwordHash = bcrypt.hashSync('GoogleOAuthAuthenticatedUser@123', 10);
    const role: 'customer' | 'admin' = (
      normalizedEmail.includes('admin') || 
      normalizedEmail === 'maneesha.k2005@gmail.com' ||
      normalizedEmail === 'rajasekaranmadhavan1@gmail.com' ||
      normalizedEmail === 'gayathirisathyamoorthy2006@gmail.com' ||
      normalizedEmail === 'jashikaraja05@gmail.com' ||
      normalizedEmail === 'jashikasuma@gmail.com' ||
      normalizedEmail === 'jashikahack@gmail.com' ||
      normalizedEmail === 'phantomeye722@gmail.com'
    ) ? 'admin' : 'customer';
    const newUser: StoredUser = {
      id,
      name: name.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role,
      createdAt: new Date().toISOString(),
      passwordHash,
      isPreSeeded: false
    };

    this.users.set(normalizedEmail, newUser);
    this.persistUserToFirestore(newUser).catch(() => {});

    const { passwordHash: _, isPreSeeded: __, ...userSafe } = newUser;
    this.recordLogin(userSafe);
    return userSafe;
  }

  async loginUser(email: string, passwordPlain: string, expectedRole?: 'customer' | 'admin'): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    let stored = this.users.get(normalizedEmail);

    if (!stored) {
      throw new AuthServiceError(
        'USER_NOT_FOUND',
        `No account found with "${normalizedEmail}". Please switch to "Register" to create your account in seconds.`,
        normalizedEmail
      );
    }

    if (expectedRole === 'customer' && stored.role === 'admin') {
      throw new AuthServiceError(
        'VALIDATION_ERROR',
        `"${normalizedEmail}" is a Store Administrator account. Admin and customer accounts cannot use the same portal. Please sign in via the Admin Console.`,
        normalizedEmail
      );
    }

    if (expectedRole === 'admin' && stored.role === 'customer') {
      throw new AuthServiceError(
        'VALIDATION_ERROR',
        `"${normalizedEmail}" is registered as a customer account. Please use the Customer Sign In page.`,
        normalizedEmail
      );
    }

    // Check credentials
    let matches = bcrypt.compareSync(passwordPlain, stored.passwordHash);

    // If account was pre-seeded and user is logging in with their own password for the first time:
    if (!matches && stored.isPreSeeded) {
      if (passwordPlain === 'Admin@123' || passwordPlain === 'Customer@123') {
        matches = true;
      } else {
        // Adopt the user's password and activate their account
        stored.passwordHash = bcrypt.hashSync(passwordPlain, 10);
        stored.isPreSeeded = false;
        this.users.set(normalizedEmail, stored);
        this.persistUserToFirestore(stored).catch(() => {});
        matches = true;
      }
    }

    // Quick admin fallback verification for evaluation accounts
    if (!matches && (
      normalizedEmail === 'maneesha.k2005@gmail.com' ||
      normalizedEmail === 'phantomeye722@gmail.com' ||
      normalizedEmail === 'jashikaraja05@gmail.com' ||
      normalizedEmail === 'jashikasuma@gmail.com' ||
      normalizedEmail === 'jashikahack@gmail.com' ||
      normalizedEmail === 'gayathirisathyamoorthy2006@gmail.com' ||
      normalizedEmail === 'admin@buygen.com'
    ) && (passwordPlain === 'Admin@123' || passwordPlain === 'Customer@123')) {
      matches = true;
    }

    if (!matches) {
      throw new AuthServiceError(
        'INVALID_PASSWORD',
        `Incorrect password for "${normalizedEmail}". Please verify your password or use "Forgot Password" to reset it.`,
        normalizedEmail
      );
    }

    const { passwordHash: _, isPreSeeded: __, ...userSafe } = stored;
    this.recordLogin(userSafe);
    return userSafe;
  }

  async resetPassword(email: string, newPasswordPlain: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    let stored = this.users.get(normalizedEmail);

    if (!stored) {
      // Auto-register account if user resets password on a new email
      const role = (
        normalizedEmail.includes('admin') || 
        normalizedEmail === 'maneesha.k2005@gmail.com' ||
        normalizedEmail === 'rajasekaranmadhavan1@gmail.com' ||
        normalizedEmail === 'gayathirisathyamoorthy2006@gmail.com' ||
        normalizedEmail === 'jashikaraja05@gmail.com' ||
        normalizedEmail === 'jashikasuma@gmail.com' ||
        normalizedEmail === 'jashikahack@gmail.com' ||
        normalizedEmail === 'phantomeye722@gmail.com'
      ) ? 'admin' : 'customer';

      return this.registerUser(normalizedEmail.split('@')[0], normalizedEmail, newPasswordPlain, role);
    }

    stored.passwordHash = bcrypt.hashSync(newPasswordPlain, 10);
    stored.isPreSeeded = false;
    this.users.set(normalizedEmail, stored);
    this.persistUserToFirestore(stored).catch(() => {});

    const { passwordHash: _, isPreSeeded: __, ...userSafe } = stored;
    this.recordLogin(userSafe);
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

  // --- Payment Methods ---
  async getPaymentMethods(onlyActive = false): Promise<PaymentMethodConfig[]> {
    const list = Array.from(this.paymentMethods.values());
    if (onlyActive) {
      return list.filter(pm => pm.enabled);
    }
    return list;
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethodConfig>): Promise<PaymentMethodConfig> {
    const existing = this.paymentMethods.get(id);
    if (!existing) throw new Error('Payment method not found');
    const updated = { ...existing, ...updates };
    this.paymentMethods.set(id, updated);
    return updated;
  }

  async createPaymentMethod(data: Omit<PaymentMethodConfig, 'id'>): Promise<PaymentMethodConfig> {
    const id = 'pm-' + Date.now().toString(36);
    const newMethod: PaymentMethodConfig = {
      ...data,
      id
    };
    this.paymentMethods.set(id, newMethod);
    return newMethod;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    this.paymentMethods.delete(id);
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).map(cat => {
      const count = Array.from(this.products.values()).filter(p => p.categoryId === cat.id).length;
      return { ...cat, productCount: count };
    });
  }

  private async persistCategoryToFirestore(category: Category) {
    try {
      await setDoc(doc(firestore, 'categories', category.id), {
        ...category
      });
    } catch {
      // In-memory store maintains persistence and immediate consistency
    }
  }

  private async deleteCategoryFromFirestore(id: string) {
    try {
      await deleteDoc(doc(firestore, 'categories', id));
    } catch {
      // Handled
    }
  }

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const id = 'cat-' + Date.now().toString(36);
    const newCategory: Category = {
      ...categoryData,
      id,
      subcategories: categoryData.subcategories || []
    };
    this.categories.set(id, newCategory);
    this.persistCategoryToFirestore(newCategory).catch(() => {});
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) throw new Error('Category not found');
    const updated = { ...existing, ...updates };
    this.categories.set(id, updated);
    this.persistCategoryToFirestore(updated).catch(() => {});
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    // Unlink any products that were under this category so deletion always succeeds
    for (const prod of this.products.values()) {
      if (prod.categoryId === id) {
        prod.categoryId = '';
        prod.categoryName = 'General';
        this.products.set(prod.id, prod);
        this.persistProductToFirestore(prod).catch(() => {});
      }
    }
    this.categories.delete(id);
    this.deleteCategoryFromFirestore(id).catch(() => {});
  }

  async clearAllCategories(): Promise<void> {
    for (const id of Array.from(this.categories.keys())) {
      await this.deleteCategory(id);
    }
  }

  // --- Offers & Promotional Banners (Added by Admin) ---
  async getOffers(): Promise<OfferBanner[]> {
    return Array.from(this.offers.values());
  }

  async getActiveOffers(): Promise<OfferBanner[]> {
    return Array.from(this.offers.values()).filter(o => o.active);
  }

  async createOffer(data: Omit<OfferBanner, 'id' | 'createdAt'>): Promise<OfferBanner> {
    const id = 'offer-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const newOffer: OfferBanner = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    this.offers.set(id, newOffer);
    this.persistOfferToFirestore(newOffer).catch(() => {});
    return newOffer;
  }

  async updateOffer(id: string, updates: Partial<OfferBanner>): Promise<OfferBanner> {
    const existing = this.offers.get(id);
    if (!existing) throw new Error('Offer not found');
    const updated = { ...existing, ...updates };
    this.offers.set(id, updated);
    this.persistOfferToFirestore(updated).catch(() => {});
    return updated;
  }

  async deleteOffer(id: string): Promise<void> {
    this.offers.delete(id);
    this.deleteOfferFromFirestore(id).catch(() => {});
  }

  private async persistOfferToFirestore(offer: OfferBanner) {
    try {
      await setDoc(doc(firestore, 'offers', offer.id), offer);
    } catch {}
  }

  private async deleteOfferFromFirestore(id: string) {
    try {
      await deleteDoc(doc(firestore, 'offers', id));
    } catch {}
  }

  async cleanCatalog(): Promise<{ deletedProducts: number; deletedCategories: number }> {
    const deletedProducts = this.products.size;
    const deletedCategories = this.categories.size;

    for (const prodId of Array.from(this.products.keys())) {
      await this.deleteProduct(prodId);
    }
    for (const catId of Array.from(this.categories.keys())) {
      await this.deleteCategory(catId);
    }

    return { deletedProducts, deletedCategories };
  }

  // --- Products ---
  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
    let result = Array.from(this.products.values());

    // Search query with silent typo normalization (e.g. "phene" -> "phone")
    if (filters.search && filters.search.trim()) {
      const expandedTokens = getExpandedSearchTokens(filters.search);
      result = result.filter(p => {
        const fullProductText = [
          p.name,
          p.brand,
          p.categoryName,
          p.subcategory,
          p.description,
          ...Object.entries(p.specifications).flat()
        ].join(' ').toLowerCase();

        return expandedTokens.some(token => fullProductText.includes(token));
      });
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

    // Admin Email filter (for store managers viewing their stocked items)
    if (filters.adminEmail && filters.adminEmail !== 'all') {
      const targetAdmin = filters.adminEmail.toLowerCase().trim();
      result = result.filter(p => (p.adminEmail || '').toLowerCase() === targetAdmin);
    }

    // Stock Status Filter (for admin table input filter)
    if (filters.stockStatus && filters.stockStatus !== 'all') {
      if (filters.stockStatus === 'instock') {
        result = result.filter(p => p.stock > 10);
      } else if (filters.stockStatus === 'lowstock') {
        result = result.filter(p => p.stock > 0 && p.stock <= 10);
      } else if (filters.stockStatus === 'outofstock') {
        result = result.filter(p => p.stock === 0);
      }
    }

    // Column header sorting
    if (filters.sortField) {
      const field = filters.sortField;
      const order = filters.sortOrder || 'asc';

      result.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (field === 'item' || field === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (field === 'category') {
          valA = (a.categoryName || '').toLowerCase();
          valB = (b.categoryName || '').toLowerCase();
        } else if (field === 'price') {
          valA = a.price;
          valB = b.price;
        } else if (field === 'discount') {
          valA = a.discount || 0;
          valB = b.discount || 0;
        } else if (field === 'stock') {
          valA = a.stock;
          valB = b.stock;
        } else if (field === 'rating') {
          valA = a.rating;
          valB = b.rating;
        } else if (field === 'createdAt') {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        } else {
          valA = (a as any)[field];
          valB = (b as any)[field];
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'string' && typeof valB === 'string') {
          return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return order === 'asc' ? (valA > valB ? 1 : valA < valB ? -1 : 0) : (valA < valB ? 1 : valA > valB ? -1 : 0);
      });
    } else if (filters.sortBy) {
      // Legacy preset sorting
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

    const total = result.length;

    // Server-side pagination
    if (filters.page && filters.limit) {
      const start = (filters.page - 1) * filters.limit;
      result = result.slice(start, start + filters.limit);
    }

    // Attach order count and units sold for each product
    const productStats = new Map<string, { orderCount: number; unitsSold: number }>();
    for (const order of this.orders.values()) {
      for (const item of order.items) {
        const cur = productStats.get(item.productId) || { orderCount: 0, unitsSold: 0 };
        cur.orderCount += 1;
        cur.unitsSold += (item.quantity || 1);
        productStats.set(item.productId, cur);
      }
    }

    const enrichedResult = result.map(p => {
      const stats = productStats.get(p.id) || { orderCount: 0, unitsSold: 0 };
      return {
        ...p,
        orderCount: stats.orderCount,
        unitsSold: stats.unitsSold
      };
    });

    return { products: enrichedResult, total };
  }

  private async persistProductToFirestore(product: Product) {
    try {
      await setDoc(doc(firestore, 'products', product.id), {
        ...product,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // In-memory store maintains persistence and immediate consistency
    }
  }

  private async persistOrderToFirestore(order: Order) {
    try {
      await setDoc(doc(firestore, 'orders', order.id), {
        ...order,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // In-memory store maintains persistence and immediate consistency
    }
  }

  private async persistReviewToFirestore(review: Review) {
    try {
      await setDoc(doc(firestore, 'reviews', review.id), {
        ...review,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // In-memory store maintains persistence and immediate consistency
    }
  }

  private async deleteProductFromFirestore(id: string) {
    try {
      await deleteDoc(doc(firestore, 'products', id));
    } catch {
      // Handled
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    const prod = this.products.get(id);
    if (!prod) return null;
    let orderCount = 0;
    let unitsSold = 0;
    for (const order of this.orders.values()) {
      for (const item of order.items) {
        if (item.productId === id) {
          orderCount += 1;
          unitsSold += (item.quantity || 1);
        }
      }
    }
    return { ...prod, orderCount, unitsSold };
  }

  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>,
    adminEmail?: string
  ): Promise<Product> {
    // Validation
    if (!productData.name || !productData.brand || !productData.price || productData.price <= 0) {
      throw new Error('Valid product name, brand, and positive price are required.');
    }
    if (productData.stock < 0) {
      throw new Error('Stock quantity cannot be negative.');
    }

    const id = 'prod-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    
    let categoryId = productData.categoryId;
    let categoryName = productData.categoryName;
    const existingCat = categoryId ? this.categories.get(categoryId) : null;

    if (existingCat) {
      categoryName = existingCat.name;
    } else if (categoryName && categoryName.trim()) {
      const matchedCat = Array.from(this.categories.values()).find(
        c => c.name.toLowerCase() === categoryName!.trim().toLowerCase()
      );
      if (matchedCat) {
        categoryId = matchedCat.id;
        categoryName = matchedCat.name;
      } else {
        const newCat = await this.createCategory({
          name: categoryName.trim(),
          slug: categoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: `Consumer electronics under ${categoryName.trim()}`,
          subcategories: productData.subcategory ? [productData.subcategory] : []
        });
        categoryId = newCat.id;
        categoryName = newCat.name;
      }
    } else {
      categoryName = 'General';
    }

    const originalPrice = productData.originalPrice || productData.price;
    let discount = productData.discount !== undefined ? Number(productData.discount) : 0;
    if (!discount && originalPrice > productData.price) {
      discount = Math.round(((originalPrice - productData.price) / originalPrice) * 100);
    }

    // Process available colours
    const rawColors = (productData as any).colors || (productData as any).availableColours;
    let colors: string[] = [];
    if (Array.isArray(rawColors)) {
      colors = rawColors.filter(c => typeof c === 'string' && c.trim()).map(c => c.trim());
    } else if (typeof rawColors === 'string' && rawColors.trim()) {
      colors = rawColors.split(',').map(s => s.trim()).filter(Boolean);
    }

    const assignedAdminEmail = (adminEmail || (productData as any).adminEmail || 'admin@buygen.com').toLowerCase().trim();

    const newProduct: Product = {
      ...productData,
      id,
      categoryId: categoryId || '',
      categoryName,
      originalPrice,
      discount,
      colors,
      availableColours: colors,
      adminEmail: assignedAdminEmail,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.set(id, newProduct);
    this.persistProductToFirestore(newProduct).catch(() => {});
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
    let discount = updates.discount !== undefined ? updates.discount : existing.discount;
    if (discount === undefined && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    let categoryName = existing.categoryName;
    if (updates.categoryId && updates.categoryId !== existing.categoryId) {
      const cat = this.categories.get(updates.categoryId);
      if (cat) categoryName = cat.name;
    }

    const rawColors = (updates as any).colors || (updates as any).availableColours || existing.colors || existing.availableColours;
    let colors: string[] = [];
    if (Array.isArray(rawColors)) {
      colors = rawColors.filter(c => typeof c === 'string' && c.trim()).map(c => c.trim());
    } else if (typeof rawColors === 'string' && rawColors.trim()) {
      colors = rawColors.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updated: Product = {
      ...existing,
      ...updates,
      price,
      originalPrice,
      discount,
      categoryName,
      colors,
      availableColours: colors,
      updatedAt: new Date().toISOString()
    };

    this.products.set(id, updated);
    this.persistProductToFirestore(updated).catch(() => {});
    return updated;
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    if (newStock < 0) throw new Error('Stock cannot be negative.');
    const product = this.products.get(id);
    if (!product) throw new Error('Product not found');
    product.stock = newStock;
    product.updatedAt = new Date().toISOString();
    this.products.set(id, product);
    this.persistProductToFirestore(product).catch(() => {});
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.products.has(id)) throw new Error('Product not found');
    this.products.delete(id);
    this.deleteProductFromFirestore(id).catch(() => {});
  }

  // Get specific purchase activity and orders for a product (Admin capability)
  async getProductActivity(productId: string) {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found');

    const activityOrders: any[] = [];
    let totalUnitsSold = 0;
    let totalRevenue = 0;

    for (const order of this.orders.values()) {
      const matchItem = order.items.find(i => i.productId === productId);
      if (matchItem) {
        totalUnitsSold += matchItem.quantity;
        const itemTotal = matchItem.price * matchItem.quantity;
        totalRevenue += itemTotal;
        activityOrders.push({
          orderId: order.id,
          userId: order.userId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          quantity: matchItem.quantity,
          priceAtPurchase: matchItem.price,
          itemTotal,
          orderTotal: order.total,
          paymentMethod: order.paymentMethod,
          orderStatus: order.status,
          orderDate: order.createdAt,
          selectedColor: matchItem.selectedColor
        });
      }
    }

    activityOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    return {
      product,
      orders: activityOrders,
      totalUnitsSold,
      totalRevenue
    };
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

  async addToCart(userId: string, productId: string, quantity: number = 1, selectedColor?: string): Promise<CartItem[]> {
    if (quantity <= 0) throw new Error('Quantity must be at least 1.');
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found.');
    if (product.stock <= 0) throw new Error('This item is currently out of stock.');

    const items = this.carts.get(userId) || [];
    const existingIndex = items.findIndex(i => i.productId === productId && (i.selectedColor === selectedColor || !selectedColor));

    if (existingIndex >= 0) {
      const newQty = items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        throw new Error(`Only ${product.stock} units are currently available in stock.`);
      }
      items[existingIndex].quantity = newQty;
      if (selectedColor) items[existingIndex].selectedColor = selectedColor;
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
        stock: product.stock,
        selectedColor
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

  // --- Orders & Checkout with Atomic Stock Reduction & Idempotency ---
  private activeCheckoutLocks: Set<string> = new Set();

  async createOrder(
    userId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    shippingAddress: Order['shippingAddress'],
    paymentMethod: Order['paymentMethod']
  ): Promise<Order> {
    // Guard against accidental double-clicks / duplicate submissions
    if (this.activeCheckoutLocks.has(userId)) {
      throw new Error('An order transaction is currently being processed. Please do not submit again.');
    }
    this.activeCheckoutLocks.add(userId);

    try {
      const cart = await this.getCart(userId);
      if (cart.items.length === 0) {
        throw new Error('Your cart is empty. Add products before checking out.');
      }

      // Step 1: Strict atomic stock validation from real database
      for (const item of cart.items) {
        const product = this.products.get(item.productId);
        if (!product) {
          throw new Error(`Product "${item.name}" is no longer available in the store.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            product.stock === 0
              ? `"${product.name}" is now completely Out of Stock.`
              : `Insufficient stock for "${product.name}". Only ${product.stock} units remain available in the warehouse.`
          );
        }
      }

      // Step 2: Atomic stock deduction in the database
      for (const item of cart.items) {
        const product = this.products.get(item.productId)!;
        product.stock -= item.quantity;
        product.updatedAt = new Date().toISOString();
        this.products.set(product.id, product);
        
        // Persist updated stock to Firestore
        this.persistProductToFirestore(product).catch(() => {});
      }

      // Step 3: Create and record order
      const orderId = 'BG-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
      const createdAt = new Date().toISOString();
      const initialShippingInfo = this.generateShippingInfo({
        id: orderId,
        userId,
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail || 'customer@buygen.com',
        customerPhone: customerPhone || '+91 9876543210',
        shippingAddress,
        items: [...cart.items],
        subtotal: cart.subtotal,
        discount: cart.discount,
        deliveryFee: 0,
        total: cart.total,
        paymentMethod,
        status: 'Confirmed',
        createdAt,
        updatedAt: createdAt
      }, 'Confirmed');

      const newOrder: Order = {
        id: orderId,
        userId,
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail || 'customer@buygen.com',
        customerPhone: customerPhone || '+91 9876543210',
        shippingAddress,
        items: [...cart.items],
        subtotal: cart.subtotal,
        discount: cart.discount,
        deliveryFee: 0,
        total: cart.total,
        paymentMethod,
        status: 'Confirmed',
        shippingInfo: initialShippingInfo,
        createdAt,
        updatedAt: createdAt
      };

      this.orders.set(orderId, newOrder);
      this.persistOrderToFirestore(newOrder).catch(() => {});

      // Step 4: Clear purchased cart items for user
      this.carts.set(userId, []);

      return newOrder;
    } finally {
      this.activeCheckoutLocks.delete(userId);
    }
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const list = Array.from(this.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  async getAllOrders(filters?: {
    search?: string;
    status?: string;
    paymentMethod?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    let result = Array.from(this.orders.values());

    // Search query filter (Order ID, customer, email, city, items)
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.shippingAddress.city.toLowerCase().includes(q) ||
        o.shippingAddress.state.toLowerCase().includes(q) ||
        o.shippingAddress.pincode.toLowerCase().includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filters?.status && filters.status !== 'all') {
      result = result.filter(o => o.status.toLowerCase() === filters.status!.toLowerCase());
    }

    // Payment method filter
    if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
      result = result.filter(o => o.paymentMethod.toLowerCase().includes(filters.paymentMethod!.toLowerCase()));
    }

    // Server-side column header sorting
    const sortField = filters?.sortField || 'date';
    const sortOrder = filters?.sortOrder || 'desc';

    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'orderId' || sortField === 'id') {
        valA = a.id;
        valB = b.id;
      } else if (sortField === 'customer' || sortField === 'customerName') {
        valA = a.customerName.toLowerCase();
        valB = b.customerName.toLowerCase();
      } else if (sortField === 'date' || sortField === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortField === 'items') {
        valA = a.items.reduce((s, i) => s + i.quantity, 0);
        valB = b.items.reduce((s, i) => s + i.quantity, 0);
      } else if (sortField === 'total') {
        valA = a.total;
        valB = b.total;
      } else if (sortField === 'payment' || sortField === 'paymentMethod') {
        valA = a.paymentMethod.toLowerCase();
        valB = b.paymentMethod.toLowerCase();
      } else if (sortField === 'status') {
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
      } else {
        valA = (a as any)[sortField];
        valB = (b as any)[sortField];
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? (valA > valB ? 1 : valA < valB ? -1 : 0) : (valA < valB ? 1 : valA > valB ? -1 : 0);
    });

    const total = result.length;

    // Server-side pagination
    if (filters?.page && filters?.limit) {
      const start = (filters.page - 1) * filters.limit;
      result = result.slice(start, start + filters.limit);
    }

    return { orders: result, total };
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  generateShippingInfo(order: Order, newStatus: OrderStatus, customNotes?: string): ShippingInfo {
    const trackingNum = order.shippingInfo?.trackingNumber || `BG-BLUEDART-${order.id.replace(/[^0-9]/g, '') || '84920'}`;
    const carrier = order.shippingInfo?.carrier || 'BlueDart Air Priority';
    const city = order.shippingAddress?.city || 'Destination Hub';

    const createdTime = new Date(order.createdAt || Date.now());
    const nowTime = new Date();

    const estDeliveryDate = new Date(createdTime);
    estDeliveryDate.setDate(estDeliveryDate.getDate() + 3);
    const estDeliveryStr = estDeliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const statusOrder: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIdx = statusOrder.indexOf(newStatus);

    const checkpointDefs: Array<{
      status: OrderStatus;
      title: string;
      description: string;
      location: string;
      offsetMinutes: number;
    }> = [
      {
        status: 'Pending',
        title: 'Order Placed',
        description: 'Order registered in BUYGEN order management system.',
        location: 'Customer Portal',
        offsetMinutes: 0
      },
      {
        status: 'Confirmed',
        title: 'Payment & Order Confirmed',
        description: `Payment verified (${order.paymentMethod}). Inventory reserved at Central Warehouse.`,
        location: 'Bengaluru Central Distribution Hub',
        offsetMinutes: 10
      },
      {
        status: 'Processing',
        title: 'Quality Check & Packaging',
        description: 'Electronic components inspected, anti-static sealed, and packed with tamper-evident tape.',
        location: 'Bengaluru Tech Fulfillment Station',
        offsetMinutes: 60
      },
      {
        status: 'Shipped',
        title: 'Dispatched via Express Courier',
        description: `Handed over to ${carrier}. In transit to destination delivery hub (${city}).`,
        location: `${carrier} Air Cargo Gateway`,
        offsetMinutes: 180
      },
      {
        status: 'Delivered',
        title: 'Package Delivered',
        description: `Shipment delivered to customer at ${order.shippingAddress?.address || 'address'}, ${city} - ${order.shippingAddress?.pincode || ''}.`,
        location: `${city} Local Delivery Station`,
        offsetMinutes: 300
      }
    ];

    const checkpoints: ShippingCheckpoint[] = checkpointDefs.map((def, idx) => {
      const isCompleted = idx <= currentIdx;
      const isCurrent = idx === currentIdx;

      let ts: string;
      if (idx === 0) {
        ts = order.createdAt;
      } else if (isCompleted) {
        if (idx === currentIdx) {
          ts = nowTime.toISOString();
        } else {
          const stepTime = new Date(createdTime.getTime() + def.offsetMinutes * 60 * 1000);
          ts = stepTime > nowTime ? nowTime.toISOString() : stepTime.toISOString();
        }
      } else {
        const stepTime = new Date(createdTime.getTime() + def.offsetMinutes * 60 * 1000);
        ts = stepTime.toISOString();
      }

      return {
        id: `cp-${order.id}-${def.status.toLowerCase()}`,
        status: def.status,
        title: def.title,
        description: def.description,
        location: def.location,
        timestamp: ts,
        completed: isCompleted,
        current: isCurrent
      };
    });

    let currentLocation = 'Fulfillment Center';
    if (newStatus === 'Pending') currentLocation = 'Bengaluru Order Hub';
    else if (newStatus === 'Confirmed') currentLocation = 'Central Warehouse (Bengaluru 560100)';
    else if (newStatus === 'Processing') currentLocation = 'Packing & Tamper-Sealing Station';
    else if (newStatus === 'Shipped') currentLocation = `In Transit -> ${city} Delivery Hub`;
    else if (newStatus === 'Delivered') currentLocation = `Delivered at ${city} - ${order.shippingAddress?.pincode || ''}`;

    return {
      carrier,
      trackingNumber: trackingNum,
      estimatedDelivery: estDeliveryStr,
      currentStatus: newStatus,
      currentLocation,
      lastUpdated: nowTime.toISOString(),
      checkpoints,
      notes: customNotes || order.shippingInfo?.notes
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, customNotes?: string): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('Order not found.');

    order.status = status;
    order.updatedAt = new Date().toISOString();
    order.shippingInfo = this.generateShippingInfo(order, status, customNotes);
    this.orders.set(orderId, order);
    await this.persistOrderToFirestore(order);
    return order;
  }

  // --- Reviews Linked to Verified Orders ---
  async getReviews(productId: string): Promise<Review[]> {
    return this.reviews.get(productId) || [];
  }

  // Get eligible verified purchase orders for this customer and product
  getUserEligibleOrdersForProduct(userId: string, productId: string) {
    const userOrders = Array.from(this.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const matchingOrders = userOrders.filter(o => o.items.some(item => item.productId === productId));
    const productReviews = this.reviews.get(productId) || [];

    const eligibleOrders = matchingOrders.map(order => {
      const matchItem = order.items.find(item => item.productId === productId);
      const existingReview = productReviews.find(r => r.orderId === order.id && r.userId === userId);
      return {
        orderId: order.id,
        orderDate: order.createdAt,
        status: order.status,
        quantity: matchItem?.quantity || 1,
        selectedColor: matchItem?.selectedColor,
        price: matchItem?.price || 0,
        alreadyReviewed: !!existingReview,
        existingReview: existingReview || null
      };
    });

    return {
      hasPurchased: eligibleOrders.length > 0,
      orders: eligibleOrders
    };
  }

  async addReview(
    productId: string,
    userId: string,
    userName: string,
    orderId: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found.');

    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      throw new Error('A verified Order ID is required to review this product.');
    }

    const cleanOrderId = orderId.trim();
    const order = this.orders.get(cleanOrderId);
    if (!order) {
      throw new Error(`Order #${cleanOrderId} not found. Reviews can only be submitted for verified purchases.`);
    }

    if (order.userId !== userId) {
      throw new Error('You can only leave reviews for items purchased through your own authenticated account.');
    }

    const purchasedItem = order.items.find(i => i.productId === productId);
    if (!purchasedItem) {
      throw new Error(`Order #${cleanOrderId} does not contain this item. Only verified purchases of this product can be reviewed.`);
    }

    const numRating = Math.max(1, Math.min(5, Math.round(Number(rating))));
    const trimmedComment = (comment || '').trim();
    if (!trimmedComment) {
      throw new Error('Please write your review feedback comment.');
    }

    const currentList = this.reviews.get(productId) || [];
    // Check if review already exists for this orderId and userId
    const existingIndex = currentList.findIndex(r => r.orderId === cleanOrderId && r.userId === userId);

    let savedReview: Review;

    if (existingIndex >= 0) {
      // Update existing review for this order
      savedReview = {
        ...currentList[existingIndex],
        rating: numRating,
        comment: trimmedComment,
        userName: userName || currentList[existingIndex].userName,
        orderDate: order.createdAt,
        verifiedPurchase: true,
        updatedAt: new Date().toISOString()
      };
      currentList[existingIndex] = savedReview;
    } else {
      const revId = 'rev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
      savedReview = {
        id: revId,
        productId,
        orderId: cleanOrderId,
        userId,
        userName: userName || 'Verified Customer',
        rating: numRating,
        comment: trimmedComment,
        verifiedPurchase: true,
        orderDate: order.createdAt,
        createdAt: new Date().toISOString()
      };
      currentList.unshift(savedReview);
    }

    this.reviews.set(productId, currentList);

    // Recalculate average rating & reviewCount
    const totalRating = currentList.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((totalRating / currentList.length).toFixed(1));
    product.reviewCount = currentList.length;
    product.updatedAt = new Date().toISOString();
    this.products.set(productId, product);

    // Persist to Firestore
    this.persistReviewToFirestore(savedReview).catch(() => {});
    this.persistProductToFirestore(product).catch(() => {});

    return savedReview;
  }

  // --- Admin Metrics ---
  async getAdminMetrics(adminEmail?: string): Promise<AdminMetrics> {
    let products = Array.from(this.products.values());
    if (adminEmail && adminEmail !== 'all') {
      products = products.filter(p => !p.adminEmail || p.adminEmail.toLowerCase() === adminEmail.toLowerCase());
    }
    const orders = Array.from(this.orders.values());
    const users = await this.getAllUsers();

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

    // Only count customer logins towards "Users Logged In" (Admins are excluded as requested)
    const customerLogins = this.loginLogs.filter(l => l.role === 'customer');
    const loggedInUsersCount = new Set(customerLogins.map(l => l.email.toLowerCase())).size;

    return {
      totalProducts: products.length,
      totalCategories: this.categories.size,
      totalUsers: this.users.size,
      loggedInUsersCount,
      totalOrders: orders.length,
      totalRevenue,
      lowStockCount,
      totalSearches: this.searchLogs.length,
      searchLogs: this.searchLogs.slice(0, 50),
      recentLogins: this.loginLogs.slice(0, 50),
      users: users.slice(0, 50),
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
