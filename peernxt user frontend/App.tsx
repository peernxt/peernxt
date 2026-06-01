
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User, UserRole } from './types';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { bootstrapProfileForSession, parseApiError, setTokenOverride } from './lib/api';
import { parseStoredRole, persistSelectedRole } from './lib/selectedRole';

// Components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NewStudentFrontend from './students/pages/NewFrontend';
import StudentOnboarding from './students/pages/Onboarding';
import CounselorDashboard from './counselors/pages/Dashboard';
import PeerAmbassadorDashboard from './ambassadors/pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import MeetingChatPage from './pages/MeetingChatPage';
import CounselorAvailability from './counselors/pages/Availability';
import CounselorMeetings from './counselors/pages/Meetings';
import CounselorSettings from './counselors/pages/Settings';
import AmbassadorAvailability from './ambassadors/pages/Availability';
import AmbassadorSessions from './ambassadors/pages/Sessions';
import AmbassadorEarnings from './ambassadors/pages/Earnings';

// Context
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginWithGoogle: (role: UserRole) => Promise<string>;
  loginWithEmail: (email: string, password: string, role: UserRole) => Promise<void>;
  registerWithEmail: (email: string, password: string, role: UserRole) => Promise<{ requiresEmailVerification: boolean }>;
  sendPasswordResetEmail: (email: string, role: UserRole) => Promise<void>;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const queryClient = new QueryClient();
