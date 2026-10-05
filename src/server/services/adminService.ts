import { storage } from '../config/storage.ts';
import type { 
  AdminMetrics, 
  User, 
  Product, 
  Order, 
  SearchLog, 
  UserLoginLog, 
  PaymentMethodConfig 
} from '../../types/index.ts';

export const adminService = {
  getAdminMetrics(_adminEmail?: string): AdminMetrics {
    const products: Product[] = storage.getAllProducts().products;
    const categories = storage.getAllCategories();
    const orders: Order[] = storage.getAllOrders();
    const usersRaw: User[] = storage.getAllUsers();
    const searchLogs: SearchLog[] = storage.getSearchLogs();
    const recentLogins: UserLoginLog[] = storage.getLoginLogs().slice(0, 15);

    const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const totalBrands = storage.getAllBrands().length;
    const totalUsers = usersRaw.length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const activeOffersCount = storage.getOffers().length;
    const totalSearches = searchLogs.length;

    const recentOrders = [...orders].slice(0, 10);

    const usersWithOrders = usersRaw.map(u => {
      const userOrders = orders.filter(o => o.userId === u.id);
      const totalSpend = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      return {
        ...u,
        orderCount: userOrders.length,
        totalSpend,
        lastLogin: u.lastLogin
      };
    });

    const catMap = new Map<string, { count: number; revenue: number }>();
    for (const p of products) {
      const cat = p.categoryName || 'Consumer Electronics';
      const cur = catMap.get(cat) || { count: 0, revenue: 0 };
      catMap.set(cat, { count: cur.count + 1, revenue: cur.revenue });
    }
    for (const o of orders) {
      for (const it of o.items) {
        const p = products.find(prod => prod.id === it.productId);
        const cat = p?.categoryName || 'Consumer Electronics';
        const cur = catMap.get(cat) || { count: 0, revenue: 0 };
        catMap.set(cat, { count: cur.count, revenue: cur.revenue + (it.price * it.quantity) });
      }
    }

    const categoryBreakdown = Array.from(catMap.entries()).map(([category, val]) => ({
      category,
      count: val.count,
      revenue: val.revenue
    }));

    return {
      totalProducts,
      totalCategories,
      totalBrands,
      totalUsers,
      loggedInUsersCount: recentLogins.length,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
      lowStockCount,
      outOfStockCount,
      activeOffersCount,
      totalSearches,
      searchLogs: searchLogs.slice(0, 50),
      recentLogins,
      users: usersWithOrders,
      recentOrders,
      categoryBreakdown
    };
  },

  getAdminUsers(): (User & { orderCount: number })[] {
    const orders = storage.getAllOrders();
    const users = storage.getAllUsers().map(u => {
      const orderCount = orders.filter(o => o.userId === u.id).length;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        orderCount
      };
    });

    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAdminSearches(): SearchLog[] {
    return storage.getSearchLogs();
  },

  logSearch(queryText: string, resultsCount = 0, userName = 'Guest', userEmail = 'guest@buygen.com') {
    const id = 'slog-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const logEntry: SearchLog = {
      id,
      query: queryText.trim(),
      userName,
      userEmail,
      resultsCount,
      timestamp: new Date().toISOString()
    };
    storage.addSearchLog(logEntry);
  },

  getAdminLogins(): UserLoginLog[] {
    return storage.getLoginLogs();
  },

  clearAdminLogins(): boolean {
    storage.clearLoginLogs();
    return true;
  },

  getPaymentMethods(): PaymentMethodConfig[] {
    return storage.getPaymentMethods();
  },

  getAdminPaymentMethods(): PaymentMethodConfig[] {
    return storage.getAdminPaymentMethods();
  },

  createPaymentMethod(data: Partial<PaymentMethodConfig>): PaymentMethodConfig {
    const id = data.id || 'pm-' + Date.now();
    const pm: PaymentMethodConfig = {
      id,
      name: (data.name || 'New Payment Method').trim(),
      type: data.type || 'custom',
      enabled: data.enabled !== false,
      description: data.description || '',
      upiId: data.upiId,
      qrCodeUrl: data.qrCodeUrl,
      instructions: data.instructions
    };
    return storage.createPaymentMethod(pm);
  },

  updatePaymentMethod(id: string, updates: Partial<PaymentMethodConfig>): PaymentMethodConfig {
    return storage.updatePaymentMethod(id, updates);
  },

  deletePaymentMethod(id: string): boolean {
    return storage.deletePaymentMethod(id);
  }
};
