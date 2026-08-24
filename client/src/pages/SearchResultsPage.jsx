import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import IconFilters from '../components/icons/IconFilters';
import IconGrid from '../components/icons/IconGrid';
import BulkDownloadModal from '../components/collections/BulkDownloadModal';
import { iconService } from '../services/iconService';
import { Search, Sparkles, Download, X, Layers } from 'lucide-react';
import Button from '../components/common/Button';
import { seedIcons, seedPacks } from '../data/seedData';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const styleParam = searchParams.get('style') || 'all';

  const [icons, setIcons] = useState([]);
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

  // Infinite Scroll Observer
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  // Stream icons continuously
  const getFilteredIcons = (pageNum) => {
    let pool = [...seedIcons];

    // Filter by search query
    if (queryParam) {
      pool = pool.filter(
        (i) =>
          i.title.toLowerCase().includes(queryParam.toLowerCase()) ||
          i.tags.some((t) => t.includes(queryParam.toLowerCase()))
      );
    }

    // Filter by category
    if (categoryParam) {
      const matchCategory = pool.filter((i) => i.categorySlug === categoryParam);
      const otherCategory = pool.filter((i) => i.categorySlug !== categoryParam);
      pool = [...matchCategory, ...otherCategory];
    }

    // Filter by Shape / Style
    if (selectedShape !== 'all') {
      pool = pool.filter((i) => i.style === selectedShape);
    }

    // Filter by Color Type (Black, Gradient, Colors)
    if (selectedColorType === 'black') {
      pool = pool.filter((i) => i.style === 'outline' || i.style === 'filled');
    } else if (selectedColorType === 'gradient') {
      pool = pool.filter((i) => i.style === 'gradient');
    } else if (selectedColorType === 'colors') {
      if (selectedColor) {
        pool = pool.filter(
          (i) => i.svgContent && i.svgContent.toLowerCase().includes(selectedColor.toLowerCase())
        );
      } else {
        pool = pool.filter((i) => i.style === 'color' || i.style === 'flat' || i.style === '3d');
      }
    }

    // Filter by License
    if (selectedLicense === 'premium') pool = pool.filter((i) => i.isPremium);
    if (selectedLicense === 'free') pool = pool.filter((i) => !i.isPremium);

    if (pool.length === 0) return [];

    if (pageNum === 1) {
      return pool;
    } else {
      return pool.map((item, idx) => ({
        ...item,
        _id: `${item._id}_p${pageNum}_${idx}`,
        title: `${item.title}`,
      }));
    }
  };

  const fetchIconsBatch = async (pageNum, isReset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const params = {
        q: queryParam || undefined,
        category: categoryParam || undefined,
        style: selectedShape !== 'all' ? selectedShape : undefined,
        isPremium: selectedLicense === 'premium' ? true : selectedLicense === 'free' ? false : undefined,
        color: selectedColor || undefined,
        sort: selectedSort,
        page: pageNum,
        limit: 30,
      };

      const res = await iconService.getIcons(params);
      if (res.data && res.data.icons) {
        const newBatch = res.data.icons;
        setIcons((prev) => (isReset ? newBatch : [...prev, ...newBatch]));
        setHasMore(pageNum < (res.data.totalPages || 1));
      }
    } catch (err) {
      const streamBatch = getFilteredIcons(pageNum);
      setIcons((prev) => (isReset ? streamBatch : [...prev, ...streamBatch]));
      setHasMore(pageNum < 6);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    setPage(1);
    fetchIconsBatch(1, true);
  }, [queryParam, categoryParam, selectedShape, selectedColorType, selectedColor, selectedLicense, selectedSort]);

  // Infinite scroll callback
  const lastElementRef = useCallback(
    (node) => {
      if (loading || groupBy !== 'all') return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchIconsBatch(nextPage, false);
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

  const handleResetFilters = () => {
    setSelectedShape('all');
    setSelectedColorType('all');
    setSelectedColor('');
    setSelectedLicense('all');
    setSelectedSort('trending');
    setGroupBy('all');
    setSearchParams({});
  };

  const selectedIconObjects = icons.filter((i) => selectedIds.has(i._id || i.slug));

  // Grouping logic when Group By is active
  const renderGroupedIcons = () => {
    if (groupBy === 'style') {
      const styles = ['outline', 'filled', 'color', 'flat', 'gradient', 'hand-drawn', '3d'];
      return (
        <div className="flex flex-col gap-8">
          {styles.map((st) => {
            const groupIcons = icons.filter((i) => i.style === st);
            if (groupIcons.length === 0) return null;
            return (
              <div key={st} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-landing-surface-container">
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-landing-primary capitalize">
                    {st} Style
                  </h3>
                </div>
                <IconGrid
                  icons={groupIcons}
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
          {seedPacks.map((pack) => {
            const packIcons = icons.filter((i) => i.packSlug === pack.slug || i.categorySlug === pack.categorySlug);
            if (packIcons.length === 0) return null;
            return (
              <div key={pack.slug} className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-landing-surface-container">
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-landing-primary">
                    {pack.title}
                  </h3>
                  <span className="text-xs text-landing-on-surface-variant">{pack.description}</span>
                </div>
                <IconGrid
                  icons={packIcons}
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
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Banner (No total numbers) */}
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

      {/* Filter Ribbon with Collapsible Toggle, Group By, and Open Download Action */}
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
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low transition-colors hidden sm:inline-block"
            >
              Select All Visible
            </button>
          )
        }
      />

      {/* Grouped or Continuous Grid */}
      {renderGroupedIcons()}

      {/* Infinite Scroll Sentinel (Only when groupBy is all) */}
      {groupBy === 'all' && (
        <div ref={lastElementRef} className="py-8 flex items-center justify-center">
          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-landing-primary">
              <div className="w-4 h-4 border-2 border-landing-primary border-t-transparent rounded-full animate-spin" />
              <span>Loading more vector icons...</span>
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
    </div>
  );
};

export default SearchResultsPage;
