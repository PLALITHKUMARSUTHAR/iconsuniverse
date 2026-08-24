import React, { useState } from 'react';
import { Upload, Plus, CheckCircle, Clock, XCircle, BarChart3, Layers, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import { iconService } from '../services/iconService';
import { useToast } from '../context/ToastContext';

const ContributorDashboard = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('technology-devices');
  const [style, setStyle] = useState('outline');
  const [tags, setTags] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [svgFile, setSvgFile] = useState(null);
  const [previewSvg, setPreviewSvg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { addToast } = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSvgFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.svg$/i, '').replace(/[-_]+/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewSvg(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!svgFile || !title) {
      addToast('Please provide an SVG file and title', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('svgFile', svgFile);
      formData.append('title', title);
      formData.append('categoryId', '64f1a2b3c4d5e6f7g8h9i0j1'); // default ID
      formData.append('style', style);
      formData.append('tags', tags);
      formData.append('isPremium', isPremium);

      await iconService.createIcon(formData);
      addToast('Icon uploaded successfully! Sent to moderation queue.', 'success');
      setTitle('');
      setTags('');
      setSvgFile(null);
      setPreviewSvg('');
    } catch (err) {
      addToast('Upload Error: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="pb-6 border-b border-subpage-outline-variant/20">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-subpage-on-surface tracking-tight">
          Contributor Studio & Portfolio
        </h1>
        <p className="text-xs text-subpage-on-surface-variant mt-1">
          Upload vector assets and packs, monetize your artwork, and track global download analytics.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-subpage bg-white/90 border border-white/80 shadow-glass">
          <span className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
            Total Submissions
          </span>
          <span className="text-3xl font-extrabold font-heading text-subpage-primary">24 Assets</span>
        </div>

        <div className="p-6 rounded-3xl glass-subpage bg-white/90 border border-white/80 shadow-glass">
          <span className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
            Total Downloads
          </span>
          <span className="text-3xl font-extrabold font-heading text-landing-vibrant-coral">1,840</span>
        </div>

        <div className="p-6 rounded-3xl glass-subpage bg-white/90 border border-white/80 shadow-glass">
          <span className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
            Estimated Earnings
          </span>
          <span className="text-3xl font-extrabold font-heading text-emerald-600">₹3,450</span>
        </div>
      </div>

      {/* Upload New Asset Form */}
      <div className="p-8 sm:p-10 rounded-4xl glass-subpage bg-white/95 border border-white/80 shadow-2xl">
        <h2 className="text-xl font-bold font-heading text-subpage-primary mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-landing-vibrant-coral" />
          <span>Upload New Vector Asset</span>
        </h2>

        <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Drag & Drop Dropzone */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-8 border-2 border-dashed border-subpage-outline-variant/40 rounded-3xl bg-subpage-surface-container-low hover:bg-white hover:border-subpage-primary transition-all text-center">
            {previewSvg ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-28 h-28 flex items-center justify-center text-subpage-primary [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
                <span className="text-xs font-mono font-bold text-subpage-primary">{svgFile?.name}</span>
                <label className="cursor-pointer text-xs font-bold text-landing-vibrant-coral hover:underline">
                  Change File
                  <input type="file" accept=".svg" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-subpage-primary/10 flex items-center justify-center text-subpage-primary">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-subpage-on-surface">Click to select SVG file</span>
                  <span className="text-xs text-subpage-on-surface-variant mt-0.5">Maximum file size 10MB</span>
                </div>
                <input type="file" accept=".svg" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Right: Metadata Inputs */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
                Asset Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shopping Cart Modern Outline"
                required
                className="w-full bg-subpage-surface-container-low px-4 py-2.5 rounded-2xl text-sm font-medium border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-subpage-surface-container-low px-3 py-2 rounded-2xl text-xs font-bold border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
                >
                  <option value="outline">Outline</option>
                  <option value="filled">Filled</option>
                  <option value="color">Color</option>
                  <option value="flat">Flat</option>
                  <option value="gradient">Gradient</option>
                  <option value="hand-drawn">Hand Drawn</option>
                  <option value="3d">3D Isometric</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-subpage-surface-container-low px-3 py-2 rounded-2xl text-xs font-bold border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
                >
                  <option value="shopping-ecommerce">Shopping & E-Commerce</option>
                  <option value="technology-devices">Technology & Devices</option>
                  <option value="finance-banking">Finance & Banking</option>
                  <option value="ui-interface">UI & Interface</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
                Search Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. cart, store, shop, ecommerce, checkout"
                className="w-full bg-subpage-surface-container-low px-4 py-2.5 rounded-2xl text-sm font-medium border border-subpage-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-subpage-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPremium"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-4 h-4 rounded text-subpage-primary focus:ring-subpage-primary"
              />
              <label htmlFor="isPremium" className="text-xs font-bold text-subpage-on-surface">
                Designate as Pro Exclusive Asset
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isUploading}
              className="mt-2"
            >
              Submit Asset for Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributorDashboard;
