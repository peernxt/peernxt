import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User, UserRole } from './types';
import { supabase } from './lib/supabase';
import { apiRequest, toAdminUser, parseApiError } from './lib/api';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCounselorMeetings from './pages/AdminCounselorMeetings';
import AdminAmbassadorSlots from './pages/AdminAmbassadorSlots';
import AdminEvents from './pages/AdminEvents';
import AdminLogin from './pages/AdminLogin';
import AdminCommunity from './pages/AdminCommunity';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const queryClient = new QueryClient();
const AUTH_BYPASS_ENABLED = import.meta.env.VITE_SKIP_AUTH === 'true';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      if (AUTH_BYPASS_ENABLED) {
        setToken('dev-bypass-token');
        setUser({
          id: 'dev-admin',
          name: 'Dev Admin',
          email: 'dev-admin@local.test',
          role: UserRole.ADMIN,
        });
        setAuthError(null);
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setIsLoading(false);
          return;
        }
        setToken(data.session.access_token);
        const me = await apiRequest<any>('/users/me');
        if (String(me.role) !== 'admin') {
          await supabase.auth.signOut();
          setAuthError('This account is not an admin account.');
          setToken(null);
          setUser(null);
        } else {
          setUser(toAdminUser(me));
          setAuthError(null);
        }
      } catch (error) {
        setAuthError(parseApiError(error));
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (AUTH_BYPASS_ENABLED) return;
      if (!session) {
        setToken(null);
        setUser(null);
        return;
      }
      setToken(session.access_token);
      try {
        const me = await apiRequest<any>('/users/me');
        if (String(me.role) !== 'admin') {
          await supabase.auth.signOut();
          setAuthError('This account is not an admin account.');
          setToken(null);
          setUser(null);
          return;
        }
        setUser(toAdminUser(me));
        setAuthError(null);
      } catch (error) {
        setAuthError(parseApiError(error));
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const loginAsAdmin = async (email: string, password: string) => {
    const signIn = await supabase.auth.signInWithPassword({ email, password });
    if (signIn.error) throw signIn.error;
    const me = await apiRequest<any>('/users/me');
    if (String(me.role) !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('This account is not an admin account.');
    }
    setToken(signIn.data.session?.access_token ?? null);
    setUser(toAdminUser(me));
    setAuthError(null);
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => undefined);
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, token, loginAsAdmin, logout, isLoading, authError }),
    [user, token, isLoading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (AUTH_BYPASS_ENABLED) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== UserRole.ADMIN) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const AdminShell: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/counselor-meetings" element={<AdminCounselorMeetings />} />
        <Route path="/ambassador-slots" element={<AdminAmbassadorSlots />} />
        <Route path="/events" element={<AdminEvents />} />
        <Route path="/community" element={<AdminCommunity />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route
              path="/*"
              element={
                <ProtectedAdminRoute>
                  <AdminShell />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

