import api from './api';

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
