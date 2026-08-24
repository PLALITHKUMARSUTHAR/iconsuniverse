import React, { useState } from 'react';
import { Download, Copy, Check, Sparkles, FolderPlus, Layers, RotateCw, Palette, Shield } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import IconEditorCanvas from './IconEditorCanvas';
import ColorPalettePicker from './ColorPalettePicker';
import TransformControls from './TransformControls';
import ShapeBadgeControls from './ShapeBadgeControls';
import { useToast } from '../../context/ToastContext';
import { useCollections } from '../../context/CollectionsContext';

const IconEditorModal = ({ isOpen, onClose, icon }) => {
  const [activeTab, setActiveTab] = useState('colors'); // 'colors' | 'transforms' | 'badge'
  const [color, setColor] = useState('#00327d');
  const [layerColorOverrides, setLayerColorOverrides] = useState({});
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [scale, setScale] = useState(1);
  const [padding, setPadding] = useState(0);
  const [shape, setShape] = useState('none');
  const [badgeColor, setBadgeColor] = useState('#FF5F52');
  const [badgeOpacity, setBadgeOpacity] = useState(100);
  const [hasCopied, setHasCopied] = useState(false);

  const { addToast } = useToast();
  const { toggleIcon, isIconInCollection } = useCollections();

  if (!icon) return null;

  const rawSvg = icon.svgContent || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;

  const handleUpdateTransform = (updates) => {
    if (updates.rotation !== undefined) setRotation(updates.rotation);
    if (updates.flipH !== undefined) setFlipH(updates.flipH);
    if (updates.flipV !== undefined) setFlipV(updates.flipV);
    if (updates.scale !== undefined) setScale(updates.scale);
    if (updates.padding !== undefined) setPadding(updates.padding);
  };

  const handleUpdateBadge = (updates) => {
    if (updates.shape !== undefined) setShape(updates.shape);
    if (updates.badgeColor !== undefined) setBadgeColor(updates.badgeColor);
    if (updates.badgeOpacity !== undefined) setBadgeOpacity(updates.badgeOpacity);
  };

  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setScale(1);
    setPadding(0);
    setShape('none');
    setColor('#00327d');
    setLayerColorOverrides({});
  };

  // Export customized SVG
  const handleDownloadCustomSvg = () => {
    let finalSvg = rawSvg;
    finalSvg = finalSvg.replace(/currentColor/gi, color);
    finalSvg = finalSvg.replace(/stroke="#[0-9a-fA-F]{3,6}"/gi, `stroke="${color}"`);

    const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.slug || 'custom-icon'}-edited.svg`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded customized SVG!', 'success');
  };

  // Copy SVG Code
  const handleCopySvg = () => {
    let finalSvg = rawSvg.replace(/currentColor/gi, color);
    navigator.clipboard.writeText(finalSvg);
    setHasCopied(true);
    addToast('SVG markup copied to clipboard!', 'success');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Vector Editor — ${icon.title}`} maxWidth="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <IconEditorCanvas
            rawSvg={rawSvg}
            color={color}
            layerColorOverrides={layerColorOverrides}
            rotation={rotation}
            flipH={flipH}
            flipV={flipV}
            scale={scale}
            padding={padding}
            shape={shape}
            badgeColor={badgeColor}
            badgeOpacity={badgeOpacity}
            previewSize={240}
          />

          <div className="flex items-center justify-between text-xs text-landing-on-surface-variant px-1">
            <span>Dimensions: 512 × 512px Vector</span>
            <span className="font-bold text-landing-primary">Live Real-time Preview</span>
          </div>
        </div>

        {/* Right: Controls & Tabs */}
        <div className="md:col-span-6 flex flex-col gap-4">
          {/* Tab Navigation */}
          <div className="flex p-1 rounded-2xl bg-landing-surface-container-low border border-landing-outline-variant/30">
            <button
              type="button"
              onClick={() => setActiveTab('colors')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'colors' ? 'bg-white shadow-sm text-landing-primary' : 'text-landing-on-surface-variant hover:text-landing-primary'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Palette</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transforms')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'transforms' ? 'bg-white shadow-sm text-landing-primary' : 'text-landing-on-surface-variant hover:text-landing-primary'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Transform</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('badge')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'badge' ? 'bg-white shadow-sm text-landing-primary' : 'text-landing-on-surface-variant hover:text-landing-primary'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Backdrop</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="p-4 rounded-3xl bg-landing-surface-container-lowest border border-landing-surface-container min-h-[220px]">
            {activeTab === 'colors' && (
              <ColorPalettePicker
                activeColor={color}
                onChangeColor={setColor}
                layerColors={icon.colors || []}
                onChangeLayerColor={(orig, updated) =>
                  setLayerColorOverrides((prev) => ({ ...prev, [orig]: updated }))
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
                onUpdateTransform={handleUpdateTransform}
                onReset={handleReset}
              />
            )}

            {activeTab === 'badge' && (
              <ShapeBadgeControls
                shape={shape}
                badgeColor={badgeColor}
                badgeOpacity={badgeOpacity}
                badgePadding={padding}
                onUpdateBadge={handleUpdateBadge}
              />
            )}
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-landing-surface-container">
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadCustomSvg}
              icon={Download}
              className="flex-1"
            >
              Download SVG
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={handleCopySvg}
              icon={hasCopied ? Check : Copy}
            >
              {hasCopied ? 'Copied' : 'Copy SVG'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleIcon(icon)}
              icon={FolderPlus}
            >
              {isIconInCollection(icon._id || icon.slug) ? 'Saved' : 'Collect'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default IconEditorModal;
