
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { GraduationCap, ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';
import { UserRole } from '../types';
import { parseApiError } from '../lib/api';

const LoginPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, sendPasswordResetEmail, user, authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isResetSending, setIsResetSending] = useState(false);

  const roleKey = role || 'student';
  const roleLabels: Record<string, string> = {
    student: 'Student',
    counselor: 'Counselor',
    ambassador: 'Peer Ambassador'
  };
  const isStudentRole = roleKey === 'student';

  const getUserRole = () => {
    if (roleKey === 'counselor') return UserRole.COUNSELOR;
    if (roleKey === 'ambassador') return UserRole.PEER_AMBASSADOR;
    return UserRole.STUDENT;
  };

  const getDashboardPath = () => {
    if (roleKey === 'counselor') return '/counselor/dashboard';
    if (roleKey === 'ambassador') return '/ambassador/dashboard';
    return '/student';
  };

  React.useEffect(() => {
    // Ensure counselor/ambassador pages always stay in sign-in mode.
    if (!isStudentRole) setIsCreateMode(false);
  }, [isStudentRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const userRole = getUserRole();
      if (isCreateMode && isStudentRole) {
        const { requiresEmailVerification } = await registerWithEmail(email, password, userRole);
        if (requiresEmailVerification) {
          setSuccessMessage('Verification email sent. Please verify your email, then sign in.');
          setIsCreateMode(false);
          return;
        }
      } else {
        await loginWithEmail(email, password, userRole);
      }
      navigate(getDashboardPath());
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      const oauthUrl = await loginWithGoogle(getUserRole());
      window.location.href = oauthUrl;
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      // If browser redirect does not happen (misconfigured OAuth), do not leave button disabled.
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email first, then click Forgot password.');
      return;
    }
    setIsResetSending(true);
    setError('');
    setSuccessMessage('');
    try {
      await sendPasswordResetEmail(email.trim(), getUserRole());
      setSuccessMessage('Password reset link sent to your email.');
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setIsResetSending(false);
    }
  };

  React.useEffect(() => {
    if (!user) return;
    if (user.role === UserRole.STUDENT) {
      navigate(user.onboardingCompleted ? '/student/dashboard' : '/student/onboarding');
      return;
    }
    if (user.role === UserRole.COUNSELOR) navigate('/counselor/dashboard');
    if (user.role === UserRole.PEER_AMBASSADOR) navigate('/ambassador/dashboard');
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 group">
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span className="text-slate-500 text-sm font-medium group-hover:text-indigo-600 transition-colors">Back to Home</span>
          </Link>
        </div>
        <div className="bg-white p-2 rounded-2xl w-14 h-14 mx-auto shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600 mb-6">
          <GraduationCap size={32} />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          {roleLabels[roleKey]} Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Welcome back to PeerNXT
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          {(error || authError) && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error || authError}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
              {successMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {!isCreateMode && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isSubmitting || isResetSending}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-60"
                  >
                    {isResetSending ? 'Sending reset link...' : 'Forgot password?'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : isCreateMode ? `Create ${roleLabels[roleKey]} Account` : `Sign in as ${roleLabels[roleKey]}`}
              </button>
            </div>

            {!isCreateMode && isStudentRole && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">or</span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.6-2.5C16.8 3.1 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.7-4.1 9.7-9.8 0-.7-.1-1.2-.2-1.7H12z" />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </>
            )}
          </form>

          {!isCreateMode && !isStudentRole && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Google sign-in is disabled for {roleLabels[roleKey]}. Use your PeerNXT-provided email and password.
            </p>
          )}

          {isStudentRole && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">New to PeerNXT?</span></div>
              </div>
              <div className="mt-6 text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateMode((prev) => !prev);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4"
                >
                  {isCreateMode ? 'Already verified? Sign in' : 'Create a free account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
