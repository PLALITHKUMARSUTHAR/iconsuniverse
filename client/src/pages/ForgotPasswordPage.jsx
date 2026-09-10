import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetData, setResetData] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setResetData(res);
      addToast('Password reset link generated!', 'success');
    } catch (err) {
      addToast(err.message || 'Could not process password reset request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="p-8 sm:p-10 rounded-4xl glass-subpage bg-white/95 border border-white/80 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-energy-gradient p-0.5 mx-auto mb-4 flex items-center justify-center shadow-coral">
            <div className="w-full h-full bg-[#001e52] rounded-[14px] flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-landing-electric-teal" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-subpage-primary">Reset Your Password</h1>
          <p className="text-xs text-subpage-on-surface-variant mt-1">
            Enter the email address associated with your IconsUniverse account.
          </p>
        </div>

        {resetData ? (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold mb-1">Reset Request Received</p>
                <p className="text-emerald-800 leading-relaxed">
                  Your password reset token has been verified. You can now choose a new password.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/reset-password/${resetData.resetToken}`)}
              icon={ArrowRight}
              className="w-full"
            >
              Set New Password Now
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-bold text-subpage-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
                Account Email
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

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
              Generate Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-bold text-subpage-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Remember your password? Sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
