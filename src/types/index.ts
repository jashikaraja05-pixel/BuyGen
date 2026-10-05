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
  icon?: string;
  subcategories: string[];
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  categoryIds?: string[]; // Associated categories
  active: boolean;
  createdAt: string;
  updatedAt?: string;
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
  payeeName?: string;
  qrCodeUrl?: string;
  qrCodeCustomBase64?: string;
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

export interface ShippingCheckpoint {
  id: string;
  status: OrderStatus;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

export interface ShippingInfo {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  currentStatus: OrderStatus;
  currentLocation: string;
  lastUpdated: string;
  checkpoints: ShippingCheckpoint[];
  notes?: string;
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
  shippingInfo?: ShippingInfo;
  createdAt: string;
  updatedAt: string;
}

export interface OfferBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  discountType?: 'percentage' | 'fixed';
  discountPercentage?: number;
  discountValue?: number;
  category?: string; // categoryId or 'all'
  brand?: string; // brand name or 'all'
  productId?: string; // productId or 'all'
  minPurchase?: number;
  startDate?: string;
  endDate?: string;
  promoCode?: string;
  imageUrl?: string;
  bgGradient?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
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
  totalBrands?: number;
  totalUsers: number;
  loggedInUsersCount?: number;
  totalOrders: number;
  pendingOrders?: number;
  deliveredOrders?: number;
  totalRevenue: number;
  lowStockCount: number;
  outOfStockCount?: number;
  activeOffersCount?: number;
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
