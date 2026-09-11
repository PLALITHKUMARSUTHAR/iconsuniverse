import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import IconFilters from '../components/icons/IconFilters';
import IconGrid from '../components/icons/IconGrid';
import BulkDownloadModal from '../components/collections/BulkDownloadModal';
import CategoryStyleModal, { prefetchCategoryPreviews } from '../components/landing/CategoryStyleModal';
import AllCategoriesModal from '../components/common/AllCategoriesModal';
import { iconService } from '../services/iconService';
import { Search, Sparkles, Download, X, Layers, Check, ArrowRight, Grid3X3, CircleDot, Palette, Award, Compass, Film } from 'lucide-react';
import Button from '../components/common/Button';
import Footer from '../components/common/Footer';
import { main17FeaturedCategories, all163CategoriesWithIcons } from '../data/categories';
import { CategoryIconMap } from '../data/categoryIcons';
import SEOHead from '../components/common/SEOHead';

const quickStylePills = [
  { id: 'all', label: 'All Styles', icon: Grid3X3 },
  { id: 'outline', label: 'Outline', icon: Layers },
  { id: 'filled', label: 'Filled / Bold', icon: CircleDot },
  { id: 'color', label: 'Color / Flat', icon: Palette },
];

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const styleParam = searchParams.get('style') || 'all';
  const animatedParam = searchParams.get('animated') === 'true';

  const [icons, setIcons] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedShape, setSelectedShape] = useState(styleParam !== 'all' ? styleParam : 'all');
  const [availableCategoryStyles, setAvailableCategoryStyles] = useState(null);
  const [selectedColorType, setSelectedColorType] = useState('all'); // 'all' | 'black' | 'gradient' | 'colors'
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('all');
  const [selectedSort, setSelectedSort] = useState('trending');
  const [groupBy, setGroupBy] = useState('all'); // 'all' | 'style' | 'pack'
  const [isAnimatedOnly, setIsAnimatedOnly] = useState(animatedParam);

  // Multi-Selection State for Bulk Download
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Modals for Category Selection
  const [exploreModalCategory, setExploreModalCategory] = useState(null);
  const [isAllOtherCategoriesModalOpen, setIsAllOtherCategoriesModalOpen] = useState(false);

  // In-memory Query Cache for instant (0ms) style/tab switches
  const queryCacheRef = useRef(new Map());
  const activeRequestIdRef = useRef(0);

  // Infinite Scroll Observer
  const observerRef = useRef(null);

  // Fetch icons batch from API with instant cache read
  const fetchIconsBatch = async (pageNum, isReset = false, customLimit = 60) => {
    const requestId = ++activeRequestIdRef.current;
    
    const params = {
      q: queryParam || undefined,
      category: categoryParam || undefined,
      style: selectedShape !== 'all' ? selectedShape : undefined,
      colorType: selectedColorType !== 'all' ? selectedColorType : undefined,
      isPremium: selectedLicense === 'premium' ? true : selectedLicense === 'free' ? false : undefined,
      color: selectedColor || undefined,
      animated: isAnimatedOnly ? true : undefined,
      sort: selectedSort,
      page: pageNum,
      limit: customLimit,
    };

    const cacheKey = JSON.stringify(params);

    // Instant cache-hit: if reset query is already cached, show it instantly with 0 latency
    if (isReset && queryCacheRef.current.has(cacheKey)) {
      const cached = queryCacheRef.current.get(cacheKey);
      setIcons(cached.icons);
      setTotalCount(cached.total);
      if (cached.availableStyles) setAvailableCategoryStyles(cached.availableStyles);
      setHasMore(cached.hasMore);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await iconService.getIcons(params);
      
      // If user clicked another tab or filter while this request was in flight, discard old response
      if (requestId !== activeRequestIdRef.current) return;

      if (res.data && res.data.icons) {
        if (res.data.availableStyles) {
          setAvailableCategoryStyles(res.data.availableStyles);
        }
        const newBatch = res.data.icons;
        const total = res.data.total || 0;
        const more = pageNum < (res.data.totalPages || 1);
        setTotalCount(total);
        setHasMore(more);

        setIcons((prev) => {
          if (isReset) {
            // Save initial page to cache for instant re-switching
            queryCacheRef.current.set(cacheKey, {
              icons: newBatch,
              total,
              availableStyles: res.data.availableStyles,
              hasMore: more,
            });
            return newBatch;
          }
          const seen = new Set(prev.map((i) => i._id || i.slug));
          const uniqueNew = newBatch.filter((i) => !seen.has(i._id || i.slug));
          const combined = [...prev, ...uniqueNew];
          return combined;
        });
      }
    } catch (err) {
      if (requestId !== activeRequestIdRef.current) return;
      if (isReset) {
        setIcons([]);
        setHasMore(false);
      }
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Sync state when URL params change
  useEffect(() => {
    const currentStyle = searchParams.get('style') || 'all';
    setSelectedShape(currentStyle);
    const isAnim = searchParams.get('animated') === 'true';
    setIsAnimatedOnly(isAnim);
    setAvailableCategoryStyles(null);
  }, [categoryParam]);

  // Initial load or filter change
  useEffect(() => {
    setPage(1);
    fetchIconsBatch(1, true, 60);
  }, [queryParam, categoryParam, selectedShape, selectedColorType, selectedColor, selectedLicense, selectedSort, isAnimatedOnly]);

  // Infinite scroll callback
  const lastElementRef = useCallback(
    (node) => {
      if (loading || groupBy !== 'all' || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchIconsBatch(nextPage, false, 60);
            return nextPage;
          });
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, groupBy]
  );

  const handleToggleSelect = (icon) => {
    const id = icon._id || icon.slug;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAnimated = () => {
    const nextAnimated = !isAnimatedOnly;
    setIsAnimatedOnly(nextAnimated);
    const newParams = {};
    if (queryParam) newParams.q = queryParam;
    if (categoryParam) newParams.category = categoryParam;
    if (selectedShape !== 'all') newParams.style = selectedShape;
    if (nextAnimated) newParams.animated = 'true';
    setSearchParams(newParams);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleQuickStyleChange = (styleId) => {
    setSelectedShape(styleId);
    const newParams = {};
    if (queryParam) newParams.q = queryParam;
    if (categoryParam) newParams.category = categoryParam;
    if (styleId !== 'all') newParams.style = styleId;
    if (isAnimatedOnly) newParams.animated = 'true';
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedShape('all');
    setSelectedColorType('all');
    setSelectedColor('');
    setSelectedLicense('all');
    setSelectedSort('trending');
    setGroupBy('all');
    setIsAnimatedOnly(false);
    setSearchParams(categoryParam ? { category: categoryParam } : queryParam ? { q: queryParam } : {});
  };

  // Selected icon objects for BulkDownloadModal
  const selectedIconObjects = icons.filter((i) => selectedIds.has(i._id || i.slug));



  // Explore other categories: 11 featured categories (excluding current)
  const featured11Categories = main17FeaturedCategories
    .filter((cat) => cat.slug !== categoryParam)
    .slice(0, 11);

  // Calculate distinct styles and packs from current icons
  const distinctStyles = React.useMemo(() => {
    const styles = new Set();
    icons.forEach((i) => {
      const st = i.isFilled ? 'filled' : (i.style || 'outline');
      styles.add(st);
    });
    return Array.from(styles);
  }, [icons]);

  const distinctPacks = React.useMemo(() => {
    const packsMap = new Map();
    icons.forEach((i) => {
      if (i.packId) {
        const id = i.packId._id || i.packId;
        const title = i.packId.title || 'Pack';
        if (id && !packsMap.has(id)) {
          packsMap.set(id, { id, title });
        }
      }
    });
    return Array.from(packsMap.values());
  }, [icons]);

  const hasMultipleStyles = distinctStyles.length > 1;
  const hasMultiplePacks = distinctPacks.length > 1;

  // Auto-revert groupBy if active selection is no longer valid
  useEffect(() => {
    if (groupBy === 'style' && !hasMultipleStyles) {
      setGroupBy('all');
    } else if (groupBy === 'pack' && !hasMultiplePacks) {
      setGroupBy('all');
    }
  }, [groupBy, hasMultipleStyles, hasMultiplePacks]);

  // Grouped Icons Rendering
  const renderGroupedIcons = () => {
    if (groupBy === 'style') {
      const styles = ['outline', 'filled', 'color', 'gradient'];
      return (
        <div className="flex flex-col gap-8">
          {styles.map((st) => {
            const styleIcons = icons.filter((i) => i.style === st || (st === 'filled' && i.isFilled));
            if (styleIcons.length === 0) return null;

            return (
              <div key={st} className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-subpage-outline-variant/30">
                  <h3 className="text-sm font-bold font-heading capitalize text-subpage-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-energy-gradient" />
                    <span>{st} Icons</span>
                    <span className="text-xs text-subpage-on-surface-variant font-normal">({styleIcons.length})</span>
                  </h3>
                </div>
                <IconGrid
                  icons={styleIcons}
                  loading={false}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
            );
          })}
        </div>
      );
    }

    if (groupBy === 'pack') {
      return (
        <div className="flex flex-col gap-8">
          {distinctPacks.map((pack) => {
            const packIcons = icons.filter((i) => (i.packId?._id || i.packId) === pack.id);
            if (packIcons.length === 0) return null;

            return (
              <div key={pack.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-subpage-outline-variant/30">
                  <h3 className="text-sm font-bold font-heading capitalize text-subpage-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-energy-gradient" />
                    <span>{pack.title}</span>
                    <span className="text-xs text-subpage-on-surface-variant font-normal">({packIcons.length})</span>
                  </h3>
                </div>
                <IconGrid
                  icons={packIcons}
                  loading={false}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <IconGrid
        icons={icons}
        loading={loading && icons.length === 0}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />
    );
  };

  const isCategoryMode = Boolean(categoryParam);
  const isCategoryComplete = Boolean(icons.length > 0 && (!hasMore || (totalCount > 0 && icons.length >= totalCount)));

  // Find category object if in category mode
  const currentCategoryObj = isCategoryMode
    ? (main17FeaturedCategories.find((c) => c.slug === categoryParam) ||
       all163CategoriesWithIcons.find((c) => c.slug === categoryParam))
    : null;
  const CategoryHeadingIcon = currentCategoryObj
    ? (CategoryIconMap[currentCategoryObj.iconName] || Award)
    : Award;

  // Explore categories content to embed inside expanded footer
  const exploreCategoriesContent = isCategoryMode ? (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold font-heading text-landing-electric-teal uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-landing-electric-teal" />
          <span>Explore More Categories</span>
        </span>
        <button
          type="button"
          onClick={() => setIsAllOtherCategoriesModalOpen(true)}
          className="text-xs font-bold text-white hover:text-landing-electric-teal flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View all categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2">
        {featured11Categories.map((cat) => {
          const IconComp = CategoryIconMap[cat.iconName] || Layers;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setExploreModalCategory(cat)}
              onMouseEnter={() => prefetchCategoryPreviews(cat.slug, 'filled')}
              onPointerDown={() => prefetchCategoryPreviews(cat.slug, 'filled')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white text-[#001e52] hover:bg-white/95 text-xs font-extrabold shrink-0 transition-all transform hover:scale-105 shadow-md border border-white/80 cursor-pointer"
            >
              <span
                className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
              >
                <IconComp className="w-3.5 h-3.5" />
              </span>
              <span className="truncate max-w-[130px]">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className="h-full flex flex-col min-h-0 gap-1.5 relative">
      {/* Dynamic SEO & OpenGraph */}
      <SEOHead
        title={
          queryParam
            ? `Search: "${queryParam}" Icons`
            : categoryParam
            ? `${categoryParam.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Icons`
            : 'Vector Icons Library'
        }
        description={
          queryParam
            ? `Explore and download high-quality vector icons for "${queryParam}" in SVG, PNG, and EPS.`
            : categoryParam
            ? `Explore curated ${categoryParam.replace(/-/g, ' ')} vector icons. Free downloads with in-browser editor.`
            : 'Browse over 1,000,000 free vector icons across all categories with live recoloring.'
        }
        keywords={[queryParam, categoryParam, 'vector icons', 'svg icons', 'free download'].filter(Boolean)}
      />

      {/* 1. Top Header & Filters (Clean, Sleek & Space-Efficient) */}
      <div className="shrink-0 flex flex-col gap-1.5 z-20 bg-[#f8f9ff]">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1.5 border-b border-subpage-outline-variant/20">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold font-heading text-subpage-on-surface flex items-center gap-1.5">
                {isAnimatedOnly ? (
                  <>
                    <Film className="w-4 h-4 text-landing-vibrant-coral animate-pulse" />
                    <span className="capitalize">
                      Animated {categoryParam ? `${categoryParam.replace(/-/g, ' ')} ` : ''}Icons
                    </span>
                  </>
                ) : queryParam ? (
                  <>
                    <Search className="w-4 h-4 text-landing-vibrant-coral" />
                    <span>Results for &ldquo;{queryParam}&rdquo;</span>
                  </>
                ) : categoryParam ? (
                  <>
                    <CategoryHeadingIcon className="w-4 h-4 text-landing-primary" />
                    <span className="capitalize">{categoryParam.replace(/-/g, ' ')} Icons</span>
                  </>
                ) : (
                  <span>Vector Icons Library</span>
                )}
              </h1>
              {isAnimatedOnly && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-energy-gradient text-white shadow-2xs">
                  Live Animations
                </span>
              )}
              <span className="text-xs text-subpage-on-surface-variant font-medium">
                ({totalCount > 0 ? `${totalCount.toLocaleString()} icons` : '...'})
              </span>
            </div>
            <p className="text-[11px] text-subpage-on-surface-variant mt-0.5 line-clamp-1">
              Select icons to customize and download in SVG, PNG, or EPS.
            </p>
          </div>

          {/* Quick Style Switcher Pills (Hidden when category is opened since style buttons exist inside Filters tab) */}
          {!isCategoryMode && (
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white border border-landing-surface-container shadow-2xs overflow-x-auto">
              {quickStylePills
                .filter((pill) => {
                  if (pill.id === 'all') return true;
                  if (!availableCategoryStyles || availableCategoryStyles.length === 0) return true;
                  return availableCategoryStyles.includes(pill.id);
                })
                .map((pill) => {
                  const IconComp = pill.icon;
                  const isSelected = selectedShape === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => handleQuickStyleChange(pill.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-landing-primary text-white shadow-xs'
                          : 'text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low'
                      }`}
                    >
                      <IconComp className="w-3 h-3" />
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Filter Ribbon */}
        <IconFilters
          selectedShape={selectedShape}
          availableStyles={availableCategoryStyles}
          onChangeShape={(sh) => handleQuickStyleChange(sh)}
          selectedColorType={selectedColorType}
          onChangeColorType={(ct) => setSelectedColorType(ct)}
          selectedColor={selectedColor}
          onChangeColor={(col) => setSelectedColor(col)}
          selectedLicense={selectedLicense}
          onChangeLicense={(lic) => setSelectedLicense(lic)}
          selectedSort={selectedSort}
          onChangeSort={(sort) => setSelectedSort(sort)}
          groupBy={groupBy}
          onChangeGroupBy={(gb) => setGroupBy(gb)}
          hasMultipleStyles={hasMultipleStyles}
          hasMultiplePacks={hasMultiplePacks}
          isAnimatedOnly={isAnimatedOnly}
          onToggleAnimated={handleToggleAnimated}
          onResetFilters={handleResetFilters}
          actionSlot={
            selectedIds.size > 0 ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsBulkModalOpen(true)}
                  icon={Download}
                  className="shadow-sm font-bold text-xs"
                >
                  Open Download ({selectedIds.size} Selected)
                </Button>

                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="p-1.5 rounded-xl hover:bg-rose-50 text-landing-error transition-colors cursor-pointer"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : null
          }
        />
      </div>

      {/* 2. Middle Scrollable Icons Grid Area */}
      <div className="flex-1 overflow-y-auto pr-1 py-1 min-h-0">
        {renderGroupedIcons()}

        {/* Infinite Scroll Sentinel */}
        {groupBy === 'all' && hasMore && (
          <div ref={lastElementRef} className="py-8 flex items-center justify-center">
            {loading && (
              <div className="flex items-center gap-2 text-xs font-bold text-landing-primary animate-fade-in">
                <div className="w-4 h-4 border-2 border-landing-primary border-t-transparent rounded-full animate-spin" />
                <span>Loading more vector icons...</span>
              </div>
            )}
          </div>
        )}

        {/* ALL ICONS LOADED COMPLETION BANNER */}
        {isCategoryComplete && (
          <div className="my-6 p-6 sm:p-8 rounded-3xl bg-white border border-landing-surface-container text-center shadow-xs flex flex-col items-center justify-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold font-heading text-landing-primary">
              All {icons.length.toLocaleString()} Icons Loaded
            </h3>
            <p className="text-xs text-landing-on-surface-variant max-w-md">
              {categoryParam
                ? `You've viewed all available icons in ${categoryParam.replace(/-/g, ' ')}.`
                : 'You have reached the end of the search results.'}
            </p>
          </div>
        )}
      </div>

      {/* 3. Fixed Bottom Collapsible Dock containing Explore Categories & Footer Links */}
      <div className="shrink-0 z-20 border-t border-landing-surface-container/60 bg-[#f8f9ff]">
        <Footer collapsible={true} exploreCategoriesSlot={exploreCategoriesContent} />
      </div>

      {/* Fullscreen Bulk Download & Studio Modal */}
      {isBulkModalOpen && (
        <BulkDownloadModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          icons={selectedIconObjects}
          collectionName="Selected Icons Download"
        />
      )}

      {/* Interactive Category Style Modal */}
      {exploreModalCategory && (
        <CategoryStyleModal
          isOpen={!!exploreModalCategory}
          onClose={() => setExploreModalCategory(null)}
          category={exploreModalCategory}
        />
      )}

      {/* All Remaining Categories Modal (Triggered by "Others") */}
      {isAllOtherCategoriesModalOpen && (
        <AllCategoriesModal
          isOpen={isAllOtherCategoriesModalOpen}
          onClose={() => setIsAllOtherCategoriesModalOpen(false)}
          excludeSlug={categoryParam}
          onSelectCategory={(cat) => setExploreModalCategory(cat)}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
