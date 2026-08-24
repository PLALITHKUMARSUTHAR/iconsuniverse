import api from './api';

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

  generateWebFont: async (collectionId) => {
    const token = localStorage.getItem('iu_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    window.open(`${baseUrl}/collections/${collectionId}/webfont?token=${token}`, '_blank');
  },

  updateRecolor: async (collectionId, customPalette) => {
    return await api.put(`/collections/${collectionId}/recolor`, { customPalette });
  },
};
