import api from './api';

export const iconService = {
  // Get/search icons
  getIcons: async (params = {}) => {
    return await api.get('/icons', { params });
  },

  // Get icon by slug
  getIconBySlug: async (slug) => {
    return await api.get(`/icons/${slug}`);
  },

  // Download single icon
  downloadIcon: async (id, format = 'svg', size = 512) => {
    if (format === 'base64') {
      return await api.get(`/icons/${id}/download`, { params: { format, size } });
    }
    // Direct browser file download for SVG / PNG
    const token = localStorage.getItem('iu_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const downloadUrl = `${baseUrl}/icons/${id}/download?format=${format}&size=${size}${token ? `&token=${token}` : ''}`;
    window.open(downloadUrl, '_blank');
    return { success: true };
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
