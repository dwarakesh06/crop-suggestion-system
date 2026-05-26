import axios from 'axios';

// Use VITE_API_URL env variable in production, fallback to '/api' for local proxy
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Automatically inject JWT token into requests if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
