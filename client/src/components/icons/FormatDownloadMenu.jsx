import React, { useState } from 'react';
import { Download, ChevronDown, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const resolutions = [16, 24, 32, 64, 128, 256, 512];

const FormatDownloadMenu = ({ icon, onDownload, onOpenAttribution }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isPro } = useAuth();

  const handleSelectFormat = (format, size = null) => {
    setIsOpen(false);
    if (!isPro && !icon.isPremium) {
      // Prompt attribution modal for free downloads
      onOpenAttribution(format, size);
    } else {
      onDownload(format, size);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-full bg-energy-gradient text-white text-xs font-extrabold shadow-coral hover:scale-105 transition-transform flex items-center gap-1.5"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download</span>
        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 glass-dropdown rounded-3xl p-3 shadow-2xl z-50 animate-fade-in border border-white/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-landing-on-surface-variant px-2 mb-2">
            Vector Formats
          </p>

          <button
            type="button"
            onClick={() => handleSelectFormat('svg')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-landing-on-surface hover:bg-landing-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SVG Vector</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-extrabold uppercase">Scalable</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectFormat('eps')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-landing-on-surface hover:bg-landing-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>EPS Print Vector</span>
            </div>
            {!isPro && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
          </button>

          <div className="my-2 border-t border-landing-surface-container" />

          <p className="text-[10px] font-bold uppercase tracking-wider text-landing-on-surface-variant px-2 mb-1">
            PNG Resolutions
          </p>

          <div className="grid grid-cols-3 gap-1 px-1">
            {resolutions.map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => handleSelectFormat('png', res)}
                className="px-2 py-1.5 rounded-lg text-xs font-mono font-bold text-center bg-landing-surface-container-low hover:bg-landing-primary hover:text-white transition-colors"
              >
                {res}px
              </button>
            ))}
          </div>

          <div className="my-2 border-t border-landing-surface-container" />

          <button
            type="button"
            onClick={() => handleSelectFormat('base64')}
            className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-landing-on-surface-variant hover:bg-landing-surface-container-low"
          >
            Base64 Data URI
          </button>
        </div>
      )}
    </div>
  );
};

export default FormatDownloadMenu;
