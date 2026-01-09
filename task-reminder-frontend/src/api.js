import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g., https://nebsam-task-reminder.onrender.com
  withCredentials: true,
});

// Attach Authorization header from localStorage token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;