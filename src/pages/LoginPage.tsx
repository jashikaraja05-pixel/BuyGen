import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Store, 
  Eye, 
  EyeOff, 
  HelpCircle,
  X,
  CheckCircle2,
  UserPlus,
  KeyRound,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, loginWithGoogle, resetPassword, authFeedback, clearAuthFeedback, setAuthFeedback } = useAuth();
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  
  // Empty credentials by default - user fills them in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot password modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Google sign in modal for customer
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  const handleTabChange = (tab: 'customer' | 'admin') => {
    setActiveTab(tab);
    clearAuthFeedback();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthFeedback({
        type: 'error',
        message: 'Please enter both email and password.',
        code: 'VALIDATION_ERROR'
      });
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      if (email.toLowerCase().includes('admin') || activeTab === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const openGoogleSignIn = () => {
    if (email.trim() && email.includes('@')) {
      setGoogleEmail(email.trim());
    }
    setShowGoogleModal(true);
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setAuthFeedback({
        type: 'error',
        message: 'Please enter a valid Google email address.',
        code: 'VALIDATION_ERROR'
      });
      return;
    }

    try {
      setGoogleLoading(true);
      clearAuthFeedback();
      const chosenEmail = googleEmail.trim().toLowerCase();
      const chosenName = googleName.trim() || chosenEmail.split('@')[0];
      await loginWithGoogle(chosenEmail, chosenName);
      setShowGoogleModal(false);
      navigate('/');
    } catch {
      // Handled in AuthContext
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !resetNewPass) {
      setAuthFeedback({
        type: 'error',
        message: 'Please enter your email and a new password.',
        code: 'VALIDATION_ERROR'
      });
      return;
    }
    if (resetNewPass.length < 6) {
      setAuthFeedback({
        type: 'error',
        message: 'New password must be at least 6 characters long.',
        code: 'VALIDATION_ERROR'
      });
      return;
    }
    if (resetConfirmPass && resetNewPass !== resetConfirmPass) {
      setAuthFeedback({
        type: 'error',
        message: 'Passwords do not match.',
        code: 'VALIDATION_ERROR'
      });
      return;
    }

    try {
      setResetLoading(true);
      await resetPassword(forgotEmail.trim(), resetNewPass, resetConfirmPass);
      setShowForgotPassword(false);
      if (activeTab === 'admin' || forgotEmail.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch {
      // Handled in AuthContext
    } finally {
      setResetLoading(false);
    }
  };

  const isAdminTab = activeTab === 'admin';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden text-white">
      
      {/* Background Neon Glowing Orbs */}
      <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
        isAdminTab ? 'bg-amber-500/20' : 'bg-cyan-500/20'
      }`}></div>
      <div className={`absolute bottom-0 -right-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
        isAdminTab ? 'bg-amber-600/15' : 'bg-indigo-600/20'
      }`}></div>

      <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
        
        {/* Brand & Heading */}
        <div className="text-center space-y-3">
          <div className="relative inline-block group">
            <div className={`absolute -inset-2 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition animate-pulse ${
              isAdminTab ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600'
            }`}></div>
            <img 
              src="/buygen-logo.jpg" 
              alt="BUYGEN" 
              className={`relative w-20 h-20 mx-auto rounded-2xl object-cover shadow-2xl p-0.5 bg-slate-950 ring-2 ${
                isAdminTab ? 'ring-amber-400/80' : 'ring-cyan-400/80'
              }`} 
            />
          </div>

          <h1 className="font-heading font-black text-3xl tracking-tight text-white">
            Sign In to BUY<span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">GEN</span>
          </h1>
          <p className="text-xs text-slate-300">
            Sign in to access your electronics account or administration console.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              !isAdminTab
                ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Customer Store</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              isAdminTab
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Console</span>
          </button>
        </div>

        {/* Card Container */}
        <div className={`bg-[#0b0e22]/90 backdrop-blur-2xl border rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl transition-colors duration-500 ${
          isAdminTab ? 'border-amber-500/30' : 'border-cyan-500/25'
        }`}>
          
          {/* UNIFIED SMART AUTH FEEDBACK BANNER */}
          {authFeedback && (
            <div className={`p-4 rounded-2xl border text-xs transition-all duration-300 shadow-xl ${
              authFeedback.code === 'USER_NOT_FOUND'
                ? 'bg-gradient-to-r from-sky-950/90 to-cyan-950/70 border-cyan-500/50 text-cyan-100 shadow-cyan-500/10'
                : authFeedback.code === 'EMAIL_ALREADY_EXISTS'
                ? 'bg-gradient-to-r from-indigo-950/90 to-purple-950/70 border-indigo-500/50 text-indigo-100 shadow-indigo-500/10'
                : authFeedback.code === 'INVALID_PASSWORD'
                ? 'bg-gradient-to-r from-amber-950/90 to-orange-950/70 border-amber-500/50 text-amber-100 shadow-amber-500/10'
                : authFeedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-100 shadow-rose-500/10'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  authFeedback.code === 'USER_NOT_FOUND'
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/40'
                    : authFeedback.code === 'INVALID_PASSWORD'
                    ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40'
                    : authFeedback.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {authFeedback.code === 'USER_NOT_FOUND' && <UserPlus className="w-4 h-4" />}
                  {authFeedback.code === 'INVALID_PASSWORD' && <KeyRound className="w-4 h-4" />}
                  {authFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {(!authFeedback.code && authFeedback.type === 'error') && <AlertCircle className="w-4 h-4" />}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-heading font-bold text-sm tracking-tight text-white">
                      {authFeedback.code === 'USER_NOT_FOUND' && 'No Account Found'}
                      {authFeedback.code === 'INVALID_PASSWORD' && 'Incorrect Password'}
                      {authFeedback.type === 'success' && 'Success'}
                      {(!authFeedback.code && authFeedback.type === 'error') && 'Notice'}
                    </p>
                    <button
                      type="button"
                      onClick={clearAuthFeedback}
                      className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {authFeedback.message}
                  </p>

                  {/* Contextual Action Shortcuts */}
                  {authFeedback.code === 'USER_NOT_FOUND' && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          clearAuthFeedback();
                          navigate('/register');
                        }}
                        className="py-2 px-3.5 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register Account with {authFeedback.email || 'this email'} →</span>
                      </button>
                    </div>
                  )}

                  {authFeedback.code === 'INVALID_PASSWORD' && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(authFeedback.email || email);
                          setShowForgotPassword(true);
                          clearAuthFeedback();
                        }}
                        className="py-2 px-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Reset Password Now</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 1. Main Credentials Form (Email ID & Password) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email ID Field (User enters their email) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {isAdminTab ? 'Administrator Email ID' : 'Customer Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={isAdminTab ? 'admin@buygen.com' : 'name@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden transition shadow-inner font-medium"
                />
                <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${isAdminTab ? 'text-amber-400' : 'text-cyan-400'}`} />
              </div>
            </div>

            {/* Password Field (User enters their password) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden transition shadow-inner"
                />
                <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isAdminTab ? 'text-amber-400' : 'text-cyan-400'}`} />
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

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                isAdminTab
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
              }`}
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${isAdminTab ? 'Administrator' : 'Customer'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* ONLY SHOW GOOGLE LOGIN OPTION FOR CUSTOMER STORE */}
          {!isAdminTab && (
            <>
              {/* 2. OR DIVIDER (After Email & Password) */}
              <div className="relative flex items-center justify-center my-3">
                <div className="w-full border-t border-slate-800"></div>
                <span className="absolute bg-[#0b0e22] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  OR
                </span>
              </div>

              {/* 3. SIGN IN WITH GOOGLE (Explicit Account Selection) */}
              <button
                type="button"
                onClick={openGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-3 cursor-pointer active:scale-98 ring-1 ring-slate-200"
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
                <span>{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </>
          )}

          {/* 4. CREATE ACCOUNT LINK (Below Google Sign In) */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-300">
              {isAdminTab ? "Need an administrator account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className={`font-black underline cursor-pointer hover:opacity-90 ${
                  isAdminTab ? 'text-amber-400 hover:text-amber-300' : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                {isAdminTab ? 'Create Admin Account' : 'Create Customer Account'}
              </button>
            </span>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0e22] border border-cyan-500/30 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => { setShowForgotPassword(false); setResetNewPass(''); setResetConfirmPass(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-heading font-bold text-lg text-white">Reset Password</h3>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered email address and your new password to restore access immediately.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  New Password * (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={resetConfirmPass}
                  onChange={(e) => setResetConfirmPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs rounded-xl hover:opacity-95 transition cursor-pointer"
              >
                {resetLoading ? 'Updating...' : 'Save New Password & Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Google Account Selector Modal (Customer Store) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0e22] border border-cyan-500/30 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => { setShowGoogleModal(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-white">Sign in with Google</h3>
                <p className="text-[11px] text-slate-400">Select or enter your Google account</p>
              </div>
            </div>

            <form onSubmit={handleGoogleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Google Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white"
                  />
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={googleLoading}
                  className="w-full py-3 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>{googleLoading ? 'Signing in...' : 'Continue with Google Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
