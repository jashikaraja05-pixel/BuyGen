import type { 
  User, 
  Product, 
  Category, 
  CartItem, 
  Order, 
  Review, 
  ProductFilters, 
  AdminMetrics, 
  AIAdvisorResponse, 
  OrderStatus, 
  PaymentMethod 
} from '../types/index.ts';

const TOKEN_KEY = 'buygen_auth_token';
const USER_KEY = 'buygen_auth_user';

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredAuth = (token: string, user: User) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error(e);
  }
};

export const clearStoredAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error(e);
  }
};

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

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
    throw new Error(data.error || 'Network request failed. Please try again.');
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

  // Orders
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
  }) =>
    request<{ order: Order; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
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

  addReview: (productId: string, rating: number, comment: string, orderId: string) =>
    request<{ review: Review; product: Product; reviews: Review[]; message?: string }>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment, orderId })
    }),

  // Admin
  getAdminMetrics: () => request<AdminMetrics>('/admin/metrics'),

  getAdminUsers: () => request<{ users: (User & { orderCount: number })[] }>('/admin/users'),

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
