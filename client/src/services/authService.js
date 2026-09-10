import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token) {
      localStorage.setItem('iu_token', res.token);
    }
    return res;
  },

  signup: async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    if (res.token) {
      localStorage.setItem('iu_token', res.token);
    }
    return res;
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  logout: async () => {
    localStorage.removeItem('iu_token');
    return await api.post('/auth/logout');
  },

  googleAuth: async (payload) => {
    const res = await api.post('/auth/google', payload);
    if (res.token) {
      localStorage.setItem('iu_token', res.token);
    }
    return res;
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, password) => {
    const res = await api.post(`/auth/reset-password/${token}`, { password });
    if (res.token) {
      localStorage.setItem('iu_token', res.token);
    }
    return res;
  },

  updateProfile: async (data) => {
    return await api.put('/auth/profile', data);
  },
};
