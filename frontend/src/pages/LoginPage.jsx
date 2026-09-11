import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Headphones, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (role === 'SUPPORT_AGENT') {
      navigate('/agent/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPassword);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-black text-slate-900">Sign In to Your Account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter credentials or select a one-click demo profile below
        </p>
      </div>

      {/* One-Click Demo Role Switcher */}
      <div className="mb-6 space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
          Instant Demo Access:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickDemo('admin@example.com', 'Admin@123')}
            className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 hover:border-purple-300 text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Admin
            </div>
            <div className="text-[10px] text-purple-700 truncate mt-0.5">Admin@123</div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickDemo('agent@example.com', 'Agent@123')}
            className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 hover:border-blue-300 text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Headphones className="w-3.5 h-3.5 text-blue-600" /> Agent
            </div>
            <div className="text-[10px] text-blue-700 truncate mt-0.5">Agent@123</div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickDemo('customer@example.com', 'Customer@123')}
            className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 hover:border-emerald-300 text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <User className="w-3.5 h-3.5 text-emerald-600" /> Customer
            </div>
            <div className="text-[10px] text-emerald-700 truncate mt-0.5">Customer@123</div>
          </button>
        </div>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-slate-400 font-medium">Or enter credentials</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs transition-all outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500">
          Create customer account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
