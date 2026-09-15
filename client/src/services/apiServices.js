import api from './api';
import { downloadSingleIcon } from '../utils/downloadHelper';

export const iconService = {
  // Get/search icons
  getIcons: async (params = {}) => {
    return await api.get('/icons', { params });
  },

  // Get icon by slug
  getIconBySlug: async (slug) => {
    return await api.get(`/icons/${slug}`);
  },

  // Download single icon directly as .svg or .png (never a zip)
  downloadIcon: async (iconOrId, format = 'svg', size = 512, customOptions = null) => {
    const iconObj = typeof iconOrId === 'object' && iconOrId !== null
      ? iconOrId
      : { _id: iconOrId, slug: iconOrId };
    return await downloadSingleIcon({
      icon: iconObj,
      format,
      size,
      customOptions,
    });
  },

  // Upload new icon (Contributor/Admin)
  createIcon: async (formData) => {
    return await api.post('/icons', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete icon
  deleteIcon: async (id) => {
    return await api.delete(`/icons/${id}`);
  },
};

export const packService = {
  getPacks: async (params = {}) => {
    return await api.get('/packs', { params });
  },

  getPackBySlug: async (slug) => {
    return await api.get(`/packs/${slug}`);
  },

  downloadPack: async (id) => {
    const token = localStorage.getItem('iu_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const downloadUrl = `${baseUrl}/packs/${id}/download${token ? `?token=${token}` : ''}`;
    window.open(downloadUrl, '_blank');
    return { success: true };
  },

  createPack: async (packData) => {
    return await api.post('/packs', packData);
  },
};

export const collectionService = {
  getCollections: async () => {
    return await api.get('/collections');
  },

  getCollectionById: async (id) => {
    return await api.get(`/collections/${id}`);
  },

  createCollection: async (name, isPublic = false) => {
    return await api.post('/collections', { name, isPublic });
  },

  toggleIconInCollection: async (collectionId, iconId, action = 'add') => {
    return await api.post(`/collections/${collectionId}/icons`, { iconId, action });
  },

  bulkDownload: async (collectionId) => {
    const token = localStorage.getItem('iu_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    window.open(`${baseUrl}/collections/${collectionId}/bulk-download?token=${token}`, '_blank');
  },

  updateRecolor: async (collectionId, customPalette) => {
    return await api.put(`/collections/${collectionId}/recolor`, { customPalette });
  },
};

export const driveService = {
  triggerSync: async (folderId) => {
    return await api.post('/drive/sync', { folderId });
  },

  getStatus: async () => {
    return await api.get('/drive/status');
  },

  previewFolder: async (folderId) => {
    return await api.get('/drive/preview', { params: { folderId } });
  },
};
