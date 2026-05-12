import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../App';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const AdminLogin: React.FC = () => {
  const { loginAsAdmin, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@peernxt.com');
  const [password, setPassword] = useState('admin');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? '/dashboard';
  }, [location.state]);

  const canSubmit = isValidEmail(email) && password.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await loginAsAdmin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsSubmitting(false);
      return;
    }
    navigate(redirectTo);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100 hidden lg:block">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-sm font-semibold mb-6">
              <Shield size={16} />
              PeerNXT Admin
            </div>
            <h1 className="text-3xl font-bold mb-2">Manage PeerNXT</h1>
            <p className="text-indigo-100 text-lg mb-6 max-w-lg">
              Use the admin dashboard to manage users, meetings, ambassador slots, and events.
            </p>
            <div className="space-y-3 text-indigo-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/70" />
                Users & roles
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/70" />
                Counselor meetings
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/70" />
                Ambassador slots
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/70" />
                Events & RSVPs
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white/10 rounded-full backdrop-blur-3xl" />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-slate-900 font-bold tracking-tight">PeerNXT</p>
              <p className="text-slate-500 text-sm -mt-0.5">Admin login</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in</h2>
          <p className="text-slate-500 mb-6">Sign in with your Supabase admin credentials.</p>

          {(error || authError) && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error ?? authError}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300"
                placeholder="admin@peernxt.com"
                autoComplete="email"
              />
              {touched && !isValidEmail(email) && (
                <p className="text-sm text-red-600 mt-1.5">Enter a valid email.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />
              {touched && password.trim().length === 0 && (
                <p className="text-sm text-red-600 mt-1.5">Password is required.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                canSubmit && !isSubmitting ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Signing in...' : 'Continue'} <ArrowRight size={18} />
            </button>

            <div className="text-sm text-slate-500 text-center">
              Go back to user app landing?{' '}
              <Link to="/" className="text-indigo-600 font-semibold hover:underline">
                Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

