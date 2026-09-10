import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to IconsUniverse!', 'success');
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const googleUser = {
        email: 'designer.google@example.com',
        name: 'Google Creative',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        googleId: `google_oauth_${Date.now()}`,
      };
      await googleLogin(googleUser);
      addToast('Signed in with Google successfully!', 'success');
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      addToast(err.message || 'Google authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-4 sm:py-6 px-4">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-slate-200/80 rounded-2xl mb-3 max-w-xs mx-auto">
        <Link
          to="/login"
          className="flex-1 py-1.5 text-center text-xs font-bold rounded-xl bg-white text-slate-900 shadow-sm transition-all"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="flex-1 py-1.5 text-center text-xs font-medium rounded-xl text-slate-600 hover:text-slate-900 transition-all"
        >
          Create Account
        </Link>
      </div>

      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xl flex flex-col gap-4">
        <div className="text-center">
          <Link to="/" className="inline-block mx-auto mb-1.5">
            <img
              src="/logo.png"
              alt="IconsUniverse"
              className="w-11 h-11 object-contain rounded-xl shadow-xs mx-auto hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-xl font-black font-heading text-slate-900">Welcome Back</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Sign in to access your icons, collections, and editor.
          </p>
        </div>

        {location.state?.from && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Please log in or sign up first to access this page.</span>
          </div>
        )}

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
            or with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full mt-1 py-2 text-xs">
            Sign In
          </Button>
        </form>

        <div className="pt-2.5 border-t border-slate-100 text-center text-[11px] text-slate-500">
          New to IconsUniverse?{' '}
          <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Create an account free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