const AUTH_BYPASS_ENABLED = import.meta.env.VITE_SKIP_AUTH === 'true';
const AUTH_REDIRECT_ORIGIN = import.meta.env.VITE_AUTH_REDIRECT_ORIGIN || window.location.origin;
// Captured at JS parse time — before Supabase cleans ?code= from URL after PKCE exchange.
const HAD_PKCE_CODE = new URLSearchParams(window.location.search).has('code');
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const redirectToDashboardForRole = (role: UserRole) => {
    if (role === UserRole.COUNSELOR) {
      window.location.hash = '/counselor/dashboard';
      return;
    }
    if (role === UserRole.PEER_AMBASSADOR) {
      window.location.hash = '/ambassador/dashboard';
      return;
    }
    window.location.hash = '/student/dashboard';
  };

  const createFallbackUserFromAuth = (
    authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
    role: UserRole
  ): User => ({
    id: authUser.id,
    email: authUser.email ?? '',
    name: String(authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'PeerNXT User'),
    role,
    onboardingCompleted: role !== UserRole.STUDENT ? true : false,
    googleCalendarConnected: false,
  });

  useEffect(() => {
    if (AUTH_BYPASS_ENABLED) {
      const role = parseStoredRole(localStorage.getItem('selectedRole'));
      setToken('dev-bypass-token');
      setUser({ id: 'dev-user', email: 'dev@local.test', name: 'Dev User', role, onboardingCompleted: true, googleCalendarConnected: false });
      setAuthError(null);
      setIsLoading(false);
      return;
    }

    const handleSession = async (session: { access_token: string; user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null, fromPKCE = false) => {
      if (!session) {
        // If PKCE code was in URL, keep spinner up — SIGNED_IN will fire when exchange completes.
        if (HAD_PKCE_CODE && !fromPKCE) return;
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }
      if (userRef.current?.id === session.user.id) {
        setIsLoading(false);
        return;
      }
      setToken(session.access_token);
      setTokenOverride(session.access_token);
      const savedRole = parseStoredRole(localStorage.getItem('selectedRole'));
      try {
        const profile = await bootstrapProfileForSession(savedRole, session.user);
        setUser(profile);
        setAuthError(null);
        const hash = window.location.hash || '';
        if (!hash || hash === '#/' || hash.startsWith('#/login/')) {
          redirectToDashboardForRole(profile.role);
        }
      } catch (profileError) {
        if (session.user) {
          const fallbackUser = createFallbackUserFromAuth(session.user, savedRole);
          setUser(fallbackUser);
          setAuthError(parseApiError(profileError));
          const hash = window.location.hash || '';
          if (!hash || hash === '#/' || hash.startsWith('#/login/')) {
            if (fallbackUser.role === UserRole.STUDENT) window.location.hash = '/student/onboarding';
            else redirectToDashboardForRole(fallbackUser.role);
          }
        } else {
          setToken(null);
          setUser(null);
          setAuthError(parseApiError(profileError));
        }
      } finally {
        setTokenOverride(null);
        setIsLoading(false);
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        if (session) setToken(session.access_token);
        return;
      }
      if (event === 'SIGNED_OUT') {
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }
      // INITIAL_SESSION: fires on load with cached session or null.
      // SIGNED_IN: fires after PKCE code exchange completes, or email/password login.
      await handleSession(session, event === 'SIGNED_IN');
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setAuthError(null);
  };

  const loginWithGoogle = async (role: UserRole): Promise<string> => {
    if (role !== UserRole.STUDENT) {
      throw new Error('Google sign-in is only available for students.');
    }
    if (!isSupabaseConfigured) {
      throw new Error('Google login is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
    }
    persistSelectedRole(role);
    const redirectTo = `${AUTH_REDIRECT_ORIGIN}/`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('Could not start Google sign-in. Check Supabase Google provider settings.');
    return data.url;
  };

  const loginWithEmail = async (email: string, password: string, role: UserRole) => {
    if (!isSupabaseConfigured) {
      throw new Error('Email login is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
    }
    persistSelectedRole(role);
    const signIn = await supabase.auth.signInWithPassword({ email, password });
    if (signIn.error) {
      throw signIn.error;
    }
    if (!signIn.data.session) {
      throw new Error('No active session');
    }
    const profile = await bootstrapProfileForSession(role);
    setToken(signIn.data.session.access_token);
    setUser(profile);
    setAuthError(null);
  };

  const registerWithEmail = async (email: string, password: string, role: UserRole) => {
    if (!isSupabaseConfigured) {
      throw new Error('Email signup is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
    }
    persistSelectedRole(role);
    const signUp = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${AUTH_REDIRECT_ORIGIN}/#/login/${role === UserRole.COUNSELOR ? 'counselor' : role === UserRole.PEER_AMBASSADOR ? 'ambassador' : 'student'}`,
      },
    });
    if (signUp.error) {
      throw signUp.error;
    }
    const session = signUp.data.session;
    if (!session) {
      return { requiresEmailVerification: true };
    }
    const profile = await bootstrapProfileForSession(role);
    setToken(session.access_token);
    setUser(profile);
    setAuthError(null);
    return { requiresEmailVerification: false };
  };

  const sendPasswordResetEmail = async (email: string, role: UserRole) => {
    if (!isSupabaseConfigured) {
      throw new Error('Password reset is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
    }
    const roleSegment = role === UserRole.COUNSELOR ? 'counselor' : role === UserRole.PEER_AMBASSADOR ? 'ambassador' : 'student';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${AUTH_REDIRECT_ORIGIN}/#/reset-password?role=${roleSegment}`,
    });
    if (error) {
      throw error;
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => undefined);
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loginWithGoogle, loginWithEmail, registerWithEmail, sendPasswordResetEmail, isLoading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { user, token, isLoading } = useAuth();

  if (AUTH_BYPASS_ENABLED) {
    return <>{children}</>;
  }
  
  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Verifying session...</p>
      </div>
    </div>
  );

  if (!token || !user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const RootRoute: React.FC = () => {
  const { user, token, isLoading } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hashParams = new URLSearchParams(rawHash.startsWith('/') ? '' : rawHash);
  const hasOAuthCallbackParams =
    searchParams.has('code') ||
    searchParams.has('access_token') ||
    searchParams.has('error') ||
    searchParams.has('error_description') ||
    hashParams.has('code') ||
    hashParams.has('access_token') ||
    hashParams.has('error') ||
    hashParams.has('error_description');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (token && user) {
    if (user.role === UserRole.COUNSELOR) return <Navigate to="/counselor/dashboard" replace />;
    if (user.role === UserRole.PEER_AMBASSADOR) return <Navigate to="/ambassador/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  if (hasOAuthCallbackParams) {
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Finalizing sign-in...</p>
          </div>
        </div>
      );
    }
    const fallbackRole = localStorage.getItem('selectedRole');
    if (fallbackRole === 'student' || fallbackRole === 'counselor' || fallbackRole === 'ambassador') {
      return <Navigate to={`/login/${fallbackRole}`} replace />;
    }
    return <Navigate to="/login/student" replace />;
  }

  const nextRole = searchParams.get('nextRole');
  if (nextRole === 'student' || nextRole === 'counselor' || nextRole === 'ambassador') {
    localStorage.setItem('selectedRole', nextRole);
    return <Navigate to={`/login/${nextRole}`} replace />;
  }

  return <LandingPage />;
};

const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();

  if (AUTH_BYPASS_ENABLED) return <>{children}</>;
  if (isLoading) return null;
  if (!token || !user) return <Navigate to="/" replace />;
  if (user.role !== UserRole.STUDENT) return <Navigate to="/" replace />;
  if (!user.onboardingCompleted) return <Navigate to="/student/onboarding" replace />;
  return <>{children}</>;
};

