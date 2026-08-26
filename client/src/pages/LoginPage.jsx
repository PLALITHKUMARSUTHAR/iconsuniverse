import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to IconsUniverse!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@iconsuniverse.com');
    setPassword('password123');
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
          <h1 className="text-2xl font-extrabold font-heading text-subpage-primary">Sign in to IconsUniverse</h1>
          <p className="text-xs text-subpage-on-surface-variant mt-1">
            Access your saved collections, vector assets, and Pro downloads.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                placeholder="name@example.com"
                required
                className="w-full bg-subpage-surface-container-low pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-subpage-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-subpage-surface-container-low pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        {/* Fast Demo Autofill */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="text-xs font-bold text-landing-vibrant-coral hover:underline"
          >
            Fill Demo Admin Credentials (admin@iconsuniverse.com)
          </button>
        </div>

        <div className="pt-4 border-t border-subpage-surface-container text-center text-xs text-subpage-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-bold text-subpage-primary hover:underline">
            Create an account free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
