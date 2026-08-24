import React from 'react';
import { FolderHeart, ChevronUp, Download, Sparkles } from 'lucide-react';
import { useCollections } from '../../context/CollectionsContext';

const FloatingCollectionTray = () => {
  const { collectionIcons, isDrawerOpen, openDrawer } = useCollections();

  if (collectionIcons.length === 0 || isDrawerOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce-in">
      <button
        type="button"
        onClick={openDrawer}
        className="glass-landing bg-white/95 hover:bg-white text-landing-primary px-6 py-3.5 rounded-full shadow-2xl hover:shadow-coral border border-white/80 transition-all transform hover:scale-105 flex items-center gap-3.5 group"
      >
        <div className="relative">
          <FolderHeart className="w-5 h-5 text-landing-vibrant-coral group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-energy-gradient text-white text-[10px] font-extrabold flex items-center justify-center">
            {collectionIcons.length}
          </span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-extrabold font-heading text-landing-on-surface">My Collection</span>
          <span className="text-[10px] text-landing-on-surface-variant -mt-0.5">
            {collectionIcons.length} icon{collectionIcons.length > 1 ? 's' : ''} ready for bulk export
          </span>
        </div>

        <div className="pl-2 border-l border-landing-surface-container flex items-center gap-1 text-landing-primary font-bold text-xs">
          <span>Open Tray</span>
          <ChevronUp className="w-4 h-4 text-landing-vibrant-coral" />
        </div>
      </button>
    </div>
  );
};

export default FloatingCollectionTray;
