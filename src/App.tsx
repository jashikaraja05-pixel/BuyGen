import React, { useState, useEffect } from 'react';
import { ShieldAlert, Eye, ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { CompareProvider } from './context/CompareContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Toast } from './components/Toast.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';

// Customer Pages
import { AuthGatewayPage } from './pages/AuthGatewayPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { ProductDetailsPage } from './pages/ProductDetailsPage.tsx';
import { CategoryProductsPage } from './pages/CategoryProductsPage.tsx';
import { SearchResultsPage } from './pages/SearchResultsPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { OrderDetailsPage } from './pages/OrderDetailsPage.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { AdvisorPage } from './pages/AdvisorPage.tsx';
import { ComparePage } from './pages/ComparePage.tsx';
import { OrderTrackingPage } from './pages/OrderTrackingPage.tsx';

// Admin Pages
import { AdminLayout, type AdminTab } from './pages/admin/AdminLayout.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.tsx';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.tsx';
import { AdminBrandsPage } from './pages/admin/AdminBrandsPage.tsx';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage.tsx';
import { AdminOffersPage } from './pages/admin/AdminOffersPage.tsx';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.tsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.tsx';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage.tsx';

function AppInner() {
  const { user, loading, logout } = useAuth();
  const [splashDone, setSplashDone] = useState<boolean>(() => {
    return sessionStorage.getItem('buygen_splash_passed') === 'true';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/';
  });

  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [adminStorePreview, setAdminStorePreview] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Initial 2-second Splash Screen with GET STARTED and official logo
  if (!splashDone) {
    return (
      <SplashScreen 
        onComplete={() => {
          sessionStorage.setItem('buygen_splash_passed', 'true');
          setSplashDone(true);
        }} 
      />
    );
  }

  // 2. Loading auth state from localStorage/server
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060814] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-cyan-500/50">
            <img src="/buygen-logo.jpg" alt="BUYGEN" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-3xl blur-md opacity-40 animate-pulse"></div>
        </div>
        <p className="text-cyan-400 font-heading font-bold text-sm tracking-wider animate-pulse">
          BUYGEN Electronics...
        </p>
      </div>
    );
  }

  // 3. Enforce Mandatory Login Gate: Only after login can users enter the store or admin panel!
  if (!user) {
    return <AuthGatewayPage navigate={navigate} />;
  }

  // 3. User is authenticated -> Render full BUYGEN store or admin console
  const [pathPart, searchPart] = currentPath.split('?');
  const searchParams = new URLSearchParams(searchPart || '');

  // Dedicated Standard E-Commerce Admin Dashboard (Exclusively for authorized admins)
  if (user.role === 'admin' && !adminStorePreview) {
    return (
      <AdminLayout
        currentAdminTab={adminTab}
        setAdminTab={setAdminTab}
        navigate={navigate}
        onPreviewStore={() => setAdminStorePreview(true)}
      >
        {adminTab === 'dashboard' && <AdminDashboard setAdminTab={setAdminTab} navigate={navigate} />}
        {adminTab === 'categories' && <AdminCategoriesPage />}
        {adminTab === 'brands' && <AdminBrandsPage />}
        {adminTab === 'products' && <AdminProductsPage />}
        {adminTab === 'inventory' && <AdminInventoryPage />}
        {adminTab === 'offers' && <AdminOffersPage />}
        {adminTab === 'orders' && <AdminOrdersPage />}
        {adminTab === 'payments' && <AdminPaymentsPage />}
        {adminTab === 'users' && <AdminUsersPage />}
      </AdminLayout>
    );
  }

  // Admin Portal URL Protection (Customers blocked from /admin)
  if (pathPart.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-[#070814] flex flex-col items-center justify-center p-6 text-center text-white space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10 animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Access Denied: Admin Only
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Your current account (<strong className="text-slate-200">{user.email}</strong>) is registered as a <span className="text-cyan-400 font-bold">Store Customer</span>. Access to the BUYGEN Store Administrator Console is restricted to authorized platform owners.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Return to Customer Store
          </button>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition cursor-pointer"
          >
            Sign In as Administrator
          </button>
        </div>
      </div>
    );
  }

  // Customer Store Routes
  let pageContent = null;

  if (pathPart === '/' || pathPart === '') {
    pageContent = <HomePage navigate={navigate} />;
  } else if (pathPart === '/products') {
    const categoryParam = searchParams.get('category') || undefined;
    const searchParam = searchParams.get('search') || undefined;
    pageContent = (
      <ProductsPage 
        key={`${categoryParam || 'all'}-${searchParam || ''}`} 
        initialFilters={{ category: categoryParam, search: searchParam }} 
        navigate={navigate} 
      />
    );
  } else if (pathPart.startsWith('/products/')) {
    const productId = pathPart.replace('/products/', '');
    pageContent = <ProductDetailsPage productId={productId} navigate={navigate} />;
  } else if (pathPart.startsWith('/categories/')) {
    const catSlug = pathPart.replace('/categories/', '');
    pageContent = <CategoryProductsPage categorySlug={catSlug} navigate={navigate} />;
  } else if (pathPart === '/search') {
    const query = searchParams.get('q') || '';
    pageContent = <SearchResultsPage searchQuery={query} navigate={navigate} />;
  } else if (pathPart === '/cart') {
    pageContent = <CartPage navigate={navigate} />;
  } else if (pathPart === '/checkout') {
    pageContent = <CheckoutPage navigate={navigate} />;
  } else if (pathPart.startsWith('/order-success/')) {
    const orderId = pathPart.replace('/order-success/', '');
    pageContent = <OrderSuccessPage orderId={orderId} navigate={navigate} />;
  } else if (pathPart === '/orders') {
    const trackParam = searchParams.get('track') || searchParams.get('id') || undefined;
    pageContent = <OrdersPage initialTrackingId={trackParam} navigate={navigate} />;
  } else if (pathPart.startsWith('/orders/')) {
    const orderId = pathPart.replace('/orders/', '');
    pageContent = <OrderDetailsPage orderId={orderId} navigate={navigate} />;
  } else if (pathPart === '/wishlist') {
    pageContent = <WishlistPage navigate={navigate} />;
  } else if (pathPart === '/profile') {
    pageContent = <ProfilePage navigate={navigate} />;
  } else if (pathPart === '/login') {
    pageContent = <LoginPage navigate={navigate} />;
  } else if (pathPart === '/register') {
    pageContent = <RegisterPage navigate={navigate} />;
  } else if (pathPart === '/advisor') {
    const q = searchParams.get('q') || '';
    pageContent = <AdvisorPage initialQuery={q} navigate={navigate} />;
  } else if (pathPart === '/compare') {
    pageContent = <ComparePage navigate={navigate} />;
  } else {
    pageContent = <HomePage navigate={navigate} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#070814] text-slate-100">
      {user.role === 'admin' && adminStorePreview && (
        <aside aria-label="Storefront preview banner" className="sticky top-0 z-[100] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xl border-b border-amber-600">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>
              Customer Storefront Preview Mode — Viewing live store as customer sees it. (Admin: <strong className="text-slate-900">{user.name}</strong>)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAdminStorePreview(false)}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-lg transition shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Return to Admin Console</span>
          </button>
        </aside>
      )}
      <Navbar currentPath={pathPart} navigate={navigate} />
      <main className="flex-1 bg-[#080918]">
        {pageContent}
      </main>
      <Footer navigate={navigate} />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <AppInner />
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
