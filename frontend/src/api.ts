import axios from 'axios';

// Create a central connection pipe exactly matching our Backend server port!
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatic Security System
// Intercepts every single outgoing request and attaches the User's JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
