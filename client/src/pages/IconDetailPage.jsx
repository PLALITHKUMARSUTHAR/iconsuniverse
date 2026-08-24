import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Palette, Copy, Check, FolderPlus, Crown, ArrowLeft } from 'lucide-react';
import { iconService } from '../services/iconService';
import { useCollections } from '../context/CollectionsContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import IconEditorModal from '../components/editor/IconEditorModal';
import AttributionModal from '../components/icons/AttributionModal';
import FormatDownloadMenu from '../components/icons/FormatDownloadMenu';
import IconCard from '../components/icons/IconCard';
import { seedIcons } from '../data/seedData';

const IconDetailPage = () => {
  const { slug } = useParams();
  const [icon, setIcon] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAttributionOpen, setIsAttributionOpen] = useState(false);
  const [pendingFormat, setPendingFormat] = useState('svg');
  const [pendingSize, setPendingSize] = useState(512);
  const [hasCopiedSvg, setHasCopiedSvg] = useState(false);

  const { toggleIcon, isIconInCollection } = useCollections();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchIcon = async () => {
      setLoading(true);
      try {
        const res = await iconService.getIconBySlug(slug);
        setIcon(res.data.icon);
        setRelated(res.data.related || []);
      } catch (err) {
        const match = seedIcons.find((i) => i.slug === slug) || seedIcons[0];
        setIcon(match);
        setRelated(seedIcons.filter((i) => i.slug !== slug).slice(0, 8));
      } finally {
        setLoading(false);
      }
    };

    fetchIcon();
  }, [slug]);

  if (loading || !icon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-subpage-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSaved = isIconInCollection(icon._id || icon.slug);

  const handleCopySvg = () => {
    if (icon.svgContent) {
      navigator.clipboard.writeText(icon.svgContent);
      setHasCopiedSvg(true);
      addToast('SVG markup copied to clipboard!', 'success');
      setTimeout(() => setHasCopiedSvg(false), 2000);
    }
  };

  const handleConfirmDownload = (format = 'svg', size = 512) => {
    iconService.downloadIcon(icon._id, format, size);
    addToast(`Downloading ${icon.title} (${format.toUpperCase()})...`, 'success');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Back Navigation */}
      <Link
        to="/search"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-subpage-on-surface-variant hover:text-subpage-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search results</span>
      </Link>

      {/* Main Asset Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Vector Canvas */}
        <div className="lg:col-span-5 p-8 sm:p-10 rounded-3xl glass-subpage bg-white/90 border border-white/80 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-subpage-surface-container text-subpage-primary">
              {icon.style || 'outline'}
            </span>
            {icon.isPremium && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-energy-gradient text-white text-[10px] font-extrabold shadow-sm">
                <Crown className="w-3 h-3" />
                <span>PRO</span>
              </span>
            )}
          </div>

          <div
            className="w-36 h-36 sm:w-48 sm:h-48 my-4 flex items-center justify-center text-subpage-primary [&>svg]:w-full [&>svg]:h-full transition-transform hover:scale-105"
            dangerouslySetInnerHTML={{ __html: icon.svgContent || `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>` }}
          />

          <span className="text-[11px] font-bold text-subpage-on-surface-variant">
            Scalable Vector Format (SVG / PNG)
          </span>
        </div>

        {/* Right: Actions & Metadata */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-subpage-on-surface tracking-tight mb-1">
              {icon.title}
            </h1>
            <p className="text-xs text-subpage-on-surface-variant">
              Vector icon ready for app UI, web interfaces, and graphic design.
            </p>
          </div>

          {/* Primary Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl glass-subpage bg-white/80 border border-white/80 shadow-sm">
            <FormatDownloadMenu
              icon={icon}
              onDownload={handleConfirmDownload}
              onOpenAttribution={(format, size) => {
                setPendingFormat(format);
                setPendingSize(size);
                setIsAttributionOpen(true);
              }}
            />

            <Button
              variant="subpagePrimary"
              size="md"
              onClick={() => setIsEditorOpen(true)}
              icon={Palette}
            >
              Edit in Studio
            </Button>

            <Button
              variant="glass"
              size="md"
              onClick={handleCopySvg}
              icon={hasCopiedSvg ? Check : Copy}
            >
              {hasCopiedSvg ? 'Copied' : 'Copy SVG'}
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => toggleIcon(icon)}
              icon={FolderPlus}
            >
              {isSaved ? 'Saved' : 'Collect'}
            </Button>
          </div>

          {/* Tags */}
          {icon.tags && icon.tags.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-subpage-outline-variant/20 flex flex-col gap-2">
              <span className="text-[11px] text-subpage-on-surface-variant font-bold uppercase tracking-wider">
                Keywords & Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {icon.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${tag}`}
                    className="px-2.5 py-0.5 rounded-full bg-subpage-surface-container-low hover:bg-subpage-primary hover:text-white text-subpage-on-surface text-xs font-semibold transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Icons Section (Compact Grid) */}
      {related.length > 0 && (
        <div className="pt-6 border-t border-subpage-outline-variant/20">
          <h3 className="text-base font-bold font-heading text-subpage-on-surface mb-4">
            Related Vector Icons
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {related.map((rel) => (
              <IconCard key={rel._id || rel.slug} icon={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <IconEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          icon={icon}
        />
      )}

      {/* Attribution Modal */}
      {isAttributionOpen && (
        <AttributionModal
          isOpen={isAttributionOpen}
          onClose={() => setIsAttributionOpen(false)}
          icon={icon}
          format={pendingFormat}
          size={pendingSize}
          onConfirmDownload={handleConfirmDownload}
        />
      )}
    </div>
  );
};

export default IconDetailPage;
