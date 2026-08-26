import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import IconFilters from '../components/icons/IconFilters';
import IconGrid from '../components/icons/IconGrid';
import BulkDownloadModal from '../components/collections/BulkDownloadModal';
import CategoryStyleModal from '../components/landing/CategoryStyleModal';
import AllCategoriesModal from '../components/common/AllCategoriesModal';
import { iconService } from '../services/iconService';
import { Search, Sparkles, Download, X, Layers, Check, ArrowRight, Grid3X3, ChevronUp, ChevronDown } from 'lucide-react';
import Button from '../components/common/Button';
import { main17FeaturedCategories } from '../data/categories';
import { CategoryIconMap } from '../data/categoryIcons';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const styleParam = searchParams.get('style') || 'all';

  const [icons, setIcons] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Category progressive pagination stage: 'stage1' (up to 500) | 'stage2' (loading 1000 more) | 'infinite' (after 1500)
  const [stage, setStage] = useState('stage1');
  const [loadingMore1000, setLoadingMore1000] = useState(false);

  // Fixed Bottom Dock footer expansion toggle
  const [isDockFooterExpanded, setIsDockFooterExpanded] = useState(false);

  // Filters State
  const [selectedShape, setSelectedShape] = useState(styleParam !== 'all' ? styleParam : 'all');
  const [selectedColorType, setSelectedColorType] = useState('all'); // 'all' | 'black' | 'gradient' | 'colors'
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('all');
  const [selectedSort, setSelectedSort] = useState('trending');
  const [groupBy, setGroupBy] = useState('all'); // 'all' | 'style' | 'pack'

  // Multi-Selection State for Bulk Download
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Modals for Category Selection
  const [exploreModalCategory, setExploreModalCategory] = useState(null);
  const [isAllOtherCategoriesModalOpen, setIsAllOtherCategoriesModalOpen] = useState(false);

  // Infinite Scroll Observer
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  // Fetch icons batch from API
  const fetchIconsBatch = async (pageNum, isReset = false, customLimit = 60) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const params = {
        q: queryParam || undefined,
        category: categoryParam || undefined,
        style: selectedShape !== 'all' ? selectedShape : undefined,
        colorType: selectedColorType !== 'all' ? selectedColorType : undefined,
        isPremium: selectedLicense === 'premium' ? true : selectedLicense === 'free' ? false : undefined,
        color: selectedColor || undefined,
        sort: selectedSort,
        page: pageNum,
        limit: customLimit,
      };

      const res = await iconService.getIcons(params);
      if (res.data && res.data.icons) {
        const newBatch = res.data.icons;
        const total = res.data.total || 0;
        setTotalCount(total);

        setIcons((prev) => {
          if (isReset) return newBatch;
          const seen = new Set(prev.map((i) => i._id || i.slug));
          const uniqueNew = newBatch.filter((i) => !seen.has(i._id || i.slug));
          return [...prev, ...uniqueNew];
        });

        setHasMore(pageNum < (res.data.totalPages || 1));
      }
    } catch (err) {
      if (isReset) {
        setIcons([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Initial load or filter change
  useEffect(() => {
    setPage(1);
    setStage('stage1');
    setIsDockFooterExpanded(false);
    fetchIconsBatch(1, true, 60);
  }, [queryParam, categoryParam, selectedShape, selectedColorType, selectedColor, selectedLicense, selectedSort]);

  // Handle "Load 1,000 More Icons" button click
  const handleLoadNext1000 = async () => {
    setLoadingMore1000(true);
    setStage('stage2');

    const targetCount = 1500;
    let currentPage = page;

    try {
      while (icons.length < targetCount && hasMore) {
        currentPage += 1;
        setPage(currentPage);
        await fetchIconsBatch(currentPage, false, 100);
        if (!hasMore) break;
      }
    } finally {
      setLoadingMore1000(false);
      setStage('infinite');
    }
  };

  // Determine if infinite scroll is currently active
  const isInfiniteScrollActive = !categoryParam || stage === 'infinite' || (stage === 'stage1' && icons.length < 500 && hasMore);

  // Infinite scroll callback
  const lastElementRef = useCallback(
    (node) => {
      if (loading || groupBy !== 'all' || !isInfiniteScrollActive) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          // If we are in stage1 and reached 500 icons, pause infinite scroll until button is clicked
          if (categoryParam && stage === 'stage1' && icons.length >= 500) {
            return;
          }

          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchIconsBatch(nextPage, false, 60);
            return nextPage;
          });
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, groupBy, isInfiniteScrollActive, stage, icons.length, categoryParam]
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

  const handleSelectAllVisible = () => {
    if (selectedIds.size === icons.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(icons.map((i) => i._id || i.slug));
      setSelectedIds(allIds);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleResetFilters = () => {
    setSelectedShape('all');
    setSelectedColorType('all');
    setSelectedColor('');
    setSelectedLicense('all');
    setSelectedSort('trending');
    setGroupBy('all');
    setSearchParams(categoryParam ? { category: categoryParam } : queryParam ? { q: queryParam } : {});
  };

  // Selected icon objects for BulkDownloadModal
  const selectedIconObjects = icons.filter((i) => selectedIds.has(i._id || i.slug));

  // Explore other categories: 11 featured categories (excluding current)
  const featured11Categories = main17FeaturedCategories
    .filter((cat) => cat.slug !== categoryParam)
    .slice(0, 11);

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
  const isCategoryComplete = Boolean(isCategoryMode && icons.length > 0 && (!hasMore || (totalCount > 0 && icons.length >= totalCount)));
  const showLoad1000Button = Boolean(isCategoryMode && stage === 'stage1' && icons.length >= 500 && hasMore);
  const isFixedBottomActive = Boolean(isCategoryMode && (stage === 'stage2' || stage === 'infinite') && !isCategoryComplete);

  return (
    <div className={`flex flex-col gap-4 ${isFixedBottomActive ? (isDockFooterExpanded ? 'pb-[420px]' : 'pb-36') : ''}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-subpage-outline-variant/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-subpage-on-surface flex items-center gap-2">
            {queryParam ? (
              <>
                <Search className="w-5 h-5 text-landing-vibrant-coral" />
                <span>Results for &ldquo;{queryParam}&rdquo;</span>
              </>
            ) : categoryParam ? (
              <>
                <Sparkles className="w-5 h-5 text-landing-primary" />
                <span className="capitalize">{categoryParam.replace(/-/g, ' ')} Icons</span>
              </>
            ) : (
              <span>Vector Icons Library</span>
            )}
          </h1>
          <p className="text-xs text-subpage-on-surface-variant mt-0.5">
            Click to select icons, then click Open Download to customize and download.
          </p>
        </div>
      </div>

      {/* Filter Ribbon */}
      <IconFilters
        selectedShape={selectedShape}
        onChangeShape={(sh) => setSelectedShape(sh)}
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
                className="p-1.5 rounded-xl hover:bg-rose-50 text-landing-error transition-colors"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low transition-colors hidden sm:inline-block cursor-pointer"
            >
              Select All Visible
            </button>
          )
        }
      />

      {/* Grouped or Continuous Grid */}
      {renderGroupedIcons()}

      {/* STAGE 1 ACTION: Button to Load 1,000 More Icons (Shown after 500 icons, NO inline categories layout) */}
      {showLoad1000Button && (
        <div className="my-8 p-6 sm:p-8 rounded-3xl bg-white border border-landing-surface-container shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left animate-fade-in">
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-landing-primary">
              Showing 500 {categoryParam.replace(/-/g, ' ')} Icons
            </h3>
            <p className="text-xs text-landing-on-surface-variant mt-0.5">
              Click below to load the next 1,000 icons and keep browsing with the sticky explore bar & footer.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleLoadNext1000}
            isLoading={loadingMore1000}
            className="px-6 py-3 font-bold text-xs shadow-coral shrink-0 cursor-pointer"
          >
            Load 1,000 More Icons →
          </Button>
        </div>
      )}

      {/* Infinite Scroll Sentinel (Active during continuous streaming) */}
      {groupBy === 'all' && isInfiniteScrollActive && !isCategoryComplete && (
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
        <div className="my-10 p-8 rounded-4xl bg-white border border-landing-surface-container text-center shadow-xs flex flex-col items-center justify-center gap-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold font-heading text-landing-primary">
            All {totalCount.toLocaleString()} Icons Loaded
          </h3>
          <p className="text-xs text-landing-on-surface-variant max-w-md">
            No more icons in <strong className="capitalize">{categoryParam.replace(/-/g, ' ')}</strong>.
          </p>
        </div>
      )}

      {/* FIXED BOTTOM DOCK: Appears when Load 1,000 More Icons is clicked and remains fixed while scrolling */}
      {isFixedBottomActive && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#001e52] text-white border-t border-white/20 shadow-2xl backdrop-blur-xl animate-fade-in">
          {/* Top Row: Explore Other Categories Horizontal Strip */}
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-2 flex items-center justify-between gap-3 overflow-hidden border-b border-white/15">
            <span className="text-[11px] font-bold uppercase tracking-wider text-landing-electric-teal shrink-0 hidden sm:inline-block">
              Explore:
            </span>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featured11Categories.map((cat) => {
                const IconComp = CategoryIconMap[cat.iconName] || Layers;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setExploreModalCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                  >
                    <IconComp className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    <span className="truncate max-w-[110px]">{cat.name}</span>
                  </button>
                );
              })}

              {/* 12th Box: "Others" -> Opens All 163 Remaining Categories Modal */}
              <button
                type="button"
                onClick={() => setIsAllOtherCategoriesModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-energy-gradient text-white text-xs font-extrabold shrink-0 shadow-sm hover:brightness-110 active:opacity-90 transition-all cursor-pointer"
              >
                <Grid3X3 className="w-3.5 h-3.5 text-white" />
                <span>Others</span>
              </button>
            </div>
          </div>

          {/* Full Footer Expander Section (Zero black color, pure white and electric teal) */}
          {isDockFooterExpanded ? (
            <div className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-8 pb-6 animate-fade-in text-white max-h-[320px] overflow-y-auto">
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={() => setIsDockFooterExpanded(false)}
                  className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
                  title="Collapse Footer"
                >
                  <span>Collapse Footer</span>
                  <ChevronDown className="w-4 h-4 text-landing-electric-teal" />
                </button>
              </div>

              {/* 4 Columns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-white/15">
                {/* Brand */}
                <div className="flex flex-col gap-2">
                  <span className="font-heading font-extrabold text-lg text-white tracking-tight">
                    Icons<span className="text-landing-vibrant-coral">Universe</span>
                  </span>
                  <p className="text-xs text-white leading-relaxed">
                    Clean vector icons with in-browser recoloring and Google Drive synchronization.
                  </p>
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-2">
                    Content
                  </h4>
                  <ul className="flex flex-col gap-1.5 text-xs text-white/80">
                    <li><Link to="/search" className="text-white/85 hover:text-white">Categories</Link></li>
                  </ul>
                </div>

                {/* Tools */}
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-2">
                    Tools
                  </h4>
                  <ul className="flex flex-col gap-1.5 text-xs text-white/80">
                    <li><Link to="/docs" className="text-white/85 hover:text-white">API</Link></li>
                  </ul>
                </div>

                {/* Help */}
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-2">
                    Help
                  </h4>
                  <ul className="flex flex-col gap-1.5 text-xs text-white/80">
                    <li><Link to="/about" className="text-white/85 hover:text-white">About Us</Link></li>
                    <li><Link to="/contact" className="text-white/85 hover:text-white">Contact Us</Link></li>
                    <li><Link to="/whats-new" className="text-white/85 hover:text-white">What's New</Link></li>
                    <li><Link to="/terms" className="text-white/85 hover:text-white">Terms and Conditions</Link></li>
                    <li><Link to="/privacy" className="text-white/85 hover:text-white">Privacy Policy</Link></li>
                  </ul>
                </div>
              </div>

              {/* Bottom Copyright & Sitemap */}
              <div className="pt-4 flex items-center justify-between text-[11px] text-white/80">
                <p className="text-white/90">© 2026 IconsUniverse. All rights reserved.</p>
                <Link to="/sitemap" className="text-white hover:text-landing-electric-teal font-semibold">
                  Sitemap
                </Link>
              </div>
            </div>
          ) : (
            /* Compact Collapsed Footer Bar */
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-2 flex items-center justify-between text-[11px] text-white/80">
              <p className="text-white/90 font-medium">© 2026 IconsUniverse. All rights reserved.</p>

              <button
                type="button"
                onClick={() => setIsDockFooterExpanded(true)}
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors cursor-pointer"
                title="Expand Full Footer"
              >
                <span>Full Footer & Links</span>
                <ChevronUp className="w-3.5 h-3.5 text-landing-electric-teal" />
              </button>

              <Link to="/sitemap" className="text-white hover:text-landing-electric-teal font-semibold transition-colors">
                Sitemap
              </Link>
            </div>
          )}
        </div>
      )}

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
