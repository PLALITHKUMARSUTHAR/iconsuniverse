import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, X, ArrowRight } from 'lucide-react';

const popularKeywords = ['cart', 'user', 'arrow', 'cloud', 'ai', 'settings', 'crypto', 'heart', 'phone'];

const SearchBar = ({ initialQuery = '', placeholder = 'Search 10,00,000 icons...', isHero = false }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('all');
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    const styleParam = selectedStyle !== 'all' ? `&style=${selectedStyle}` : '';
    navigate(`/search?q=${encodeURIComponent(query.trim())}${styleParam}`);
    setIsOpen(false);
  };

  const handleSelectKeyword = (kw) => {
    setQuery(kw);
    navigate(`/search?q=${encodeURIComponent(kw)}`);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative w-full ${isHero ? 'max-w-3xl mx-auto' : 'max-w-xl'}`}>
      <form
        onSubmit={handleSearch}
        className={`flex items-center w-full transition-all duration-300 rounded-full border ${
          isHero
            ? 'glass-landing bg-white/90 p-2 sm:p-2.5 shadow-2xl hover:shadow-coral focus-within:ring-4 focus-within:ring-[#00F5D4]/40 border-white/80'
            : 'bg-landing-surface-container-low focus-within:bg-white p-1.5 focus-within:ring-2 focus-within:ring-landing-primary-container border-landing-outline-variant/40 shadow-sm'
        }`}
      >
        <div className="pl-3 sm:pl-4 text-landing-on-surface-variant">
          <Search className={`${isHero ? 'w-6 h-6 text-landing-primary' : 'w-4 h-4'}`} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-transparent px-3 text-landing-on-surface placeholder:text-landing-on-surface-variant/60 focus:outline-none ${
            isHero ? 'text-base sm:text-lg font-medium' : 'text-sm'
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1.5 rounded-full hover:bg-black/5 text-landing-on-surface-variant mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className={`flex items-center justify-center font-bold text-white rounded-full transition-all shrink-0 ${
            isHero
              ? 'bg-energy-gradient px-6 sm:px-8 py-3 sm:py-3.5 shadow-coral hover:scale-105 active:scale-95 text-sm sm:text-base gap-2'
              : 'bg-landing-primary px-4 py-2 hover:bg-landing-primary-container text-xs'
          }`}
        >
          <span>Search</span>
          {isHero && <ArrowRight className="w-4 h-4 hidden sm:inline-block" />}
        </button>
      </form>

      {/* Auto-suggest dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-3 glass-dropdown rounded-3xl p-5 shadow-2xl z-40 animate-fade-in border border-white/60">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant">
            <Sparkles className="w-3.5 h-3.5 text-landing-vibrant-coral" />
            <span>Trending Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleSelectKeyword(kw)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-landing-surface-container-low hover:bg-landing-primary hover:text-white transition-colors text-landing-on-surface flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 opacity-60" />
                {kw}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-landing-surface-container flex items-center justify-between text-xs text-landing-on-surface-variant">
            <span>Filter search by style:</span>
            <div className="flex gap-1.5">
              {['all', 'outline', 'filled', 'color', 'gradient'].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-all ${
                    selectedStyle === style
                      ? 'bg-landing-primary text-white'
                      : 'bg-landing-surface-container hover:bg-landing-surface-dim text-landing-on-surface'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
