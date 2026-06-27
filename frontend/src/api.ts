import axios from 'axios';

// SMART BASE URL:
// 1. First, check if Vercel set an environment variable
// 2. If not, use the Render production URL
// 3. If running locally, use localhost
const baseURL = import.meta.env.VITE_API_URL || 'https://task-management-f0f0.onrender.com/api';

const api = axios.create({
  baseURL: baseURL,
});

// Automatic Security System
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
