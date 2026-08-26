import React, { useState, useEffect } from 'react';
import { Download, Palette, RotateCw, Shield, Check, Sparkles, FileArchive, X, CheckSquare, Square, Undo2, Redo2, RotateCcw } from 'lucide-react';
import Button from '../common/Button';
import TransformControls from '../editor/TransformControls';
import ShapeBadgeControls from '../editor/ShapeBadgeControls';
import { useCollections } from '../../context/CollectionsContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import JSZip from 'jszip';

const resolutions = [16, 24, 32, 64, 128, 256, 512];

const defaultCustomization = {
  color: '#00327d',
  useOriginalColor: true,
  rotation: 0,
  flipH: false,
  flipV: false,
  padding: 12,
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

      // Asynchronously fetch raw SVG strings for live vector editing and ZIP exports
      sourceIcons.forEach(async (icon) => {
        const id = icon._id || icon.slug;
        const targetUrl = icon.svgUrl || icon.pngPreviewUrl;
        if (targetUrl && !icon.svgContent) {
          try {
            const res = await fetch(targetUrl);
            const text = await res.text();
            if (text.includes('<svg')) {
              setSvgStringsMap((prev) => ({ ...prev, [id]: text }));
            }
          } catch (err) {}
        } else if (icon.svgContent) {
          setSvgStringsMap((prev) => ({ ...prev, [id]: icon.svgContent }));
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

      // Apply changes ONLY to the currently selected icons
      activeSelectedIds.forEach((id) => {
        const current = nextMap[id] || { ...defaultCustomization };
        nextMap[id] = updaterFn(current);
      });

      // Update history stack
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
    let content = svgStringsMap[id] || icon.svgContent;

    if (!content) {
      return null;
    }

    if (!custom.useOriginalColor && custom.color) {
      content = content.replace(/currentColor/gi, custom.color);
      content = content.replace(/stroke="#[0-9a-fA-F]{3,6}"/gi, `stroke="${custom.color}"`);
      if (!/stroke=/i.test(content) && /fill=/i.test(content)) {
        content = content.replace(/fill="#[0-9a-fA-F]{3,6}"/gi, `fill="${custom.color}"`);
      }
    }

    return content;
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
        let processed = processIconSvg(icon);

        // If SVG was not preloaded, fetch it on the fly
        if (!processed && (icon.svgUrl || icon.pngPreviewUrl)) {
          try {
            const res = await fetch(icon.svgUrl || icon.pngPreviewUrl);
            const text = await res.text();
            const custom = iconCustomMap[id] || defaultCustomization;
            processed = text;
            if (!custom.useOriginalColor && custom.color) {
              processed = processed.replace(/currentColor/gi, custom.color);
            }
          } catch (e) {
            processed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>${icon.title}</title></svg>`;
          }
        }

        folder.file(filename, processed || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>${icon.title}</title></svg>`);
      }

      folder.file(
        'LICENSE.txt',
        `IconsUniverse Download Package\n==============================\nTotal: ${targetIcons.length} icons\nFormat: ${format.toUpperCase()}\nDownloaded from https://iconsuniverse.com`
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
            className="p-2 rounded-xl text-xs font-bold bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface disabled:opacity-30 transition-colors flex items-center gap-1"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline-block">Undo</span>
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl text-xs font-bold bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface disabled:opacity-30 transition-colors flex items-center gap-1"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline-block">Redo</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-xs font-bold bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface transition-colors flex items-center gap-1"
            title="Reset All to Original"
          >
            <RotateCcw className="w-4 h-4 text-landing-vibrant-coral" />
            <span className="hidden sm:inline-block">Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low transition-colors ml-2"
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
                className={`py-2.5 px-4 rounded-2xl text-xs font-bold border transition-all ${
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
                className={`py-2.5 px-4 rounded-2xl text-xs font-bold border transition-all ${
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
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-colors ${
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
            <div className="flex p-1 rounded-2xl bg-landing-surface-container-low border border-landing-outline-variant/30 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('color')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'color' ? 'bg-white shadow-xs text-landing-primary' : 'text-landing-on-surface-variant'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Color</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transform')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'transform' ? 'bg-white shadow-xs text-landing-primary' : 'text-landing-on-surface-variant'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Transform</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('badge')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'badge' ? 'bg-white shadow-xs text-landing-primary' : 'text-landing-on-surface-variant'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Backdrop</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 rounded-3xl bg-white border border-landing-surface-container shadow-xs min-h-[220px]">
              {/* TAB 1: Custom Hex Color Section Only */}
              {activeTab === 'color' && (
                <div className="flex flex-col gap-4">
                  {/* Keep Original Colors button for selected icons */}
                  <button
                    type="button"
                    onClick={() => {
                      updateCustomizations((prev) => ({
                        ...prev,
                        useOriginalColor: true,
                      }));
                      addToast('Kept original colors for selected icons', 'info');
                    }}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
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
                          value={sampleActiveCustom.color || '#00327d'}
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
                          const val = e.target.value;
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

              {/* TAB 2: Transforms (No zoom/scale slider) */}
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
                      padding: 12,
                    }));
                  }}
                />
              )}

              {/* TAB 3: Backdrop Shape Badges */}
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
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Big Live Preview Section (8 columns) */}
        <div className="lg:col-span-8 bg-[radial-gradient(#e2e2e9_1px,transparent_1px)] [background-size:16px_16px] bg-[#faf8ff] p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Live Preview Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white/90 p-3 rounded-2xl border border-landing-surface-container shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-landing-primary">
                  Live Preview Canvas
                </span>
                <span className="text-xs text-landing-on-surface-variant font-medium">
                  (Click any icon to select/deselect for editing)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPreview}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-primary transition-colors"
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
                    className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center bg-white ${
                      isSelected
                        ? 'ring-2 ring-landing-primary border-transparent shadow-sm'
                        : 'border-landing-surface-container/80 opacity-70 hover:opacity-100 shadow-2xs'
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
                        className="text-landing-primary p-0.5"
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
                      className="w-14 h-14 my-2 flex items-center justify-center transition-all shadow-xs"
                      style={{
                        ...getShapeStyle(),
                        transform: `rotate(${custom.rotation}deg) scaleX(${custom.flipH ? -1 : 1}) scaleY(${custom.flipV ? -1 : 1})`,
                      }}
                    >
                      {processIconSvg(icon) ? (
                        <div
                          className={`flex items-center justify-center ${custom.shape !== 'none' ? 'w-8 h-8' : 'w-10 h-10'} text-landing-primary [&>svg]:w-full [&>svg]:h-full`}
                          style={{
                            color: !custom.useOriginalColor ? custom.color : '#00327d',
                          }}
                          dangerouslySetInnerHTML={{ __html: processIconSvg(icon) }}
                        />
                      ) : (
                        <img
                          src={icon.svgUrl || icon.pngPreviewUrl}
                          alt={icon.title}
                          className={`${custom.shape !== 'none' ? 'w-8 h-8' : 'w-10 h-10'} object-contain`}
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
          <div className="p-4 bg-white rounded-3xl border border-landing-surface-container shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
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
