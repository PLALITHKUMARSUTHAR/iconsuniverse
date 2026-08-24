import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { collectionService } from '../services/collectionService';

const CollectionsContext = createContext(null);

export const CollectionsProvider = ({ children }) => {
  const [collectionIcons, setCollectionIcons] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [activeCollectionName, setActiveCollectionName] = useState('My Quick Collection');
  const [collectionPalette, setCollectionPalette] = useState(['#00327d']);

  const { addToast } = useToast();
  const { user } = useAuth();

  // Load collection from localStorage on boot
  useEffect(() => {
    try {
      const saved = localStorage.getItem('iu_collection_icons');
      if (saved) {
        setCollectionIcons(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse local collection', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('iu_collection_icons', JSON.stringify(collectionIcons));
    } catch (e) {}
  }, [collectionIcons]);

  const addIcon = (icon) => {
    if (!icon) return;
    const exists = collectionIcons.some((i) => (i._id && i._id === icon._id) || i.slug === icon.slug);
    if (exists) {
      addToast(`"${icon.title}" is already in your collection.`, 'info');
      return;
    }

    setCollectionIcons((prev) => [...prev, icon]);
    addToast(`Added "${icon.title}" to collection!`, 'success');
  };

  const removeIcon = (iconIdOrSlug) => {
    setCollectionIcons((prev) =>
      prev.filter((i) => i._id !== iconIdOrSlug && i.slug !== iconIdOrSlug)
    );
    addToast('Removed icon from collection', 'info');
  };

  const isIconInCollection = (iconIdOrSlug) => {
    return collectionIcons.some(
      (i) => i._id === iconIdOrSlug || i.slug === iconIdOrSlug
    );
  };

  const toggleIcon = (icon) => {
    if (!icon) return;
    if (isIconInCollection(icon._id || icon.slug)) {
      removeIcon(icon._id || icon.slug);
    } else {
      addIcon(icon);
    }
  };

  const clearCollection = () => {
    setCollectionIcons([]);
    addToast('Collection cleared', 'info');
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <CollectionsContext.Provider
      value={{
        collectionIcons,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addIcon,
        removeIcon,
        toggleIcon,
        isIconInCollection,
        clearCollection,
        activeCollectionName,
        setActiveCollectionName,
        collectionPalette,
        setCollectionPalette,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
};

export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (!context) throw new Error('useCollections must be used within CollectionsProvider');
  return context;
};
