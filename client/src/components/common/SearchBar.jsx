import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, X, ArrowRight, Flame } from 'lucide-react';
import api from '../../services/api';

const defaultTrendingPool = [
  'arrow', 'cart', 'user', 'heart', 'star', 'cloud', 'settings', 'bell', 'lock', 'search',
  'camera', 'mail', 'phone', 'music', 'folder', 'shield', 'check', 'edit', 'trash', 'calendar',
  'chat', 'home', 'globe', 'download', 'share', 'plus', 'eye', 'wifi', 'play', 'filter',
  'bookmark', 'cpu', 'sparkles', 'rocket', 'dollar', 'shopping-bag', 'link', 'refresh', 'code'
];

function shuffleKeywords(pool, count = 10, topReal = []) {
  const combined = new Set(topReal);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  for (const kw of shuffled) {
    if (!combined.has(kw)) {
      combined.add(kw);
    }
    if (combined.size >= count) break;
  }
  return Array.from(combined);
}

const SearchBar = ({ initialQuery = '', placeholder = 'Search 10,00,000 icons...', isHero = false }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [realTrending, setRealTrending] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState(() => shuffleKeywords(defaultTrendingPool, 10));
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Fetch analyzed real user traffic trending searches from backend
  useEffect(() => {
    let isMounted = true;
    api.get('/icons/trending-searches')
      .then((res) => {
        if (isMounted && res.data && res.data.data && Array.isArray(res.data.data.trending)) {
          const fetched = res.data.data.trending;
          const realTop = fetched.slice(0, res.data.data.realTrendingCount || 0);
          setRealTrending(realTop);
          setTrendingKeywords(shuffleKeywords(defaultTrendingPool, 10, realTop));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleOpenDropdown = () => {
    // Re-randomize pool every time the dropdown is opened so suggestions are always fresh and dynamic
    setTrendingKeywords(shuffleKeywords(defaultTrendingPool, 10, realTrending));
    setIsOpen(true);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const cleanQ = (query || '').trim();
    const styleParam = selectedStyle && selectedStyle !== 'all' ? `&style=${selectedStyle}` : '';
    if (cleanQ) {
      navigate(`/search?q=${encodeURIComponent(cleanQ)}${styleParam}`);
    } else {
      navigate(`/search${styleParam ? `?${styleParam.slice(1)}` : ''}`);
    }
    setIsOpen(false);
  };

  const handleSelectKeyword = (kw) => {
    setQuery(kw);
    const styleParam = selectedStyle && selectedStyle !== 'all' ? `&style=${selectedStyle}` : '';
    navigate(`/search?q=${encodeURIComponent(kw)}${styleParam}`);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative w-full ${isHero ? 'max-w-xl mx-auto' : 'max-w-md'}`}>
      <form
        onSubmit={handleSearch}
        className={`flex items-center w-full transition-all duration-300 rounded-full border ${
          isHero
            ? 'glass-landing bg-white/90 p-2 sm:p-2.5 shadow-xl hover:shadow-coral focus-within:ring-3 focus-within:ring-[#00F5D4]/40 border-white/80'
            : 'bg-landing-surface-container-low focus-within:bg-white p-1 focus-within:ring-2 focus-within:ring-landing-primary-container border-landing-outline-variant/30 shadow-2xs'
        }`}
      >
        <div className="pl-3 sm:pl-3.5 text-landing-on-surface-variant shrink-0">
          <Search className={`${isHero ? 'w-4.5 h-4.5 sm:w-5 sm:h-5 text-landing-primary' : 'w-3.5 h-3.5'}`} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) handleOpenDropdown();
          }}
          onFocus={handleOpenDropdown}
          placeholder={placeholder}
          className={`w-full bg-transparent px-3 text-landing-on-surface placeholder:text-landing-on-surface-variant/60 focus:outline-none ${
            isHero ? 'text-sm sm:text-base font-medium' : 'text-xs'
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1 rounded-full hover:bg-black/5 text-landing-on-surface-variant mr-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          className={`flex items-center justify-center font-bold text-white rounded-full transition-all shrink-0 cursor-pointer ${
            isHero
              ? 'bg-energy-gradient px-5 sm:px-6 py-2 sm:py-2.5 shadow-coral hover:scale-102 active:scale-98 text-xs sm:text-sm gap-1.5'
              : 'bg-landing-primary px-3 py-1 hover:bg-landing-primary-container text-xs'
          }`}
        >
          <span>Search</span>
          {isHero && <ArrowRight className="w-4 h-4 hidden sm:inline-block" />}
        </button>
      </form>

      {/* Auto-suggest dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-3 glass-dropdown rounded-3xl p-5 shadow-2xl z-50 animate-fade-in border border-white/60 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-landing-vibrant-coral" />
              <span>Trending Searches</span>
            </div>
            {realTrending.length > 0 && (
              <span className="text-[10px] text-landing-vibrant-coral font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-landing-vibrant-coral" />
                Live Traffic
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {trendingKeywords.map((kw, idx) => {
              const isRealHot = realTrending.includes(kw);
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleSelectKeyword(kw)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isRealHot
                      ? 'bg-landing-vibrant-coral/10 text-landing-vibrant-coral border border-landing-vibrant-coral/30 hover:bg-landing-vibrant-coral hover:text-white shadow-2xs'
                      : 'bg-landing-surface-container-low hover:bg-landing-primary hover:text-white text-landing-on-surface'
                  }`}
                >
                  {isRealHot ? (
                    <Flame className="w-3 h-3 text-landing-vibrant-coral group-hover:text-white" />
                  ) : (
                    <Search className="w-3 h-3 opacity-60" />
                  )}
                  <span>{kw}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-landing-surface-container flex items-center justify-between text-xs text-landing-on-surface-variant">
            <span>Filter search by style:</span>
            <div className="flex gap-1.5">
              {['all', 'outline', 'filled', 'color', 'gradient'].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                    selectedStyle === style
                      ? 'bg-landing-primary text-white shadow-xs'
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
