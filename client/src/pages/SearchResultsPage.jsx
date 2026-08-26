import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import IconFilters from '../components/icons/IconFilters';
import IconGrid from '../components/icons/IconGrid';
import BulkDownloadModal from '../components/collections/BulkDownloadModal';
import CategoryStyleModal from '../components/landing/CategoryStyleModal';
import { iconService } from '../services/iconService';
import { Search, Sparkles, Download, X, Layers, Check, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { main17FeaturedCategories } from '../data/categories';
import { CategoryIconMap } from '../data/categoryIcons';
import { seedIcons, seedPacks } from '../data/seedData';

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

  // Interactive Category Style Modal for Explore Other Categories
  const [exploreModalCategory, setExploreModalCategory] = useState(null);

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
    fetchIconsBatch(1, true, 60);
  }, [queryParam, categoryParam, selectedShape, selectedColorType, selectedColor, selectedLicense, selectedSort]);

  // Handle "Load 1,000 More Icons" button click
  const handleLoadNext1000 = async () => {
    setLoadingMore1000(true);
    setStage('stage2');

    // Calculate how many more icons needed to reach 1,500
    const targetCount = 1500;
    let currentPage = page;

    try {
      while (icons.length < targetCount && hasMore) {
        currentPage += 1;
        setPage(currentPage);
        await fetchIconsBatch(currentPage, false, 100);
        // Safety break if exhausted
        if (!hasMore) break;
      }
    } finally {
      setLoadingMore1000(false);
      setStage('infinite'); // After loading next 1000, automatically enable infinite scroll!
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
          // If we are in stage1 and reached 500 icons, pause infinite scroll and show button
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

  // Other categories for "Explore Other Categories" footer
  const otherCategories = main17FeaturedCategories.filter((cat) => cat.slug !== categoryParam).slice(0, 12);

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

  const isCategoryComplete = Boolean(categoryParam && icons.length > 0 && (!hasMore || (totalCount > 0 && icons.length >= totalCount)));
  const showLoad1000Button = Boolean(categoryParam && stage === 'stage1' && icons.length >= 500 && hasMore);

  return (
    <div className="flex flex-col gap-4">
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

      {/* STAGE 1 ACTION: Button to Load 1,000 More Icons (Shown after 500 icons) */}
      {showLoad1000Button && (
        <div className="my-8 p-6 sm:p-8 rounded-3xl bg-white border border-landing-surface-container shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left animate-fade-in">
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-landing-primary">
              Showing 500 {categoryParam.replace(/-/g, ' ')} Icons
            </h3>
            <p className="text-xs text-landing-on-surface-variant mt-0.5">
              Click below to load the next 1,000 icons and unlock continuous scrolling for this category.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleLoadNext1000}
            isLoading={loadingMore1000}
            className="px-6 py-3 font-bold text-xs shadow-coral shrink-0"
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
            No more icons in <strong className="capitalize">{categoryParam.replace(/-/g, ' ')}</strong>. Explore other categories below!
          </p>
        </div>
      )}

      {/* EXPLORE OTHER CATEGORIES BOXES */}
      {Boolean(categoryParam) && (
        <div className="my-8 pt-8 border-t border-landing-surface-container/80 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold font-heading text-landing-primary tracking-tight">
                Explore Other Categories
              </h2>
              <p className="text-xs text-landing-on-surface-variant mt-0.5">
                Browse popular vector collections and icon sets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {otherCategories.map((cat) => {
              const IconComp = CategoryIconMap[cat.iconName] || Layers;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setExploreModalCategory(cat)}
                  className="group p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-white border border-landing-surface-container hover:border-landing-primary/30 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center justify-center gap-2 cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color || '#00327d'}15`, color: cat.color || '#00327d' }}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <h3 className="text-xs font-bold font-heading text-landing-on-surface group-hover:text-landing-primary transition-colors truncate w-full">
                    {cat.name}
                  </h3>
                </button>
              );
            })}
          </div>
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

      {/* Interactive Category Style Modal for Explore Other Categories */}
      {exploreModalCategory && (
        <CategoryStyleModal
          isOpen={!!exploreModalCategory}
          onClose={() => setExploreModalCategory(null)}
          category={exploreModalCategory}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
