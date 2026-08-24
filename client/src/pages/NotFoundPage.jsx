import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="w-16 h-16 rounded-3xl bg-energy-gradient p-0.5 mb-6 flex items-center justify-center shadow-coral">
        <div className="w-full h-full bg-[#001e52] rounded-[22px] flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-landing-electric-teal animate-spin" />
        </div>
      </div>
      <h1 className="text-6xl sm:text-7xl font-extrabold font-heading text-subpage-primary mb-3">404</h1>
      <h2 className="text-xl sm:text-2xl font-bold text-subpage-on-surface mb-3">
        Lost in the Icon Universe
      </h2>
      <p className="text-sm text-subpage-on-surface-variant max-w-md mb-8">
        The vector coordinates you navigated to do not exist or may have been repositioned.
      </p>

      <Link to="/">
        <Button variant="primary" size="lg" icon={Home}>
          Return to Marketplace Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
