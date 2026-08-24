import React, { useState } from 'react';
import { X, Trash2, Download, Palette, Code, Sparkles, FileArchive, Layers } from 'lucide-react';
import { useCollections } from '../../context/CollectionsContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import BulkDownloadModal from './BulkDownloadModal';

const CollectionDrawer = () => {
  const {
    collectionIcons,
    isDrawerOpen,
    closeDrawer,
    removeIcon,
    clearCollection,
    activeCollectionName,
  } = useCollections();

  const [isBulkDownloadModalOpen, setIsBulkDownloadModalOpen] = useState(false);

  if (!isDrawerOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#001e52]/40 backdrop-blur-md transition-opacity animate-fade-in"
          onClick={closeDrawer}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-white/80 p-6 flex flex-col justify-between animate-slide-left">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-landing-surface-container">
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-landing-primary">
                    {activeCollectionName}
                  </h3>
                  <p className="text-xs text-landing-on-surface-variant">
                    {collectionIcons.length} icon{collectionIcons.length !== 1 ? 's' : ''} saved (Daily limit: 100/day)
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {collectionIcons.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCollection}
                      className="p-1.5 rounded-lg text-landing-on-surface-variant hover:text-landing-error hover:bg-rose-50 transition-colors"
                      title="Clear collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="p-1.5 rounded-lg text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Saved Icons Grid */}
              <div className="overflow-y-auto max-h-[calc(100vh-240px)] pr-1 my-4">
                {collectionIcons.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-landing-surface-container-low flex items-center justify-center mx-auto mb-3 text-landing-on-surface-variant">
                      <Layers className="w-6 h-6 opacity-50" />
                    </div>
                    <h4 className="font-bold text-sm text-landing-on-surface mb-1">Your collection is empty</h4>
                    <p className="text-xs text-landing-on-surface-variant leading-relaxed">
                      Hover over any icon and click <strong>Collect</strong> to organize and bulk download up to 100 icons per day.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5">
                    {collectionIcons.map((icon) => (
                      <div
                        key={icon._id || icon.slug}
                        className="group relative p-2.5 rounded-xl bg-white border border-landing-surface-container shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center"
                      >
                        <button
                          type="button"
                          onClick={() => removeIcon(icon._id || icon.slug)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-600"
                          title="Remove"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>

                        <div
                          className="w-9 h-9 flex items-center justify-center text-landing-primary [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: icon.svgContent || `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>` }}
                        />
                        <span className="text-[9px] font-bold text-landing-on-surface truncate w-full text-center mt-1">
                          {icon.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Primary Bulk Download Button */}
            {collectionIcons.length > 0 && (
              <div className="pt-4 border-t border-landing-surface-container">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsBulkDownloadModalOpen(true)}
                  icon={FileArchive}
                  className="w-full text-xs sm:text-sm"
                >
                  Bulk Download & Edit ({collectionIcons.length} Icons)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Download & Customization Modal */}
      {isBulkDownloadModalOpen && (
        <BulkDownloadModal
          isOpen={isBulkDownloadModalOpen}
          onClose={() => setIsBulkDownloadModalOpen(false)}
        />
      )}
    </>
  );
};

export default CollectionDrawer;
