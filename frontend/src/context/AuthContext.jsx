import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';
import { DEMO_USERS } from '../utils/demoConfig';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const { addToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      if (import.meta.env.MODE === 'test') {
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('quickcart_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res?.data) {
            setUser(res.data);
          }
        } catch (err) {
          localStorage.removeItem('quickcart_token');
          setUser(null);
        }
      } else {
        // Auto-login as demo customer if fresh session to make exploration effortless
        try {
          const demoRes = await authApi.login({
            email: DEMO_USERS.customer.email,
            password: DEMO_USERS.customer.password,
          });
          if (demoRes?.data) {
            localStorage.setItem('quickcart_token', demoRes.data.token);
            setUser({
              id: demoRes.data.id,
              fullName: demoRes.data.fullName,
              email: demoRes.data.email,
              phone: demoRes.data.phone,
              avatarUrl: demoRes.data.avatarUrl,
              roles: demoRes.data.roles,
            });
          }
        } catch (e) { console.error('Error:', e); }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res?.data) {
        localStorage.setItem('quickcart_token', res.data.token);
        const userData = {
          id: res.data.id,
          fullName: res.data.fullName,
          email: res.data.email,
          phone: res.data.phone,
          avatarUrl: res.data.avatarUrl,
          roles: res.data.roles,
        };
        setUser(userData);
        addToast(`Welcome back, ${res.data.fullName}!`, 'success');
        setAuthModalOpen(false);
        return userData;
      }
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      if (res?.data) {
        localStorage.setItem('quickcart_token', res.data.token);
        const userObj = {
          id: res.data.id,
          fullName: res.data.fullName,
          email: res.data.email,
          phone: res.data.phone,
          avatarUrl: res.data.avatarUrl,
          roles: res.data.roles,
        };
        setUser(userObj);
        addToast(`Account created! Welcome to QuickCart, ${res.data.fullName}`, 'success');
        setAuthModalOpen(false);
        return userObj;
      }
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('quickcart_token');
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  const switchDemoRole = async (roleName) => {
    try {
      let targetUser = DEMO_USERS.customer;

      if (roleName === 'ADMIN') {
        targetUser = DEMO_USERS.admin;
      } else if (roleName === 'DELIVERY') {
        targetUser = DEMO_USERS.driver;
      }

      await login(targetUser.email, targetUser.password);
      addToast(`Switched to ${roleName} mode`, 'info');
    } catch (err) {
      addToast('Failed to switch demo role', 'error');
    }
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isDeliveryPartner = user?.roles?.includes('ROLE_DELIVERY_PARTNER');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        isAdmin,
        isDeliveryPartner,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
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
