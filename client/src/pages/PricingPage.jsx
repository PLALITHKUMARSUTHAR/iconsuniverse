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
          Attribution-free downloads, full pack ZIP archives, and commercial licensing for teams and designers.
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
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              billingCycle === 'annual'
                ? 'bg-subpage-primary text-white shadow-sm'
                : 'text-subpage-on-surface-variant hover:text-subpage-primary'
            }`}
          >
            Annual Billing (Save 20%)
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Tier Card */}
        <div className="p-8 rounded-4xl bg-white border border-subpage-surface-container shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-heading text-subpage-on-surface">Starter Free</h3>
              <span className="px-3 py-1 rounded-full bg-subpage-surface-container text-subpage-on-surface text-xs font-bold">
                Personal
              </span>
            </div>
            <p className="text-xs text-subpage-on-surface-variant mb-6">
              Ideal for hobbyists, personal prototypes, and learning projects.
            </p>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold font-heading text-subpage-primary">₹0</span>
              <span className="text-xs text-subpage-on-surface-variant">/ forever</span>
            </div>

            <ul className="flex flex-col gap-3.5 text-xs text-subpage-on-surface-variant mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Access to 1,000,000 free vector icons</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Daily download quota (20 icons/day)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>In-browser vector editor & recoloring</span>
              </li>
              <li className="flex items-center gap-3 text-subpage-outline">
                <span className="w-4 text-center font-bold">✕</span>
                <span>Attribution link required in published projects</span>
              </li>
            </ul>
          </div>

          <Link to="/search" className="w-full">
            <Button variant="secondary" size="lg" className="w-full">
              Explore Free Icons
            </Button>
          </Link>
        </div>

        {/* Pro Tier Card (Elevated Gradient Border) */}
        <div className="p-8 rounded-4xl bg-subpage-primary text-white shadow-2xl relative flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-energy-gradient opacity-20 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-landing-electric-teal" />
                <h3 className="text-xl font-bold font-heading text-white">IconsUniverse Pro</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-landing-electric-teal text-xs font-extrabold">
                RECOMMENDED
              </span>
            </div>
            <p className="text-xs text-landing-primary-fixed-dim mb-6">
              Complete commercial freedom for professional designers, agencies, and app developers.
            </p>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold font-heading text-white">
                {billingCycle === 'annual' ? '₹299' : '₹399'}
              </span>
              <span className="text-xs text-landing-primary-fixed-dim">
                {billingCycle === 'annual' ? '/ month (billed annually)' : '/ month'}
              </span>
            </div>

            <ul className="flex flex-col gap-3.5 text-xs text-landing-primary-fixed-dim mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                <span className="text-white font-semibold">Unlimited high-speed downloads (No daily caps)</span>
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
                <span className="text-white font-semibold">Unlimited collection boards & color presets</span>
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
