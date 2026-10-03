export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

export interface SpecificationItem {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number; // percentage
  stock: number;
  rating: number;
  reviewCount: number;
  orderCount?: number;
  unitsSold?: number;
  images: string[];
  colors?: string[];
  availableColours?: string[];
  specifications: Record<string, string>;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  badge?: string;
  adminEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  description: string;
  icon: string;
  subcategories: string[];
  productCount?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  stock: number;
  selectedColor?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'upi' | 'cod' | 'card' | 'netbanking' | 'custom';
  enabled: boolean;
  description: string;
  upiId?: string;
  qrCodeUrl?: string;
  instructions?: string;
}

export type PaymentMethod = string;

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  orderId: string; // Linked specific verified order ID
  userId: string;
  userName: string;
  rating: number; // 1 to 5 stars
  comment: string;
  verifiedPurchase?: boolean;
  orderDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  stockStatus?: 'all' | 'instock' | 'lowstock' | 'outofstock';
  adminEmail?: string;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popularity';
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchLog {
  id: string;
  query: string;
  userName: string;
  userEmail: string;
  resultsCount: number;
  timestamp: string;
}

export interface UserLoginLog {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  loginTime: string;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  paymentMethod?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminMetrics {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  loggedInUsersCount?: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  totalSearches: number;
  searchLogs: SearchLog[];
  recentLogins: UserLoginLog[];
  users: (User & { orderCount: number; lastLogin?: string })[];
  recentOrders: Order[];
  categoryBreakdown: { category: string; count: number; revenue: number }[];
}

export interface AIAdvisorRecommendation {
  productId: string;
  productName: string;
  brand: string;
  price: number;
  image: string;
  rating: number;
  stock: number;
  type: 'recommended' | 'alternative';
  keySpecs: string[];
  whyItMatches: string;
  difference?: string;
}

export interface AIAdvisorResponse {
  extractedRequirements: {
    budget?: number;
    category?: string;
    keyFeatures?: string[];
    useCase?: string;
    brandPreference?: string;
  };
  summary: string;
  recommendations: AIAdvisorRecommendation[];
}
