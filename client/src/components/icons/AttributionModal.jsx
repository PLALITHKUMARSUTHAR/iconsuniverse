import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Crown, ShieldAlert, Sparkles, Download } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';

const AttributionModal = ({ isOpen, onClose, icon, onConfirmDownload, format = 'svg', size = null }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  if (!icon) return null;

  const attributionSnippet = `<a href="https://iconsuniverse.com/icons/${icon.slug}" title="${icon.title} icons">Icons by IconsUniverse</a>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(attributionSnippet);
    setCopied(true);
    addToast('Attribution code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceed = () => {
    onConfirmDownload(format, size);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Free Download License Attribution" maxWidth="max-w-xl">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-landing-on-surface-variant leading-relaxed">
          You are downloading this icon under the <strong>IconsUniverse Free License</strong>. You must attribute the author by placing the link on your website, app footer, or project description.
        </p>

        {/* Copy Attribution Snippet Box */}
        <div className="p-4 rounded-2xl bg-landing-surface-container-low border border-landing-outline-variant/40 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-landing-on-surface-variant">
            <span>HTML Attribution Code</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-landing-primary hover:text-landing-vibrant-coral transition-colors flex items-center gap-1 font-extrabold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <code className="text-xs font-mono bg-white p-3 rounded-xl border border-landing-surface-container text-landing-on-surface break-all select-all">
            {attributionSnippet}
          </code>
        </div>

        {/* Pro Plan Teaser Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#001e52] to-[#00327d] text-white flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-energy-gradient p-0.5 shrink-0 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-heading">Want Attribution-Free Downloads?</h4>
              <p className="text-[11px] text-landing-primary-container">
                Upgrade to Pro for unlimited downloads without crediting.
              </p>
            </div>
          </div>
          <Link
            to="/pricing"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-energy-gradient text-white text-xs font-extrabold shadow-coral hover:scale-105 transition-transform shrink-0"
          >
            Go Pro
          </Link>
        </div>

        {/* Proceed Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-landing-surface-container">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleProceed} icon={Download}>
            Download Free Asset
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AttributionModal;
