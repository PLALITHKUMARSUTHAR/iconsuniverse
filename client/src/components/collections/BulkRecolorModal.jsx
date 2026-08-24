import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ColorPalettePicker from '../editor/ColorPalettePicker';
import { Palette, Sparkles, Check } from 'lucide-react';
import { useCollections } from '../../context/CollectionsContext';
import { useToast } from '../../context/ToastContext';

const BulkRecolorModal = ({ isOpen, onClose }) => {
  const [selectedColor, setSelectedColor] = useState('#00327d');
  const { collectionPalette, setCollectionPalette } = useCollections();
  const { addToast } = useToast();

  const handleApply = () => {
    setCollectionPalette([selectedColor]);
    addToast(`Applied ${selectedColor} to all icons in collection!`, 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Recolor Collection" maxWidth="max-w-md">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-landing-on-surface-variant leading-relaxed">
          Choose a unified color palette to apply across all vector icons in this collection simultaneously.
        </p>

        <ColorPalettePicker
          activeColor={selectedColor}
          onChangeColor={setSelectedColor}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-landing-surface-container">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply} icon={Check}>
            Apply to Collection
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkRecolorModal;
