import React, { createContext, useState } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const persistAuth = (userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', tokenStr);
    if (tokenStr) {
      api.defaults.headers.common.Authorization = `Bearer ${tokenStr}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  };

  // LOGIN (all roles)
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password }, { withCredentials: true });
    persistAuth(res.data.user, res.data.token);
    return res.data;
  };

  // ADMIN LOGIN (same endpoint)
  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/login', { email, password }, { withCredentials: true });
    persistAuth(res.data.user, res.data.token);
    return res.data;
  };

  // CHANGE PASSWORD
  const changePassword = async (oldPassword, newPassword) => {
    const res = await api.post('/auth/change-password', { oldPassword, newPassword }, { withCredentials: true });
    const updatedUser = { ...user, requiresPasswordChange: false };
    persistAuth(updatedUser, token);
    return res.data;
  };

  // LOGOUT
  const logout = () => {
    persistAuth(null, null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, adminLogin, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};