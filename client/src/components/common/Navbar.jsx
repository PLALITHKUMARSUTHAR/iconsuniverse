import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Palette, FolderHeart, User, Menu, X, Shield, Crown, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCollections } from '../../context/CollectionsContext';
import SearchBar from './SearchBar';

const Navbar = ({ isLanding = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, isPro, isAdmin, logout } = useAuth();
  const { collectionIcons, openDrawer } = useCollections();
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      <nav
        className={`w-full ${
          isLanding
            ? 'glass-landing border-b border-white/60 bg-white/80'
            : 'glass-subpage border-b border-subpage-outline-variant/30 bg-white/90'
        } backdrop-blur-xl shadow-sm`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo from Stitch Logo folder */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src="/logo.png"
                alt="IconsUniverse"
                className="h-8 sm:h-9 w-auto object-contain rounded-xl shadow-sm transform group-hover:scale-105 transition-transform"
              />
              <span className="font-heading font-extrabold text-lg sm:text-xl text-landing-primary tracking-tight">
                Icons<span className="text-landing-vibrant-coral">Universe</span>
              </span>
            </Link>
          </div>

          {/* Search bar in Navbar (hidden on landing hero) */}
          {!isLanding ? (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <SearchBar placeholder="Search vector icons..." />
            </div>
          ) : (
            /* Center Nav Links on Landing Page */
            <div className="hidden md:flex items-center justify-center gap-8">
              <Link
                to="/search"
                className={`text-xs font-bold transition-colors ${
                  isCurrent('/search') ? 'text-landing-vibrant-coral' : 'text-landing-on-surface-variant hover:text-landing-primary'
                }`}
              >
                Browse Icons
              </Link>

              <Link
                to="/search?type=packs"
                className="text-xs font-bold text-landing-on-surface-variant hover:text-landing-primary transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-landing-primary" />
                <span>Icon Packs</span>
              </Link>

              <Link
                to="/pricing"
                className={`text-xs font-bold transition-colors ${
                  isCurrent('/pricing') ? 'text-landing-vibrant-coral' : 'text-landing-on-surface-variant hover:text-landing-primary'
                }`}
              >
                Pricing
              </Link>
            </div>
          )}

          {/* Desktop Navigation Links for Subpages */}
          {!isLanding && (
            <div className="hidden lg:flex items-center gap-6">
              <Link
                to="/search"
                className={`text-xs font-bold transition-colors ${
                  isCurrent('/search') ? 'text-landing-vibrant-coral' : 'text-landing-on-surface-variant hover:text-landing-primary'
                }`}
              >
                Icons
              </Link>

              <Link
                to="/search?type=packs"
                className="text-xs font-bold text-landing-on-surface-variant hover:text-landing-primary transition-colors flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5 text-landing-primary" />
                <span>Icon Packs</span>
              </Link>

              <Link
                to="/pricing"
                className={`text-xs font-bold transition-colors ${
                  isCurrent('/pricing') ? 'text-landing-vibrant-coral' : 'text-landing-on-surface-variant hover:text-landing-primary'
                }`}
              >
                Pricing
              </Link>
            </div>
          )}

          {/* Action Buttons: Collection Drawer & Auth */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* My Collection Drawer Trigger */}
            <button
              type="button"
              onClick={openDrawer}
              className="relative p-2 rounded-full glass-landing bg-white hover:bg-landing-surface-container-low border border-white/80 shadow-sm transition-all group flex items-center gap-1.5"
              title="Open Collection (Bulk Download)"
            >
              <FolderHeart className="w-4 h-4 text-landing-vibrant-coral group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-landing-primary hidden sm:inline-block">Collection</span>
              {collectionIcons.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-energy-gradient text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                  {collectionIcons.length}
                </span>
              )}
            </button>

            {/* User Auth */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-full glass-landing hover:bg-white border border-white/80 shadow-sm transition-all"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-landing-primary/20"
                  />
                  <span className="text-xs font-bold text-landing-on-surface hidden sm:inline-block">{user.name.split(' ')[0]}</span>
                  {isPro && (
                    <span className="px-1.5 py-0.5 rounded-full bg-energy-gradient text-white text-[9px] font-extrabold uppercase">
                      PRO
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-landing-on-surface-variant" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-dropdown rounded-3xl p-3 shadow-xl z-50 animate-fade-in border border-white/80">
                    <div className="px-3 py-2 border-b border-landing-surface-container mb-2">
                      <p className="text-xs font-bold text-landing-on-surface">{user.name}</p>
                      <p className="text-[11px] text-landing-on-surface-variant truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-landing-on-surface hover:bg-landing-surface-container-low transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-landing-primary" />
                      <span>My Account & Quota</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-landing-primary hover:bg-landing-surface-container-low transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-landing-vibrant-coral" />
                        <span>Admin & Drive Sync</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full mt-1 pt-1 border-t border-landing-surface-container flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-landing-error hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-landing-primary hover:bg-landing-surface-container-low transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-full text-xs font-extrabold text-white bg-energy-gradient shadow-sm hover:scale-105 transition-all flex items-center gap-1"
                >
                  <Crown className="w-3 h-3" />
                  <span>Join Free</span>
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-landing-surface-container-low text-landing-on-surface"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-landing-surface-container px-6 py-4 bg-white/95 backdrop-blur-xl animate-fade-in flex flex-col gap-3">
            <SearchBar placeholder="Search vector icons..." />
            <Link
              to="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-xs text-landing-on-surface hover:text-landing-vibrant-coral py-1.5"
            >
              Browse Icons
            </Link>
            <Link
              to="/search?type=packs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-xs text-landing-on-surface hover:text-landing-vibrant-coral py-1.5"
            >
              Icon Packs
            </Link>
            <Link
              to="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-xs text-landing-on-surface hover:text-landing-vibrant-coral py-1.5"
            >
              Pricing
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
