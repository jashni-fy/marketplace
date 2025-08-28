import axios from 'axios';
import { tokenService } from './tokenService.js';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token && !tokenService.isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      tokenService.clearAuthData();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Authentication
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.delete('/auth/logout'),
    getCurrentUser: () => api.get('/users/profile'),
  },

  // Services
  services: {
    getAll: (params) => api.get('/services', { params }),
    getById: (id) => api.get(`/services/${id}`),
    create: (serviceData) => api.post('/services', serviceData),
    update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
    delete: (id) => api.delete(`/services/${id}`),
    search: (searchParams) => api.get('/services/search', { params: searchParams }),
  },

  // Vendors
  vendors: {
    getAll: (params) => api.get('/vendors', { params }),
    getById: (id) => api.get(`/vendors/${id}`),
    getServices: (id) => api.get(`/vendors/${id}/services`),
    getAvailability: (id, params) => api.get(`/vendors/${id}/availability`, { params }),
  },

  // Bookings
  bookings: {
    getAll: () => api.get('/bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    create: (bookingData) => api.post('/bookings', bookingData),
    update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
    respond: (id, response) => api.post(`/bookings/${id}/respond`, response),
  },

  // File uploads
  uploads: {
    uploadFile: (file, type = 'image') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },
};

export default api;