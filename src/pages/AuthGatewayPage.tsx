import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Phone,
  Zap, 
  Store,
  HelpCircle,
  X,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthGatewayPageProps {
  navigate: (path: string) => void;
}

export const AuthGatewayPage: React.FC<AuthGatewayPageProps> = ({ navigate }) => {
  const { login, loginWithGoogle, register } = useAuth();
  
  // Dual Experience Portals: 'customer' vs 'admin'
  const [portal, setPortal] = useState<'customer' | 'admin'>('customer');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state - must be empty by default for user to fill
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Switch between Customer and Admin portals
  const handlePortalSwitch = (targetPortal: 'customer' | 'admin') => {
    setPortal(targetPortal);
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);

      if (portal === 'admin' || email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      const chosenEmail = portal === 'admin' ? 'gayathirisathyamoorthy2006@gmail.com' : 'customer@buygen.com';
      const chosenName = portal === 'admin' ? 'Gayathiri Sathyamoorthy (Admin)' : 'Customer Google User';
      
      await loginWithGoogle(chosenEmail, chosenName);
      
      if (portal === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirm) {
      setError('All required fields must be filled.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Pass designated role based on active portal
      await register(regName.trim(), regEmail.trim(), regPassword, regConfirm, portal);
      
      setSuccessMsg(`${portal === 'admin' ? 'Admin' : 'Customer'} account created successfully! Entering BUYGEN...`);
      setTimeout(() => {
        if (portal === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. That email might already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your registered email address.');
      return;
    }
    setForgotSent(true);
  };

  const isAdminPortal = portal === 'admin';

  return (
    <div className="min-h-screen bg-[#060814] text-white flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Background Neon Glowing Orbs */}
      <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
        isAdminPortal ? 'bg-amber-500/20' : 'bg-cyan-500/20'
      }`}></div>
      <div className={`absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
        isAdminPortal ? 'bg-amber-600/15' : 'bg-indigo-600/20'
      }`}></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Brand Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-60 blur-xs"></div>
            <img 
              src="/buygen-logo.jpg" 
              alt="BUYGEN Logo" 
              className="relative w-10 h-10 rounded-xl object-cover ring-1 ring-cyan-400/60 shadow-lg shadow-cyan-500/20" 
            />
          </div>
          <div>
            <span className="font-heading font-black text-xl tracking-tight text-white">
              BUY<span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">GEN</span>
            </span>
            <span className="hidden sm:block text-[10px] tracking-wider uppercase text-cyan-300/90 font-bold">
              Consumer Electronics Marketplace
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-8 space-y-6">
        
        {/* Logo & Headline */}
        <div className="text-center space-y-3">
          <div className="relative inline-block group">
            <div className={`absolute -inset-3 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse ${
              isAdminPortal 
                ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                : 'bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600'
            }`}></div>
            <img 
              src="/buygen-logo.jpg" 
              alt="BUYGEN" 
              className={`relative w-24 h-24 mx-auto rounded-2xl object-cover shadow-2xl p-0.5 bg-slate-950 ring-2 ${
                isAdminPortal ? 'ring-amber-400/80' : 'ring-cyan-400/80'
              }`}
            />
          </div>

          <h1 className="font-heading font-black text-3xl text-white tracking-tight">
            BUY<span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">GEN</span>
          </h1>
          <p className="text-xs font-bold tracking-widest uppercase text-cyan-300">
            Next-Gen Shopping, Smarter Choices.
          </p>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            {isAdminPortal 
              ? 'Administrator Console: Manage live store inventory, prices, orders, users, and customer reviews.'
              : 'Customer Store: Browse flagships, laptops, ANC audio, simulated checkout & real-time delivery tracking.'}
          </p>
        </div>

        {/* 1. DUAL EXPERIENCE SELECTOR: CUSTOMER STORE vs ADMIN PORTAL (as requested in Tamil) */}
        <div className="p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handlePortalSwitch('customer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
              !isAdminPortal
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <div className="text-left">
              <span className="block leading-none">Customer Store</span>
              <span className="text-[10px] font-normal opacity-80">Buyer & Shopper</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
              isAdminPortal
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <div className="text-left">
              <span className="block leading-none">Admin Portal</span>
              <span className="text-[10px] font-normal opacity-80">Store Management</span>
            </div>
          </button>
        </div>

        {/* 2. AUTH MODE TABS: Sign In vs Create New Account */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
            className={`py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? isAdminPortal
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-cyan-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In ({isAdminPortal ? 'Admin' : 'Customer'})</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
            className={`py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? isAdminPortal
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-cyan-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Create New {isAdminPortal ? 'Admin' : 'Account'}</span>
          </button>
        </div>

        {/* 3. CARD CONTAINER */}
        <div className={`bg-[#0b0e22]/90 backdrop-blur-2xl border rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl transition-colors duration-500 ${
          isAdminPortal ? 'border-amber-500/30' : 'border-cyan-500/25'
        }`}>
          
          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* GOOGLE SIGN-IN BUTTON */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-3 cursor-pointer active:scale-98 transform duration-150 ring-1 ring-slate-200"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? 'Signing in with Google...' : `Sign in with Google (${isAdminPortal ? 'Admin' : 'Customer'})`}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-slate-800"></div>
            <span className="absolute bg-[#0b0e22] px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Or with Credentials
            </span>
          </div>

          {/* MODE: SIGN IN */}
          {mode === 'login' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {isAdminPortal ? 'Administrator Email' : 'Customer Email Address'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={isAdminPortal ? 'admin@buygen.com' : 'customer@buygen.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden transition shadow-inner"
                  />
                  <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${isAdminPortal ? 'text-amber-400' : 'text-cyan-400'}`} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden transition shadow-inner"
                  />
                  <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isAdminPortal ? 'text-amber-400' : 'text-cyan-400'}`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  isAdminPortal
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                }`}
              >
                <span>{loading ? 'Authenticating...' : isAdminPortal ? 'Sign In to Admin Console' : 'Sign In to BUYGEN Store'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">
                  New to BUYGEN?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                  >
                    Create a {isAdminPortal ? 'Store Admin' : 'Customer'} Account
                  </button>
                </span>
              </div>
            </form>
          ) : (
            /* MODE: REGISTER / CREATE NEW ACCOUNT */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={isAdminPortal ? 'Store Administrator Name' : 'e.g. Alex Johnson'}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-400 shadow-inner"
                  />
                  <User className="w-4 h-4 text-cyan-400/80 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={isAdminPortal ? 'admin@company.com' : 'name@example.com'}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-400 shadow-inner"
                  />
                  <Mail className="w-4 h-4 text-cyan-400/80 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400 shadow-inner"
                    />
                    <Lock className="w-3.5 h-3.5 text-cyan-400/80 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400 shadow-inner"
                    />
                    <Lock className="w-3.5 h-3.5 text-cyan-400/80 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Portal designation badge */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Account Role Created:</span>
                <span className={`font-black uppercase px-2 py-0.5 rounded ${
                  isAdminPortal ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {isAdminPortal ? '🛡️ Administrator' : '🛒 Store Customer'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  isAdminPortal
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                }`}
              >
                <span>{loading ? 'Creating...' : `Register as ${isAdminPortal ? 'Store Admin' : 'Customer'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                  >
                    Sign In instead
                  </button>
                </span>
              </div>
            </form>
          )}

        </div>

      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0e22] border border-cyan-500/30 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-heading font-bold text-lg text-white">Reset Password</h3>
            </div>

            {forgotSent ? (
              <div className="space-y-3 text-center py-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-300">
                  Password reset link simulated and sent to <strong className="text-white">{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                  className="w-full py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-slate-400">
                  Enter your registered email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
