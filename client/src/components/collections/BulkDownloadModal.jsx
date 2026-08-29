import React, { useState, useEffect } from 'react';
import { Download, Palette, RotateCw, Shield, Check, Sparkles, FileArchive, X, CheckSquare, Square, Undo2, Redo2, RotateCcw } from 'lucide-react';
import Button from '../common/Button';
import TransformControls from '../editor/TransformControls';
import ShapeBadgeControls from '../editor/ShapeBadgeControls';
import { useCollections } from '../../context/CollectionsContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import JSZip from 'jszip';
import {
  fetchAndCacheSvg,
  recolorSvg,
  normalizeSvgForCanvas,
  getSafeIconUrl,
  getDirectR2Url,
  normalizeHexColor,
  getCachedSvg,
} from '../../services/svgCacheService';

const resolutions = [16, 24, 32, 64, 128, 256, 512];

const defaultCustomization = {
  color: '#00327d',
  useOriginalColor: true,
  rotation: 0,
  flipH: false,
  flipV: false,
  padding: 4,
  shape: 'none',
  badgeColor: '#f4f3fa',
  badgeOpacity: 100,
};

const BulkDownloadModal = ({
  isOpen,
  onClose,
  icons: propIcons = null,
  collectionName = null,
}) => {
  const { collectionIcons: contextCollectionIcons, activeCollectionName: contextCollectionName } = useCollections();
  const { isPro } = useAuth();
  const { addToast } = useToast();

  const sourceIcons = propIcons || contextCollectionIcons || [];
  const activeName = collectionName || contextCollectionName || 'Selected Icons';

  // Export format: Only SVG and PNG
  const [format, setFormat] = useState('svg'); // 'svg' | 'png'
  const [pngResolution, setPngResolution] = useState(512);

  // Active tools tab: 'color' | 'transform' | 'badge'
  const [activeTab, setActiveTab] = useState('color');

  // Currently focused icon IDs for editing in the preview (defaults to all icons selected initially)
  const [activeSelectedIds, setActiveSelectedIds] = useState(new Set());

  // Per-icon customization dictionary: { [iconId]: { ...customization } }
  const [iconCustomMap, setIconCustomMap] = useState({});
  // Raw SVG content dictionary: { [iconId]: rawSvgString }
  const [svgStringsMap, setSvgStringsMap] = useState({});

  // History stack for Undo / Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Daily quota
  const dailyLimit = 100;
  const [downloadsUsedToday, setDownloadsUsedToday] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize iconCustomMap and select all icons by default + fetch SVG contents
  useEffect(() => {
    if (sourceIcons && sourceIcons.length > 0) {
      const initialMap = {};
      const initialIds = new Set();

      sourceIcons.forEach((icon) => {
        const id = icon._id || icon.slug;
        initialMap[id] = { ...defaultCustomization };
        initialIds.add(id);
      });

      setIconCustomMap(initialMap);
      setActiveSelectedIds(initialIds);
      setHistory([initialMap]);
      setHistoryIndex(0);

      // Eagerly prefetch and cache raw SVG strings for all icons with dual-tier failover
      sourceIcons.forEach(async (icon) => {
        const id = icon._id || icon.slug;
        if (icon.svgContent) {
          setSvgStringsMap((prev) => ({ ...prev, [id]: normalizeSvgForCanvas(icon.svgContent, id) }));
        } else {
          const directCdnUrl = getDirectR2Url(icon);
          const proxyUrl = icon.svgUrl ? getSafeIconUrl(icon.svgUrl) : '';
          const targetUrl = proxyUrl || directCdnUrl;
          if (targetUrl) {
            const svgText = await fetchAndCacheSvg(targetUrl, id, directCdnUrl);
            if (svgText) {
              setSvgStringsMap((prev) => ({ ...prev, [id]: normalizeSvgForCanvas(svgText, id) }));
            }
          }
        }
      });
    }
  }, [sourceIcons]);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const stored = localStorage.getItem(`iu_bulk_dl_${todayStr}`);
      if (stored) {
        setDownloadsUsedToday(parseInt(stored, 10));
      }
    } catch (e) {}
  }, []);

  if (!isOpen) return null;

  const remainingQuota = Math.max(0, dailyLimit - downloadsUsedToday);

  // Push new state to history for Undo/Redo
  const updateCustomizations = (updaterFn) => {
    setIconCustomMap((prevMap) => {
      const nextMap = { ...prevMap };

      activeSelectedIds.forEach((id) => {
        const current = nextMap[id] || { ...defaultCustomization };
        nextMap[id] = updaterFn(current);
      });

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(nextMap);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return nextMap;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setIconCustomMap(history[prevIndex]);
      setHistoryIndex(prevIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setIconCustomMap(history[nextIndex]);
      setHistoryIndex(nextIndex);
    }
  };

  const handleReset = () => {
    const resetMap = {};
    sourceIcons.forEach((icon) => {
      const id = icon._id || icon.slug;
      resetMap[id] = { ...defaultCustomization };
    });
    setIconCustomMap(resetMap);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(resetMap);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    addToast('Reset customizations for all icons', 'info');
  };

  // Toggle selection inside live preview
  const handleTogglePreviewSelect = (id) => {
    setActiveSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllPreview = () => {
    if (activeSelectedIds.size === sourceIcons.length) {
      setActiveSelectedIds(new Set());
    } else {
      setActiveSelectedIds(new Set(sourceIcons.map((i) => i._id || i.slug)));
    }
  };

  // Process raw SVG with a specific icon's customization
  const processIconSvg = (icon) => {
    const id = icon._id || icon.slug;
    const custom = iconCustomMap[id] || defaultCustomization;
    let content = svgStringsMap[id] || icon.svgContent || getCachedSvg(id);

    if (!content) {
      return null;
    }

    if (!custom.useOriginalColor && custom.color) {
      content = recolorSvg(content, custom.color);
    }

    return normalizeSvgForCanvas(content);
  };

  // Generic download function: downloads either specific targetIcons or all sourceIcons
  const executeDownload = async (targetIcons, downloadLabel) => {
    if (!targetIcons || targetIcons.length === 0) {
      addToast('No icons selected to download', 'error');
      return;
    }

    if (!isPro && targetIcons.length > remainingQuota) {
      addToast(`Daily download limit of ${dailyLimit} reached! You have ${remainingQuota} remaining today.`, 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const folderName = activeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const folder = zip.folder(folderName);

      for (const icon of targetIcons) {
        const id = icon._id || icon.slug;
        const filename = `${icon.slug || icon.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${format}`;
        const custom = iconCustomMap[id] || defaultCustomization;
        let processed = processIconSvg(icon);

        if (!processed) {
          const targetUrl = getSafeIconUrl(
            icon.svgUrl || icon.pngPreviewUrl || (icon.path ? `https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev/icons/${icon.path}` : ''),
            id
          );
          if (targetUrl) {
            const raw = await fetchAndCacheSvg(targetUrl, id);
            if (raw) {
              processed = !custom.useOriginalColor && custom.color ? recolorSvg(raw, custom.color) : raw;
              processed = normalizeSvgForCanvas(processed);
            }
          }
        }

        const validSvg = processed || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>${icon.title}</title></svg>`;

        if (format === 'png') {
          const pngBlob = await new Promise((resolve) => {
            const img = new Image();
            const svgBlob = new Blob([validSvg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            img.onload = () => {
              const resSize = pngResolution || 512;
              const canvas = document.createElement('canvas');
              canvas.width = resSize;
              canvas.height = resSize;
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, resSize, resSize);
              ctx.drawImage(img, 0, 0, resSize, resSize);
              URL.revokeObjectURL(url);
              canvas.toBlob((b) => resolve(b), 'image/png');
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve(null);
            };
            img.src = url;
          });

          if (pngBlob) {
            folder.file(filename, pngBlob);
          } else {
            folder.file(filename.replace(/\.png$/, '.svg'), validSvg);
          }
        } else {
          folder.file(filename, validSvg);
        }
      }

      folder.file(
        'LICENSE.txt',
        `IconsUniverse Download Package\n==============================\nTotal: ${targetIcons.length} icons\nFormat: ${format.toUpperCase()}\nDimensions: ${format === 'png' ? pngResolution : '512'}x${format === 'png' ? pngResolution : '512'}px\nDownloaded from https://iconsuniverse.com`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}-${format}-bundle.zip`;
      a.click();
      URL.revokeObjectURL(url);

      if (!isPro) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const updated = downloadsUsedToday + targetIcons.length;
        setDownloadsUsedToday(updated);
        try {
          localStorage.setItem(`iu_bulk_dl_${todayStr}`, updated.toString());
        } catch (e) {}
      }

      addToast(`Downloaded ${targetIcons.length} icons as ${format.toUpperCase()} ZIP!`, 'success');
      onClose();
    } catch (err) {
      addToast('Download error: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = () => {
    executeDownload(sourceIcons, 'all');
  };

  const handleDownloadSelected = () => {
    const selectedIconObjs = sourceIcons.filter((i) => activeSelectedIds.has(i._id || i.slug));
    executeDownload(selectedIconObjs, 'selected');
  };

  // Get active custom color for display
  const sampleActiveCustom = (() => {
    const firstActiveId = Array.from(activeSelectedIds)[0];
    if (firstActiveId && iconCustomMap[firstActiveId]) {
      return iconCustomMap[firstActiveId];
    }
    return defaultCustomization;
  })();

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in overflow-hidden">
      {/* Top Fullscreen Header */}
      <div className="px-6 py-3.5 border-b border-landing-surface-container bg-white flex items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-energy-gradient p-0.5 flex items-center justify-center shadow-xs">
            <div className="w-full h-full bg-[#001e52] rounded-[10px] flex items-center justify-center text-white">
              <Download className="w-4 h-4 text-landing-electric-teal" />
            </div>
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-base sm:text-lg text-landing-primary">
              Bulk Download Studio
            </h2>
            <p className="text-xs text-landing-on-surface-variant">
              Customizing {activeSelectedIds.size} of {sourceIcons.length} icons
            </p>
          </div>
        </div>

        {/* History Action Controls: Undo, Redo, Reset & Close */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl text-xs font-bold bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface disabled:opacity-30 transition-colors flex items-center gap-1 cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline-block">Undo</span>
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl text-xs font-bold bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface disabled:opacity-30 transition-colors flex items-center gap-1 cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline-block">Redo</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-xs font-bold bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset All to Original"
          >
            <RotateCcw className="w-4 h-4 text-landing-vibrant-coral" />
            <span className="hidden sm:inline-block">Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low transition-colors ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Side: Sidebar Controls (4 columns) */}
        <div className="lg:col-span-4 border-r border-landing-surface-container bg-landing-surface-container-lowest p-5 overflow-y-auto flex flex-col gap-5">
          {/* 1. Export Format: Only SVG and PNG */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant block mb-2">
              1. Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`py-2.5 px-4 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  format === 'svg'
                    ? 'bg-landing-primary text-white border-landing-primary shadow-xs'
                    : 'bg-white text-landing-on-surface border-landing-surface-container hover:bg-landing-surface-container-low'
                }`}
              >
                SVG
              </button>

              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`py-2.5 px-4 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  format === 'png'
                    ? 'bg-landing-primary text-white border-landing-primary shadow-xs'
                    : 'bg-white text-landing-on-surface border-landing-surface-container hover:bg-landing-surface-container-low'
                }`}
              >
                PNG
              </button>
            </div>

            {/* PNG Resolution Selector */}
            {format === 'png' && (
              <div className="mt-3 p-3 rounded-2xl bg-white border border-landing-surface-container animate-fade-in">
                <label className="text-[11px] font-bold text-landing-on-surface-variant block mb-1.5">
                  Resolution Size:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {resolutions.map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setPngResolution(res)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                        pngResolution === res
                          ? 'bg-landing-primary text-white'
                          : 'bg-landing-surface-container-low text-landing-on-surface hover:bg-landing-primary/10'
                      }`}
                    >
                      {res}px
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Customization Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant block mb-2">
              2. Customization Controls ({activeSelectedIds.size} Selected)
            </label>

            {/* Tabs Bar */}
            <div className="flex p-1 rounded-2xl bg-landing-surface-container-low border border-landing-surface-container mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('color')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'color'
                    ? 'bg-white shadow-xs text-landing-primary'
                    : 'text-landing-on-surface-variant hover:text-landing-primary'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Color</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transform')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'transform'
                    ? 'bg-white shadow-xs text-landing-primary'
                    : 'text-landing-on-surface-variant hover:text-landing-primary'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Transform</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('badge')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'badge'
                    ? 'bg-white shadow-xs text-landing-primary'
                    : 'text-landing-on-surface-variant hover:text-landing-primary'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Backdrop</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 rounded-3xl bg-white border border-landing-surface-container shadow-xs min-h-[220px]">
              {/* TAB 1: Custom Hex Color Section */}
              {activeTab === 'color' && (
                <div className="flex flex-col gap-4">
                  {/* Keep Original Colors button */}
                  <button
                    type="button"
                    onClick={() => {
                      updateCustomizations((prev) => ({
                        ...prev,
                        useOriginalColor: true,
                      }));
                      addToast('Kept original colors for selected icons', 'info');
                    }}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      sampleActiveCustom.useOriginalColor
                        ? 'bg-landing-primary text-white border-landing-primary shadow-xs'
                        : 'bg-landing-surface-container-low text-landing-on-surface border-landing-surface-container hover:bg-landing-surface-container'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Keep Original Icon Colors</span>
                  </button>

                  <div className="pt-2 border-t border-landing-surface-container flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold text-landing-on-surface-variant">
                      <span>Custom Hex Color</span>
                      <span className="font-mono uppercase text-landing-primary font-bold">
                        {sampleActiveCustom.color}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-11 h-11 rounded-2xl overflow-hidden cursor-pointer border border-landing-surface-container shrink-0 shadow-xs flex items-center justify-center bg-white hover:scale-105 transition-transform">
                        <input
                          type="color"
                          value={normalizeHexColor(sampleActiveCustom.color, '#00327d')}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCustomizations((prev) => ({
                              ...prev,
                              color: val,
                              useOriginalColor: false,
                            }));
                          }}
                          className="w-16 h-16 -m-2 cursor-pointer border-0 p-0"
                        />
                      </label>

                      <input
                        type="text"
                        value={sampleActiveCustom.color || '#00327D'}
                        onChange={(e) => {
                          let val = e.target.value.trim();
                          if (val && !val.startsWith('#')) {
                            val = '#' + val;
                          }
                          updateCustomizations((prev) => ({
                            ...prev,
                            color: val,
                            useOriginalColor: false,
                          }));
                        }}
                        placeholder="#00327D"
                        maxLength={7}
                        className="w-full bg-landing-surface-container-low px-4 py-2.5 rounded-2xl text-xs font-mono font-bold text-landing-on-surface border border-landing-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-landing-primary uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Transforms */}
              {activeTab === 'transform' && (
                <TransformControls
                  rotation={sampleActiveCustom.rotation}
                  flipH={sampleActiveCustom.flipH}
                  flipV={sampleActiveCustom.flipV}
                  padding={sampleActiveCustom.padding}
                  onUpdateTransform={(up) => {
                    updateCustomizations((prev) => ({
                      ...prev,
                      ...up,
                    }));
                  }}
                  onReset={() => {
                    updateCustomizations((prev) => ({
                      ...prev,
                      rotation: 0,
                      flipH: false,
                      flipV: false,
                      padding: 4,
                    }));
                  }}
                />
              )}

              {/* TAB 3: Backdrop Shapes */}
              {activeTab === 'badge' && (
                <ShapeBadgeControls
                  shape={sampleActiveCustom.shape}
                  badgeColor={sampleActiveCustom.badgeColor}
                  badgeOpacity={sampleActiveCustom.badgeOpacity}
                  onUpdateBadge={(up) => {
                    updateCustomizations((prev) => ({
                      ...prev,
                      ...up,
                    }));
                  }}
                  onReset={() => {
                    updateCustomizations((prev) => ({
                      ...prev,
                      shape: 'none',
                      badgeColor: '#f4f3fa',
                      badgeOpacity: 100,
                    }));
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Big Live Preview Section (8 columns) */}
        <div className="lg:col-span-8 p-5 flex flex-col justify-between overflow-y-auto bg-white">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-landing-surface-container mb-4">
              <div>
                <h3 className="text-sm font-extrabold font-heading text-landing-primary">
                  Live Preview & Target Selection
                </h3>
                <p className="text-xs text-landing-on-surface-variant">
                  Click icon cards to toggle customization target.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPreview}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-primary transition-colors cursor-pointer"
                >
                  {activeSelectedIds.size === sourceIcons.length ? 'Deselect All' : 'Select All Icons'}
                </button>
              </div>
            </div>

            {/* Big Icons Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 pb-8">
              {sourceIcons.map((icon) => {
                const id = icon._id || icon.slug;
                const isSelected = activeSelectedIds.has(id);
                const custom = iconCustomMap[id] || defaultCustomization;
                const processedSvg = processIconSvg(icon);

                // Shape styling
                const opacityHex = Math.round((custom.badgeOpacity / 100) * 255)
                  .toString(16)
                  .padStart(2, '0');

                const getShapeStyle = () => {
                  if (custom.shape === 'none') return {};
                  const base = { backgroundColor: `${custom.badgeColor}${opacityHex}` };
                  if (custom.shape === 'circle') return { ...base, borderRadius: '50%' };
                  if (custom.shape === 'rounded') return { ...base, borderRadius: '24%' };
                  if (custom.shape === 'hexagon') {
                    return {
                      ...base,
                      clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                    };
                  }
                  return base;
                };

                return (
                  <div
                    key={id}
                    onClick={() => handleTogglePreviewSelect(id)}
                    className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center bg-white ${
                      isSelected
                        ? 'ring-2 ring-landing-primary border-transparent shadow-xs'
                        : 'border-landing-surface-container/80 opacity-75 hover:opacity-100 shadow-2xs'
                    }`}
                  >
                    {/* Top Checkbox */}
                    <div className="w-full flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePreviewSelect(id);
                        }}
                        className="text-landing-primary p-0.5 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 fill-landing-primary text-white" />
                        ) : (
                          <Square className="w-4 h-4 text-landing-on-surface-variant/70" />
                        )}
                      </button>
                    </div>

                    {/* Centered Canvas Preview with backdrop shapes and transforms */}
                    <div
                      className="w-14 h-14 my-1.5 flex items-center justify-center transition-all shadow-2xs overflow-hidden m-auto relative"
                      style={getShapeStyle()}
                    >
                      {processedSvg ? (
                        <div
                          className="w-full h-full flex items-center justify-center m-auto text-landing-primary [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:m-auto [&>svg]:max-w-full [&>svg]:max-h-full"
                          style={{
                            transform: `rotate(${custom.rotation || 0}deg) scaleX(${custom.flipH ? -1 : 1}) scaleY(${custom.flipV ? -1 : 1})`,
                            padding: custom.shape !== 'none' ? `${Math.max(6, custom.padding || 8)}px` : `${custom.padding || 2}px`,
                            color: !custom.useOriginalColor && custom.color ? custom.color : '#00327d',
                          }}
                          dangerouslySetInnerHTML={{ __html: processedSvg }}
                        />
                      ) : (
                        <img
                          src={getSafeIconUrl(icon.svgUrl || icon.pngPreviewUrl || (icon.path ? `https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev/icons/${icon.path}` : ''))}
                          alt={icon.title}
                          className="w-8 h-8 object-contain m-auto"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-landing-on-surface truncate w-full mt-1">
                      {icon.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Sticky Action Footer with Download Selected (Left) and Download All (Right) */}
          <div className="p-4 bg-white rounded-3xl border border-landing-surface-container shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 mt-4">
            <div className="text-xs text-landing-on-surface-variant">
              <span>{activeSelectedIds.size} Selected • {sourceIcons.length} Total in Studio</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>

              {/* Download Selected Button (Beside on the left) */}
              <Button
                variant="glass"
                size="lg"
                onClick={handleDownloadSelected}
                isLoading={isProcessing}
                disabled={activeSelectedIds.size === 0}
                icon={Download}
                className="w-full sm:w-auto text-landing-primary border-landing-primary/30"
              >
                Download Selected ({activeSelectedIds.size}) Icons
              </Button>

              {/* Download All Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleDownloadAll}
                isLoading={isProcessing}
                disabled={sourceIcons.length === 0}
                icon={FileArchive}
                className="w-full sm:w-auto"
              >
                Download All ({sourceIcons.length}) Icons ({format.toUpperCase()} ZIP)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkDownloadModal;
