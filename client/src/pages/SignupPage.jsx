import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, UserPlus, Sparkles } from 'lucide-react';
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

  const benefits = [
    { title: '100 Free Downloads Daily', desc: 'Download icons in SVG, PNG, EPS & Base64 format every 24 hours.' },
    { title: 'In-Browser Recolor Studio', desc: 'Recolor icons on the fly and match your exact brand palette.' },
    { title: 'Custom Collections', desc: 'Curate, save, and organize icons into projects and client buckets.' },
    { title: 'Production-Ready Vectors', desc: 'Optimized SVG curves and clean code for modern web & mobile apps.' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-14 px-4">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-slate-200/80 rounded-2xl mb-6 max-w-xs mx-auto">
        <Link
          to="/login"
          className="flex-1 py-2 text-center text-xs font-medium rounded-xl text-slate-600 hover:text-slate-900 transition-all"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-white text-slate-900 shadow-sm transition-all"
        >
          Create Account
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-white border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Left Side: Benefits Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#001e52] via-[#002a6f] to-[#041639] p-8 sm:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Forever Plan</span>
            </div>

            <h2 className="text-2xl font-black font-heading leading-tight mb-3">
              Supercharge your design workflow.
            </h2>
            <p className="text-xs text-blue-200/80 mb-8 leading-relaxed">
              Join thousands of creators using IconsUniverse to discover, recolor, and integrate production vectors.
            </p>

            <div className="space-y-4">
              {benefits.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{item.title}</h3>
                    <p className="text-[11px] text-blue-200/70 leading-normal mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 mt-8">
            <p className="text-[11px] text-blue-200/60 text-center">
              No credit card required. Free 100 daily quota forever.
            </p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center gap-6">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 mb-3 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <div className="w-full h-full bg-[#001e52] rounded-[14px] flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-emerald-300" />
              </div>
            </div>
            <h1 className="text-2xl font-black font-heading text-slate-900">Create Free Account</h1>
            <p className="text-xs text-slate-500 mt-1">
              Start downloading and personalizing icons in seconds.
            </p>
          </div>

          {/* Google Signup */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
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
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              or with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aria VectorCraft"
                  required
                  className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aria@example.com"
                  required
                  className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-1.5">
              Create Free Account
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
