import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Check, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      addToast('Password updated successfully! Welcome back.', 'success');
      navigate('/profile');
      window.location.reload();
    } catch (err) {
      addToast(err.message || 'Failed to reset password. The link may have expired.', 'error');
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
              <Lock className="w-6 h-6 text-landing-electric-teal" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-subpage-primary">Set New Password</h1>
          <p className="text-xs text-subpage-on-surface-variant mt-1">
            Choose a strong password for your IconsUniverse account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-subpage-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full bg-subpage-surface-container-low pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-subpage-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
                className="w-full bg-subpage-surface-container-low pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
