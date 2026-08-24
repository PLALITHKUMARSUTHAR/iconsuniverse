import React, { useState } from 'react';
import { Palette, RotateCw, Shield, Download, Copy, Check } from 'lucide-react';
import IconEditorCanvas from '../editor/IconEditorCanvas';
import ColorPalettePicker from '../editor/ColorPalettePicker';
import TransformControls from '../editor/TransformControls';
import ShapeBadgeControls from '../editor/ShapeBadgeControls';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';

const sampleIcons = [
  {
    title: 'Rocket',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  },
  {
    title: 'Cart',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  },
  {
    title: 'Shield',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  },
  {
    title: 'CPU',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3"/></svg>`,
  },
];

const LiveEditorTeaser = () => {
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('colors');
  const [color, setColor] = useState('#00327d');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [scale, setScale] = useState(1);
  const [padding, setPadding] = useState(12);
  const [shape, setShape] = useState('rounded');
  const [badgeColor, setBadgeColor] = useState('#faf8ff');
  const [badgeOpacity, setBadgeOpacity] = useState(100);
  const [hasCopied, setHasCopied] = useState(false);

  const { addToast } = useToast();
  const current = sampleIcons[selectedIconIndex];

  const handleDownload = () => {
    let finalSvg = current.svg.replace(/currentColor/gi, color);
    const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${current.title.toLowerCase()}-edited.svg`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded customized SVG!', 'success');
  };

  const handleCopy = () => {
    let finalSvg = current.svg.replace(/currentColor/gi, color);
    navigator.clipboard.writeText(finalSvg);
    setHasCopied(true);
    addToast('SVG markup copied!', 'success');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="p-6 sm:p-8 rounded-4xl glass-landing bg-white/90 border border-white/80 shadow-md max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-landing-surface-container mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-landing-primary tracking-tight">
                Live In-Browser Icon Editor
              </h2>
              <p className="text-xs text-landing-on-surface-variant mt-0.5">
                Recolor, rotate, flip, and customize shapes in real-time.
              </p>
            </div>

            {/* Icon Picker Chips */}
            <div className="flex items-center gap-1.5">
              {sampleIcons.map((item, idx) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setSelectedIconIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedIconIndex === idx
                      ? 'bg-landing-primary text-white shadow-sm'
                      : 'bg-landing-surface-container-low text-landing-on-surface hover:bg-landing-surface-container'
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5"
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                  />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Live Canvas Preview */}
            <div className="md:col-span-6 flex flex-col items-center">
              <IconEditorCanvas
                rawSvg={current.svg}
                color={color}
                rotation={rotation}
                flipH={flipH}
                flipV={flipV}
                scale={scale}
                padding={padding}
                shape={shape}
                badgeColor={badgeColor}
                badgeOpacity={badgeOpacity}
                previewSize={220}
              />
            </div>

            {/* Right: Tabbed Controls & Actions */}
            <div className="md:col-span-6 flex flex-col gap-3">
              {/* Tabs */}
              <div className="flex p-1 rounded-2xl bg-landing-surface-container-low border border-landing-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setActiveTab('colors')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'colors' ? 'bg-white shadow-sm text-landing-primary' : 'text-landing-on-surface-variant'
                  }`}
                >
                  Palette
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('transforms')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'transforms' ? 'bg-white shadow-sm text-landing-primary' : 'text-landing-on-surface-variant'
                  }`}
                >
                  Transforms
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('badge')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'badge' ? 'bg-white shadow-sm text-landing-primary' : 'text-landing-on-surface-variant'
                  }`}
                >
                  Backdrop
                </button>
              </div>

              {/* Tab Panel */}
              <div className="p-3.5 rounded-2xl bg-white border border-landing-surface-container min-h-[190px]">
                {activeTab === 'colors' && (
                  <ColorPalettePicker activeColor={color} onChangeColor={setColor} />
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
                      setPadding(12);
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="primary" size="md" onClick={handleDownload} icon={Download} className="flex-1">
                  Download SVG
                </Button>
                <Button variant="glass" size="md" onClick={handleCopy} icon={hasCopied ? Check : Copy}>
                  {hasCopied ? 'Copied' : 'Copy SVG'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveEditorTeaser;
