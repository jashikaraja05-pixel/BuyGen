import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Store,
  Eye, 
  EyeOff, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register } = useAuth();
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdminRole = role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please complete all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(name.trim(), email.trim(), password, confirmPassword, role);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. This email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden text-white">
      
      {/* Background Neon Glowing Orbs */}
      <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
        isAdminRole ? 'bg-amber-500/20' : 'bg-cyan-500/20'
      }`}></div>
      <div className={`absolute bottom-0 -right-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
        isAdminRole ? 'bg-amber-600/15' : 'bg-indigo-600/20'
      }`}></div>

      <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
        
        {/* Brand & Heading */}
        <div className="text-center space-y-3">
          <div className="relative inline-block group">
            <div className={`absolute -inset-2 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition animate-pulse ${
              isAdminRole ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600'
            }`}></div>
            <img 
              src="/buygen-logo.jpg" 
              alt="BUYGEN" 
              className={`relative w-20 h-20 mx-auto rounded-2xl object-cover shadow-2xl p-0.5 bg-slate-950 ring-2 ${
                isAdminRole ? 'ring-amber-400/80' : 'ring-cyan-400/80'
              }`} 
            />
          </div>

          <h1 className="font-heading font-black text-3xl tracking-tight text-white">
            Create BUY<span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">GEN</span> Account
          </h1>
          <p className="text-xs text-slate-300">
            {isAdminRole ? 'Register an Administrator account for inventory and order management.' : 'Join BUYGEN for consumer electronics shopping & instant order tracking.'}
          </p>
        </div>

        {/* Account Role Selector */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => { setRole('customer'); setError(null); }}
            className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              !isAdminRole
                ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Customer Account</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('admin'); setError(null); }}
            className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              isAdminRole
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Account</span>
          </button>
        </div>

        {/* Card Container */}
        <div className={`bg-[#0b0e22]/90 backdrop-blur-2xl border rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl transition-colors duration-500 ${
          isAdminRole ? 'border-amber-500/30' : 'border-cyan-500/25'
        }`}>
          
          {error && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={isAdminRole ? "Administrator Name" : "Rohan Sharma"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden transition shadow-inner font-medium"
                />
                <User className={`w-4 h-4 absolute left-3.5 top-3 ${isAdminRole ? 'text-amber-400/80' : 'text-cyan-400/80'}`} />
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
                  placeholder={isAdminRole ? "admin@buygen.com" : "name@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden transition shadow-inner font-medium"
                />
                <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${isAdminRole ? 'text-amber-400/80' : 'text-cyan-400/80'}`} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden transition shadow-inner"
                />
                <Phone className={`w-4 h-4 absolute left-3.5 top-3 ${isAdminRole ? 'text-amber-400/80' : 'text-cyan-400/80'}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white focus:outline-hidden shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Confirm *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-type"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-white focus:outline-hidden shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                isAdminRole
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
              }`}
            >
              <span>{loading ? 'Creating Account...' : `Register as ${isAdminRole ? 'Store Admin' : 'Customer'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <span className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                Sign In directly
              </button>
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
