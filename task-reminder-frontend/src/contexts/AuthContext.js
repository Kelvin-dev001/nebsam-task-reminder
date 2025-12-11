import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Attach token to every request (once per app load)
  useEffect(() => {
    axios.interceptors.request.use(config => {
      const localToken = localStorage.getItem('token');
      if (localToken) {
        config.headers.Authorization = `Bearer ${localToken}`;
      }
      return config;
    });
  }, []);

  // LOGIN (all roles)
  const login = async (email, password) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('token', res.data.token);
    return res.data;
  };

  // ADMIN LOGIN (same endpoint, but we can keep for clarity)
  const adminLogin = async (email, password) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('token', res.data.token);
    return res.data;
  };

  // CHANGE PASSWORD
  const changePassword = async (oldPassword, newPassword) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/change-password`, { oldPassword, newPassword });
    // After changing password, clear the requiresPasswordChange flag locally
    const updatedUser = { ...user, requiresPasswordChange: false };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return res.data;
  };

  // LOGOUT (JWT: just clear local storage)
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, adminLogin, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};