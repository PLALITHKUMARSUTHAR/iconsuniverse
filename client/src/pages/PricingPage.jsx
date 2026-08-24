import React, { useState } from 'react';
import { Check, Crown, Sparkles, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [isLoading, setIsLoading] = useState(false);

  const { user, isPro } = useAuth();
  const { addToast } = useToast();

  const handleSubscribe = async (plan) => {
    if (!user) {
      addToast('Please log in or sign up before subscribing.', 'info');
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/subscriptions/create-order', { plan });
      const order = res.data;

      // Initialize Razorpay Checkout
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'IconsUniverse Pro',
        description: `IconsUniverse ${plan === 'pro_annual' ? 'Annual' : 'Monthly'} Subscription`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await api.post('/subscriptions/verify', {
              ...response,
              plan,
            });
            addToast('Pro subscription activated successfully! Enjoy unlimited downloads.', 'success');
            setTimeout(() => {
              window.location.href = '/profile';
            }, 1500);
          } catch (err) {
            addToast('Payment verification failed: ' + err.message, 'error');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#001e52',
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct simulation for local / dev without Razorpay script
        await api.post('/subscriptions/verify', {
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `pay_simulated_${Date.now()}`,
          razorpay_signature: 'simulated_sig',
          plan,
        });
        addToast('Pro subscription activated successfully (Simulated Checkout)!', 'success');
        setTimeout(() => {
          window.location.href = '/profile';
        }, 1500);
      }
    } catch (err) {
      addToast('Order Error: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-subpage-primary text-white text-xs font-bold uppercase tracking-wider mb-3">
          <Crown className="w-3.5 h-3.5 text-landing-electric-teal" />
          <span>Transparent Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-subpage-on-surface tracking-tight mb-4">
          Supercharge Your Workflow with IconsUniverse Pro
        </h1>
        <p className="text-sm sm:text-base text-subpage-on-surface-variant font-normal">
          Attribution-free downloads, full pack ZIP archives, and custom WebFonts for teams and designers.
        </p>

        {/* Monthly vs Annual Cadence Toggle */}
        <div className="inline-flex p-1.5 rounded-full bg-subpage-surface-container-low border border-subpage-outline-variant/30 mt-6">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-subpage-primary text-white shadow-sm'
                : 'text-subpage-on-surface-variant hover:text-subpage-primary'
            }`}
          >
            Monthly Billing
          </button>

          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-subpage-primary text-white shadow-sm'
                : 'text-subpage-on-surface-variant hover:text-subpage-primary'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-energy-gradient text-white text-[10px] font-extrabold">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <div className="p-8 sm:p-10 rounded-4xl glass-subpage bg-white/90 border border-white/80 shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-subpage-on-surface-variant">
                Free Starter
              </span>
              <span className="px-3 py-1 rounded-full bg-subpage-surface-container text-xs font-bold text-subpage-primary">
                Free Tier
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl sm:text-5xl font-extrabold font-heading text-subpage-primary">₹0</span>
              <span className="text-xs text-subpage-on-surface-variant">/ month</span>
            </div>

            <ul className="flex flex-col gap-3.5 text-sm text-subpage-on-surface-variant mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Search 40,000+ vector icons</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>In-browser vector recolor & transform editor</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard SVG & PNG downloads</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>20 downloads / day with link attribution</span>
              </li>
            </ul>
          </div>

          <Button variant="outline" size="lg" className="w-full" disabled={!isPro}>
            {isPro ? 'Switch to Free' : 'Current Active Plan'}
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="relative p-8 sm:p-10 rounded-4xl bg-gradient-to-br from-[#001e52] to-[#00327d] text-white shadow-2xl border border-white/20 flex flex-col justify-between">
          <div className="absolute -top-4 right-8 px-4 py-1.5 rounded-full bg-energy-gradient text-white text-xs font-extrabold shadow-coral">
            MOST POPULAR
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-landing-electric-teal flex items-center gap-1.5">
                <Crown className="w-4 h-4" />
                <span>Pro Unlimited</span>
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl sm:text-5xl font-extrabold font-heading text-white">
                {billingCycle === 'annual' ? '₹990' : '₹99'}
              </span>
              <span className="text-xs text-landing-primary-container">
                {billingCycle === 'annual' ? '/ year' : '/ month'}
              </span>
            </div>

            <ul className="flex flex-col gap-3.5 text-sm text-landing-primary-fixed-dim mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                <span className="text-white font-semibold">Unlimited downloads with zero daily quotas</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                <span className="text-white font-semibold">Commercial license (No attribution required)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                <span className="text-white font-semibold">Bulk icon pack ZIP & collection exports</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                <span className="text-white font-semibold">Custom WebFont compiler & SVG sprite generator</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                <span className="text-white font-semibold">High-resolution EPS print vectors</span>
              </li>
            </ul>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => handleSubscribe(billingCycle === 'annual' ? 'pro_annual' : 'pro_monthly')}
            isLoading={isLoading}
            className="w-full"
          >
            {isPro ? 'Active Pro Subscription' : 'Upgrade to Pro Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
