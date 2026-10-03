import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { CompareProvider } from './context/CompareContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Toast } from './components/Toast.tsx';
import { FloatingDock } from './components/FloatingDock.tsx';
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

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.tsx';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.tsx';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.tsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.tsx';

function AppInner() {
  const { user, loading } = useAuth();
  const [splashDone, setSplashDone] = useState<boolean>(() => {
    return sessionStorage.getItem('buygen_splash_passed') === 'true';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/';
  });

  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'users'>('dashboard');

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

  // Admin Portal Routes
  if (pathPart.startsWith('/admin')) {
    return (
      <AdminLayout
        currentAdminTab={adminTab}
        setAdminTab={setAdminTab}
        navigate={navigate}
      >
        {adminTab === 'dashboard' && <AdminDashboard setAdminTab={setAdminTab} navigate={navigate} />}
        {adminTab === 'products' && <AdminProductsPage />}
        {adminTab === 'categories' && <AdminCategoriesPage />}
        {adminTab === 'orders' && <AdminOrdersPage />}
        {adminTab === 'users' && <AdminUsersPage />}
      </AdminLayout>
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
    pageContent = <OrdersPage navigate={navigate} />;
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
      <Navbar currentPath={pathPart} navigate={navigate} />
      <main className="flex-1 bg-[#080918]">
        {pageContent}
      </main>
      <Footer navigate={navigate} />
      <FloatingDock currentPath={currentPath} navigate={navigate} />
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
