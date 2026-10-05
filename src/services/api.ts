import type { 
  User, 
  Product, 
  Category, 
  Brand,
  CartItem, 
  Order, 
  Review, 
  ProductFilters, 
  AdminMetrics, 
  AIAdvisorResponse, 
  OrderStatus, 
  PaymentMethod,
  SearchLog,
  UserLoginLog,
  PaymentMethodConfig,
  OfferBanner
} from '../types/index.ts';

const TOKEN_KEY = 'buygen_auth_token';
const USER_KEY = 'buygen_auth_user';

// Immediately purge any previous or legacy login sessions on load
// Ensure fresh app state with zero pre-logged-in users ("edutha odane login aga koodathu")
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('buygen_token');
    localStorage.removeItem('buygen_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('buygen_session_token');
    localStorage.removeItem('buygen_session_user');
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem('buygen_session_token');
    sessionStorage.removeItem('buygen_session_user');
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export const getStoredToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredAuth = (token: string, user: User) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error(e);
  }
};

export const clearStoredAuth = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('buygen_token');
    localStorage.removeItem('buygen_user');
  } catch (e) {
    console.error(e);
  }
};

export const getStoredUser = (): User | null => {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export class AuthApiError extends Error {
  code?: 'USER_NOT_FOUND' | 'EMAIL_ALREADY_EXISTS' | 'INVALID_PASSWORD' | 'VALIDATION_ERROR' | string;
  email?: string;
  suggestedAction?: 'switch_to_register' | 'switch_to_login' | 'reset_password';

  constructor(message: string, code?: string, email?: string) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.email = email;

    if (code === 'USER_NOT_FOUND') {
      this.suggestedAction = 'switch_to_register';
    } else if (code === 'EMAIL_ALREADY_EXISTS') {
      this.suggestedAction = 'switch_to_login';
    } else if (code === 'INVALID_PASSWORD') {
      this.suggestedAction = 'reset_password';
    }
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new AuthApiError(data.error || 'Network request failed. Please try again.', data.code, data.email);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string, confirmPassword: string, role?: 'customer' | 'admin') =>
    request<{ user: User; token: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword, role })
    }),

  login: (email: string, password: string) =>
    request<{ user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  loginWithGoogle: (email?: string, name?: string) =>
    request<{ user: User; token: string; message: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name })
    }),

  resetPassword: (email: string, newPassword: string, confirmPassword?: string) =>
    request<{ user: User; token: string; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword, confirmPassword })
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  logout: () => request<{ success: boolean; message: string }>('/auth/logout', { method: 'POST' }),

  // Products
  getProducts: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.subcategory) params.append('subcategory', filters.subcategory);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minRating !== undefined) params.append('minRating', filters.minRating.toString());
    if (filters.inStockOnly) params.append('inStockOnly', 'true');
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.adminEmail) params.append('adminEmail', filters.adminEmail);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ products: Product[]; total: number }>(`/products${query}`);
  },

  getProductById: (id: string) =>
    request<{ product: Product; reviews: Review[]; related: Product[] }>(`/products/${id}`),

  createProduct: (data: Partial<Product>) =>
    request<{ product: Product; message: string }>('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  createProductsBatch: (products: Partial<Product>[]) =>
    request<{ products: Product[]; message: string }>('/products/batch', {
      method: 'POST',
      body: JSON.stringify({ products })
    }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<{ product: Product; message: string }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  updateStock: (id: string, stock: number) =>
    request<{ product: Product; message: string }>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock })
    }),

  getProductActivity: (id: string) =>
    request<{
      product: Product;
      orders: {
        orderId: string;
        userId: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        quantity: number;
        priceAtPurchase: number;
        itemTotal: number;
        orderTotal: number;
        paymentMethod: string;
        orderStatus: string;
        orderDate: string;
        selectedColor?: string;
      }[];
      totalUnitsSold: number;
      totalRevenue: number;
    }>(`/admin/products/${id}/activity`),

  deleteProduct: (id: string) =>
    request<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE'
    }),

  // Categories
  getCategories: () => request<{ categories: Category[] }>('/categories'),

  createCategory: (data: Partial<Category>) =>
    request<{ category: Category; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCategory: (id: string, data: Partial<Category>) =>
    request<{ category: Category; message: string }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteCategory: (id: string) =>
    request<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE'
    }),

  clearAllCategories: () =>
    request<{ success: boolean; message: string }>('/categories/all/clear', {
      method: 'DELETE'
    }),

  // Brands
  getBrands: (category?: string) =>
    request<{ brands: Brand[] }>(`/brands${category ? `?category=${encodeURIComponent(category)}` : ''}`),

  createBrand: (data: Partial<Brand>) =>
    request<{ brand: Brand; message: string }>('/brands', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateBrand: (id: string, data: Partial<Brand>) =>
    request<{ brand: Brand; message: string }>(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteBrand: (id: string) =>
    request<{ success: boolean; message: string }>(`/brands/${id}`, {
      method: 'DELETE'
    }),

  // Promotional Offers & Banners (Added by Admin)
  getOffers: () => request<{ offers: OfferBanner[] }>('/offers'),

  getAdminOffers: () => request<{ offers: OfferBanner[] }>('/admin/offers'),

  createOffer: (data: Partial<OfferBanner>) =>
    request<{ offer: OfferBanner; message: string }>('/admin/offers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateOffer: (id: string, data: Partial<OfferBanner>) =>
    request<{ offer: OfferBanner; message: string }>(`/admin/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteOffer: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/offers/${id}`, {
      method: 'DELETE'
    }),

  cleanCatalog: () =>
    request<{ success: boolean; message: string; deletedProducts: number; deletedCategories: number }>('/admin/clean-catalog', {
      method: 'POST'
    }),

  // Cart
  getCart: () => request<{ items: CartItem[]; subtotal: number; discount: number; total: number }>('/cart'),

  addToCart: (productId: string, quantity: number = 1, selectedColor?: string) =>
    request<{ items: CartItem[]; subtotal: number; discount: number; total: number; message: string }>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, selectedColor })
    }),

  updateCartQuantity: (productId: string, quantity: number) =>
    request<{ items: CartItem[]; subtotal: number; discount: number; total: number }>('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity })
    }),

  removeFromCart: (productId: string) =>
    request<{ items: CartItem[]; subtotal: number; discount: number; total: number; message: string }>(`/cart/${productId}`, {
      method: 'DELETE'
    }),

  clearCart: () => request<{ items: CartItem[]; subtotal: number; discount: number; total: number }>('/cart/clear', {
    method: 'POST'
  }),

  // Wishlist
  getWishlist: () => request<{ wishlist: Product[] }>('/wishlist'),

  toggleWishlist: (productId: string) =>
    request<{ inWishlist: boolean; wishlist: Product[] }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId })
    }),

  // Orders & Stock Reservation
  reserveStock: (items: { productId: string; quantity: number }[]) =>
    request<{ reservationId: string; expiresAt: string }>('/orders/reserve', {
      method: 'POST',
      body: JSON.stringify({ items })
    }),

  releaseReservation: (reservationId: string) =>
    request<{ success: boolean; message: string }>('/orders/release-reservation', {
      method: 'POST',
      body: JSON.stringify({ reservationId })
    }),

  getOrders: () => request<{ orders: Order[] }>('/orders'),

  getOrderById: (id: string) => request<{ order: Order }>(`/orders/${id}`),

  createOrder: (data: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    paymentMethod: PaymentMethod;
    reservationId?: string;
  }) =>
    request<{ order: Order; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  seedStarterCatalog: () =>
    request<{ success: boolean; message: string; categoriesCount: number; brandsCount: number; productsCount: number }>('/admin/seed-starter', {
      method: 'POST'
    }),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<{ order: Order; message: string }>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  // Reviews
  getVerifiedPurchaseOrders: (productId: string) =>
    request<{
      hasPurchased: boolean;
      orders: {
        orderId: string;
        orderDate: string;
        status: string;
        quantity: number;
        selectedColor?: string;
        price: number;
        alreadyReviewed: boolean;
        existingReview?: Review | null;
      }[];
    }>(`/products/${productId}/verified-purchase`),
  checkReviewEligibility: (productId: string) =>
    request<{
      hasPurchased: boolean;
      orders: {
        orderId: string;
        orderDate: string;
        status: string;
        quantity: number;
        selectedColor?: string;
        price: number;
        alreadyReviewed: boolean;
        existingReview?: Review | null;
      }[];
    }>(`/products/${productId}/verified-purchase`),

  addReview: (productId: string, rating: number, comment: string, orderId: string) =>
    request<{ review: Review; product: Product; reviews: Review[]; message?: string }>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment, orderId })
    }),

  // Admin
  getAdminMetrics: (adminEmail?: string) => 
    request<AdminMetrics>(adminEmail ? `/admin/metrics?adminEmail=${encodeURIComponent(adminEmail)}` : '/admin/metrics'),

  getAdminUsers: () => request<{ users: (User & { orderCount: number })[] }>('/admin/users'),

  getAdminSearches: () => request<{ searches: SearchLog[] }>('/admin/searches'),
  getSearchLogs: () => request<{ searches: SearchLog[] }>('/admin/searches'),

  getAdminLogins: () => request<{ logins: UserLoginLog[] }>('/admin/logins'),

  clearAdminLogins: () => request<{ success: boolean; message: string }>('/admin/logins', {
    method: 'DELETE'
  }),

  // Payment Methods
  getPaymentMethods: () => request<{ paymentMethods: PaymentMethodConfig[] }>('/payment-methods'),

  getAdminPaymentMethods: () => request<{ paymentMethods: PaymentMethodConfig[] }>('/admin/payment-methods'),

  updatePaymentMethod: (id: string, data: Partial<PaymentMethodConfig>) =>
    request<{ paymentMethod: PaymentMethodConfig; message: string }>(`/admin/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  createPaymentMethod: (data: Partial<PaymentMethodConfig>) =>
    request<{ paymentMethod: PaymentMethodConfig; message: string }>('/admin/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deletePaymentMethod: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/payment-methods/${id}`, {
      method: 'DELETE'
    }),

  logSearch: (query: string, resultsCount?: number) =>
    request<{ success: boolean }>('/search-log', {
      method: 'POST',
      body: JSON.stringify({ query, resultsCount })
    }),

  // AI Features
  askTechAdvisor: (prompt: string) =>
    request<AIAdvisorResponse>('/ai/advisor', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    }),

  compareProducts: (productIds: string[]) =>
    request<{ products: Product[]; analysis: string }>('/ai/compare', {
      method: 'POST',
      body: JSON.stringify({ productIds })
    }),

  smartSearch: (query: string) =>
    request<{ products: Product[]; interpreted: any }>('/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query })
    })
};
