import React from 'react';
import { Link } from 'react-router-dom';
import { User, Crown, Download, FolderHeart, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const UserProfilePage = () => {
  const { user, isPro, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-subpage-primary mb-2">Please log in to view your profile</h2>
        <Link to="/login">
          <Button variant="primary" size="md">Log In</Button>
        </Link>
      </div>
    );
  }

  const quotaPercent = Math.min(100, Math.round(((user.downloadCountToday || 0) / 20) * 100));

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-subpage-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-subpage-on-surface tracking-tight">
            User Account & Quota
          </h1>
          <p className="text-xs text-subpage-on-surface-variant mt-1">
            Manage your subscription, download usage, and saved assets.
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-8 rounded-4xl glass-subpage bg-white/95 border border-white/80 shadow-glass grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        <div className="sm:col-span-3 flex justify-center">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-subpage-primary/20 shadow-md"
          />
        </div>

        <div className="sm:col-span-9 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold font-heading text-subpage-primary">{user.name}</h2>
            {isPro ? (
              <span className="px-3 py-1 rounded-full bg-energy-gradient text-white text-xs font-extrabold flex items-center gap-1 shadow-coral">
                <Crown className="w-3.5 h-3.5" />
                <span>PRO SUBSCRIBER</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-subpage-surface-container text-subpage-primary text-xs font-bold uppercase">
                Free Tier
              </span>
            )}
          </div>
          <span className="text-xs text-subpage-on-surface-variant">{user.email}</span>
          <span className="text-xs text-subpage-on-surface-variant">
            Account Role: <strong className="capitalize text-subpage-primary">{user.role}</strong>
          </span>
        </div>
      </div>

      {/* Daily Download Quota Tracker */}
      <div className="p-8 rounded-4xl glass-subpage bg-white/95 border border-white/80 shadow-glass flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-landing-vibrant-coral" />
            <h3 className="text-base font-bold font-heading text-subpage-primary">Daily Download Quota</h3>
          </div>
          <span className="text-xs font-mono font-bold text-subpage-on-surface">
            {isPro ? 'Unlimited' : `${user.downloadCountToday || 0} / 20 used today`}
          </span>
        </div>

        {!isPro ? (
          <div className="flex flex-col gap-3">
            <div className="w-full h-3 bg-subpage-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-energy-gradient transition-all duration-500 rounded-full"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <p className="text-xs text-subpage-on-surface-variant">
              Free accounts receive 20 standard downloads every 24 hours. Reset happens at midnight UTC.
            </p>
            <div className="pt-2">
              <Link to="/pricing">
                <Button variant="primary" size="md">
                  Upgrade to Pro for Unlimited Downloads
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Your Pro subscription gives you unlimited daily downloads without attribution requirements.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