const StudentOnboardingRoute: React.FC = () => {
  const { user, token, isLoading } = useAuth();
  if (AUTH_BYPASS_ENABLED) return <StudentOnboarding />;
  if (isLoading) return null;
  if (!token || !user) return <Navigate to="/" replace />;
  if (user.role !== UserRole.STUDENT) return <Navigate to="/" replace />;
  if (user.onboardingCompleted) return <Navigate to="/student/dashboard" replace />;
  return <StudentOnboarding />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/login/:role" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Student Routes */}
            <Route path="/student/onboarding" element={<StudentOnboardingRoute />} />
            <Route path="/student/meetings/:meetingId/chat" element={<StudentRoute><MeetingChatPage /></StudentRoute>} />
            <Route path="/student/*" element={<StudentRoute><NewStudentFrontend /></StudentRoute>} />

            {/* Counselor Routes */}
            <Route path="/counselor/dashboard" element={<ProtectedRoute roles={[UserRole.COUNSELOR]}><CounselorDashboard /></ProtectedRoute>} />
            <Route path="/counselor/availability" element={<ProtectedRoute roles={[UserRole.COUNSELOR]}><CounselorAvailability /></ProtectedRoute>} />
            <Route path="/counselor/meetings" element={<ProtectedRoute roles={[UserRole.COUNSELOR]}><CounselorMeetings /></ProtectedRoute>} />
            <Route path="/counselor/meetings/:meetingId/chat" element={<ProtectedRoute roles={[UserRole.COUNSELOR]}><MeetingChatPage /></ProtectedRoute>} />
            <Route path="/counselor/settings" element={<ProtectedRoute roles={[UserRole.COUNSELOR]}><CounselorSettings /></ProtectedRoute>} />

            {/* Ambassador Routes */}
            <Route path="/ambassador/dashboard" element={<ProtectedRoute roles={[UserRole.PEER_AMBASSADOR]}><PeerAmbassadorDashboard /></ProtectedRoute>} />
            <Route path="/ambassador/availability" element={<ProtectedRoute roles={[UserRole.PEER_AMBASSADOR]}><AmbassadorAvailability /></ProtectedRoute>} />
            <Route path="/ambassador/sessions" element={<ProtectedRoute roles={[UserRole.PEER_AMBASSADOR]}><AmbassadorSessions /></ProtectedRoute>} />
            <Route path="/ambassador/earnings" element={<ProtectedRoute roles={[UserRole.PEER_AMBASSADOR]}><AmbassadorEarnings /></ProtectedRoute>} />

            {/* Shared Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
