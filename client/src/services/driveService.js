import api from './api';

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
