import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Download, Crown, ArrowLeft, FolderArchive } from 'lucide-react';
import { packService } from '../services/packService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import IconCard from '../components/icons/IconCard';
import { seedPacks, seedIcons } from '../data/seedData';

const PackDetailPage = () => {
  const { slug } = useParams();
  const [pack, setPack] = useState(null);
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();
  const { isPro } = useAuth();

  useEffect(() => {
    const fetchPack = async () => {
      setLoading(true);
      try {
        const res = await packService.getPackBySlug(slug);
        setPack(res.data.pack);
        setIcons(res.data.icons || []);
      } catch (err) {
        const match = seedPacks.find((p) => p.slug === slug) || seedPacks[0];
        setPack(match);
        setIcons(seedIcons.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };

    fetchPack();
  }, [slug]);

  if (loading || !pack) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-subpage-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleDownloadPack = () => {
    if (pack.isPremium && !isPro) {
      addToast('This pack requires an active Pro subscription to download.', 'error');
      return;
    }
    packService.downloadPack(pack._id || pack.slug);
    addToast(`Preparing ZIP bundle for "${pack.title}"...`, 'success');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Back Navigation */}
      <Link
        to="/search?type=packs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-subpage-on-surface-variant hover:text-subpage-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to icon sets</span>
      </Link>

      {/* Hero Pack Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#001e52] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-landing-electric-teal backdrop-blur-md">
              Icon Set
            </span>
            {pack.isPremium && (
              <span className="px-2.5 py-0.5 rounded-full bg-energy-gradient text-white text-[11px] font-extrabold flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3" />
                <span>PRO</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            {pack.title}
          </h1>

          <p className="text-xs sm:text-sm text-landing-primary-container leading-relaxed">
            {pack.description || 'A unified set of vector icons designed for seamless product consistency.'}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleDownloadPack}
              icon={FolderArchive}
            >
              Download Full Set (ZIP)
            </Button>
          </div>
        </div>

        {/* Cover Preview Image */}
        <div className="w-full md:w-64 h-40 rounded-2xl overflow-hidden shadow-lg border border-white/20 relative z-10 shrink-0">
          <img
            src={pack.coverImageUrl || pack.cover}
            alt={pack.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Pack Icons Grid (Smaller, Compact Boxes) */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-subpage-outline-variant/20">
          <h2 className="text-base font-bold font-heading text-subpage-on-surface">
            Included Icons ({icons.length})
          </h2>
          <span className="text-xs text-subpage-on-surface-variant font-medium">
            Click any icon to customize colors or download
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 sm:gap-3">
          {icons.map((icon) => (
            <IconCard key={icon._id || icon.slug} icon={icon} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackDetailPage;
