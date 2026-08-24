import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load authenticated user on app boot
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('iu_token');
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.warn('[Auth] Token invalid or expired, clearing session.');
          localStorage.removeItem('iu_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.data.user);
    return res;
  };

  const signup = async (name, email, password) => {
    const res = await authService.signup(name, email, password);
    setUser(res.data.user);
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('iu_token');
  };

  const isPro = user && (user.plan === 'pro_monthly' || user.plan === 'pro_annual');
  const isAdmin = user && (user.role === 'admin' || user.role === 'editor');
  const isContributor = user && (user.role === 'contributor' || user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isPro,
        isAdmin,
        isContributor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
