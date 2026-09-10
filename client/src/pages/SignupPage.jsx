import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Crown } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup, googleLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(name, email, password);
      addToast('Account created successfully! Welcome to IconsUniverse.', 'success');
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const googleUser = {
        email: 'creator.google@example.com',
        name: 'Google Creator',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        googleId: `google_oauth_${Date.now()}`,
      };
      await googleLogin(googleUser);
      addToast('Signed up with Google successfully! Welcome.', 'success');
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      addToast(err.message || 'Google sign-up failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="p-8 sm:p-10 rounded-4xl glass-subpage bg-white/95 border border-white/80 shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-energy-gradient p-0.5 mx-auto mb-4 flex items-center justify-center shadow-coral">
            <div className="w-full h-full bg-[#001e52] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-landing-electric-teal" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-subpage-primary">Create Your Free Account</h1>
          <p className="text-xs text-subpage-on-surface-variant mt-1">
            Download 20 icons/day free, recolor live in your browser, and build collections.
          </p>
        </div>

        {/* Google OAuth Quick Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl bg-white hover:bg-subpage-surface-container-low border border-subpage-outline-variant/40 shadow-sm text-xs font-bold text-subpage-on-surface transition-all cursor-pointer"
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
          <div className="w-full border-t border-subpage-outline-variant/30" />
          <span className="bg-white px-3 text-[11px] font-bold text-subpage-on-surface-variant uppercase tracking-wider absolute">
            or email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-subpage-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aria VectorCraft"
                required
                className="w-full bg-subpage-surface-container-low pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-subpage-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aria@example.com"
                required
                className="w-full bg-subpage-surface-container-low pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-subpage-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-subpage-surface-container-low pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
            Create Free Account
          </Button>
        </form>

        <div className="pt-4 border-t border-subpage-surface-container text-center text-xs text-subpage-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-subpage-primary hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
