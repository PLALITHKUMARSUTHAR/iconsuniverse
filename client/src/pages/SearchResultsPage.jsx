import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import IconFilters from '../components/icons/IconFilters';
import IconGrid from '../components/icons/IconGrid';
import BulkDownloadModal from '../components/collections/BulkDownloadModal';
import CategoryStyleModal from '../components/landing/CategoryStyleModal';
import AllCategoriesModal from '../components/common/AllCategoriesModal';
import { iconService } from '../services/iconService';
import { Search, Sparkles, Download, X, Layers, Check, ArrowRight, Grid3X3, CircleDot, Palette } from 'lucide-react';
import Button from '../components/common/Button';
import Footer from '../components/common/Footer';
import { main17FeaturedCategories } from '../data/categories';
import { CategoryIconMap } from '../data/categoryIcons';

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

  const [icons, setIcons] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  // Sync state when URL params change
  useEffect(() => {
    const currentStyle = searchParams.get('style') || 'all';
    setSelectedShape(currentStyle);
  }, [searchParams]);

  // Initial load or filter change
  useEffect(() => {
    setPage(1);
    fetchIconsBatch(1, true, 60);
  }, [queryParam, categoryParam, selectedShape, selectedColorType, selectedColor, selectedLicense, selectedSort]);

  // Infinite scroll callback
  const lastElementRef = useCallback(
    (node) => {
      if (loading || groupBy !== 'all' || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
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

  const handleQuickStyleChange = (styleId) => {
    setSelectedShape(styleId);
    const newParams = {};
    if (queryParam) newParams.q = queryParam;
    if (categoryParam) newParams.category = categoryParam;
    if (styleId !== 'all') newParams.style = styleId;
    setSearchParams(newParams);
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
  const isCategoryComplete = Boolean(icons.length > 0 && (!hasMore || (totalCount > 0 && icons.length >= totalCount)));

  return (
    <div className="h-full flex flex-col min-h-0 gap-2">
      {/* 1. Fixed Top Header & Filters */}
      <div className="shrink-0 flex flex-col gap-2.5 pb-1">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-subpage-outline-variant/20">
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
              {totalCount > 0 ? `${totalCount.toLocaleString()} vector icons available. ` : ''}
              Click to select icons, then click Open Download to customize and download.
            </p>
          </div>

          {/* Quick Style Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-landing-surface-container shadow-2xs overflow-x-auto">
            {quickStylePills.map((pill) => {
              const IconComp = pill.icon;
              const isSelected = selectedShape === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleQuickStyleChange(pill.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-landing-primary text-white shadow-xs'
                      : 'text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Ribbon */}
        <IconFilters
          selectedShape={selectedShape}
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
      </div>

      {/* 2. Middle Scrollable Icons Grid Area (Scrolls independently of top/bottom) */}
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

      {/* 3. Fixed Bottom Docked Section: Explore More Categories + Collapsible Footer */}
      <div className="shrink-0 z-20 flex flex-col gap-2 pt-1 border-t border-landing-surface-container/60 bg-[#f8f9ff]">
        {/* Explore Other Categories Strip */}
        {isCategoryMode && (
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-landing-surface-container shadow-2xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-landing-primary">
                Explore More Categories
              </span>
              <button
                type="button"
                onClick={() => setIsAllOtherCategoriesModalOpen(true)}
                className="text-xs font-bold text-landing-primary hover:text-landing-vibrant-coral flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View all categories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {featured11Categories.map((cat) => {
                const IconComp = CategoryIconMap[cat.iconName] || Layers;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setExploreModalCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface text-xs font-bold shrink-0 transition-colors border border-landing-surface-container cursor-pointer"
                  >
                    <IconComp className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    <span className="truncate max-w-[120px]">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsible Footer Fixed at Bottom */}
        <Footer collapsible={true} />
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
