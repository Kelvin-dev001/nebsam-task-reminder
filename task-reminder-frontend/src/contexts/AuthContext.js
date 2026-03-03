import React, { createContext, useState } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Synchronize and persist user/token & api header
  const persistAuth = (userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);

    if (userObj) localStorage.setItem('user', JSON.stringify(userObj));
    else localStorage.removeItem('user');

    if (tokenStr) localStorage.setItem('token', tokenStr);
    else localStorage.removeItem('token');

    if (tokenStr) {
      api.defaults.headers.common.Authorization = `Bearer ${tokenStr}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  };

  // Universal login (staff+users)
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password }, { withCredentials: true });
    persistAuth(res.data.user, res.data.token);
    return res.data;
  };

  // Admin login
  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/login', { email, password }, { withCredentials: true });
    persistAuth(res.data.user, res.data.token);
    return res.data;
  };

  // CEO login: use dedicated env-based endpoint!
  const ceoLogin = async (email, password) => {
    const res = await api.post('/auth/ceo-login', { email, password }, { withCredentials: true });
    persistAuth(res.data.user, res.data.token);
    return res.data;
  };

  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    const res = await api.post(
      '/auth/change-password',
      { oldPassword, newPassword },
      { withCredentials: true }
    );
    const updatedUser = { ...user, requiresPasswordChange: false };
    persistAuth(updatedUser, token);
    return res.data;
  };

  // Logout
  const logout = () => {
    persistAuth(null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        adminLogin,
        ceoLogin,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
