import React, { useState } from 'react';
import { Palette, RotateCw, Shield, Download, Copy, Check, Upload, Sparkles, FolderPlus } from 'lucide-react';
import IconEditorCanvas from '../components/editor/IconEditorCanvas';
import ColorPalettePicker from '../components/editor/ColorPalettePicker';
import TransformControls from '../components/editor/TransformControls';
import ShapeBadgeControls from '../components/editor/ShapeBadgeControls';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useCollections } from '../context/CollectionsContext';
import { seedIcons } from '../data/seedData';

const IconEditorPage = () => {
  const [currentIcon, setCurrentIcon] = useState(seedIcons[0]);
  const [activeTab, setActiveTab] = useState('colors');
  const [color, setColor] = useState('#00327d');
  const [layerOverrides, setLayerOverrides] = useState({});
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [scale, setScale] = useState(1);
  const [padding, setPadding] = useState(16);
  const [shape, setShape] = useState('circle');
  const [badgeColor, setBadgeColor] = useState('#f4f3fa');
  const [badgeOpacity, setBadgeOpacity] = useState(100);
  const [hasCopied, setHasCopied] = useState(false);

  const { addToast } = useToast();
  const { addIcon } = useCollections();

  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const svgText = event.target.result;
      setCurrentIcon({
        title: file.name.replace(/\.svg$/i, ''),
        slug: 'custom-uploaded-icon',
        svgContent: svgText,
      });
      addToast('Uploaded custom SVG!', 'success');
    };
    reader.readAsText(file);
  };

  const handleDownloadSvg = () => {
    let finalSvg = currentIcon.svgContent || '';
    finalSvg = finalSvg.replace(/currentColor/gi, color);
    finalSvg = finalSvg.replace(/stroke="#[0-9a-fA-F]{3,6}"/gi, `stroke="${color}"`);

    const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentIcon.title || 'icon').toLowerCase().replace(/\s+/g, '-')}-edited.svg`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded customized SVG!', 'success');
  };

  const handleCopySvg = () => {
    let finalSvg = currentIcon.svgContent?.replace(/currentColor/gi, color) || '';
    navigator.clipboard.writeText(finalSvg);
    setHasCopied(true);
    addToast('SVG markup copied to clipboard!', 'success');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-subpage-outline-variant/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-subpage-primary text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5 text-landing-electric-teal" />
            <span>Flaticon Studio Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-subpage-on-surface tracking-tight">
            In-Browser Vector Icon Editor
          </h1>
          <p className="text-xs text-subpage-on-surface-variant mt-1">
            Recolor layers, rotate, scale, and add geometric badges in real-time.
          </p>
        </div>

        {/* Upload Custom SVG Button */}
        <div>
          <label className="cursor-pointer px-5 py-2.5 rounded-full glass-subpage hover:bg-white text-xs font-bold text-subpage-primary border border-white/80 shadow-sm flex items-center gap-2 transition-all">
            <Upload className="w-4 h-4 text-landing-vibrant-coral" />
            <span>Upload My SVG File</span>
            <input type="file" accept=".svg" onChange={handleCustomUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Editor Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Canvas & Icon Gallery Selector */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-8 sm:p-12 rounded-4xl glass-subpage bg-white/90 border border-white/80 shadow-2xl flex flex-col items-center justify-center">
            <IconEditorCanvas
              rawSvg={currentIcon.svgContent}
              color={color}
              layerColorOverrides={layerOverrides}
              rotation={rotation}
              flipH={flipH}
              flipV={flipV}
              scale={scale}
              padding={padding}
              shape={shape}
              badgeColor={badgeColor}
              badgeOpacity={badgeOpacity}
              previewSize={280}
            />

            <div className="mt-6 flex items-center justify-between w-full text-xs text-subpage-on-surface-variant font-medium px-2">
              <span>Selected: <strong className="text-subpage-primary">{currentIcon.title}</strong></span>
              <span>Matrix: {rotation}° • Scale: {Math.round(scale * 100)}%</span>
            </div>
          </div>

          {/* Quick Select Library Shelf */}
          <div className="p-5 rounded-3xl bg-white border border-subpage-outline-variant/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant mb-3">
              Or Pick an Icon from Library:
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {seedIcons.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setCurrentIcon(item)}
                  className={`p-3 rounded-2xl border shrink-0 transition-all flex flex-col items-center justify-center w-20 h-20 ${
                    currentIcon.slug === item.slug
                      ? 'border-subpage-primary bg-subpage-surface-container-low shadow-sm'
                      : 'border-subpage-surface-container hover:bg-subpage-surface-container-lowest'
                  }`}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center text-subpage-primary"
                    dangerouslySetInnerHTML={{ __html: item.svgContent }}
                  />
                  <span className="text-[10px] font-bold text-subpage-on-surface truncate w-full text-center mt-1">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Studio Control Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-4xl glass-subpage bg-white/95 border border-white/80 shadow-2xl flex flex-col gap-5">
            {/* Tabs */}
            <div className="flex p-1 rounded-2xl bg-subpage-surface-container-low border border-subpage-outline-variant/30">
              <button
                type="button"
                onClick={() => setActiveTab('colors')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'colors' ? 'bg-white shadow-sm text-subpage-primary' : 'text-subpage-on-surface-variant'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-landing-vibrant-coral" />
                <span>Color Palette</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transforms')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'transforms' ? 'bg-white shadow-sm text-subpage-primary' : 'text-subpage-on-surface-variant'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5 text-subpage-primary" />
                <span>Transforms</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('badge')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'badge' ? 'bg-white shadow-sm text-subpage-primary' : 'text-subpage-on-surface-variant'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-landing-electric-teal" />
                <span>Backdrop</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 rounded-3xl bg-subpage-surface-container-lowest border border-subpage-surface-container min-h-[260px]">
              {activeTab === 'colors' && (
                <ColorPalettePicker
                  activeColor={color}
                  onChangeColor={setColor}
                  layerColors={currentIcon.colors || []}
                  onChangeLayerColor={(orig, upd) =>
                    setLayerOverrides((prev) => ({ ...prev, [orig]: upd }))
                  }
                />
              )}

              {activeTab === 'transforms' && (
                <TransformControls
                  rotation={rotation}
                  flipH={flipH}
                  flipV={flipV}
                  scale={scale}
                  padding={padding}
                  onUpdateTransform={(up) => {
                    if (up.rotation !== undefined) setRotation(up.rotation);
                    if (up.flipH !== undefined) setFlipH(up.flipH);
                    if (up.flipV !== undefined) setFlipV(up.flipV);
                    if (up.scale !== undefined) setScale(up.scale);
                    if (up.padding !== undefined) setPadding(up.padding);
                  }}
                  onReset={() => {
                    setRotation(0);
                    setFlipH(false);
                    setFlipV(false);
                    setScale(1);
                    setPadding(16);
                  }}
                />
              )}

              {activeTab === 'badge' && (
                <ShapeBadgeControls
                  shape={shape}
                  badgeColor={badgeColor}
                  badgeOpacity={badgeOpacity}
                  onUpdateBadge={(up) => {
                    if (up.shape !== undefined) setShape(up.shape);
                    if (up.badgeColor !== undefined) setBadgeColor(up.badgeColor);
                    if (up.badgeOpacity !== undefined) setBadgeOpacity(up.badgeOpacity);
                  }}
                />
              )}
            </div>

            {/* Export Toolbar */}
            <div className="flex flex-col gap-3 pt-2 border-t border-subpage-surface-container">
              <Button
                variant="primary"
                size="lg"
                onClick={handleDownloadSvg}
                icon={Download}
                className="w-full"
              >
                Download Customized SVG
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="glass"
                  size="md"
                  onClick={handleCopySvg}
                  icon={hasCopied ? Check : Copy}
                  className="flex-1"
                >
                  {hasCopied ? 'Copied' : 'Copy SVG'}
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => addIcon(currentIcon)}
                  icon={FolderPlus}
                  className="flex-1"
                >
                  Save to Collection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconEditorPage;
