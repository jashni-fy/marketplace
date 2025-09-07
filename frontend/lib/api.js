import axios from 'axios';
import { tokenService } from './tokenService';

// All requests go through Nginx proxy -> /api
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if available
api.interceptors.request.use(
    (config) => {
      const token = tokenService.getToken();
      if (token && !tokenService.isTokenExpired()) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

// Handle unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        tokenService.clearAuthData();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
);

export const apiService = {
  // Authentication
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.delete('/auth/logout'),
  },

  // Users
  users: {
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    uploadAvatar: (id, file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post(`/users/${id}/upload_avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  // Profiles
  profiles: {
    me: () => api.get('/profiles/me'),
    serviceCategories: () => api.get('/profiles/service_categories'),
    getById: (id) => api.get(`/profiles/${id}`),
    create: (data) => api.post('/profiles', data),
    update: (id, data) => api.put(`/profiles/${id}`, data),
    delete: (id) => api.delete(`/profiles/${id}`),
  },

  // Services
  services: {
    getAll: (params) => api.get('/services', { params }),
    getById: (id) => api.get(`/services/${id}`),
    create: (data) => api.post('/services', data),
    update: (id, data) => api.put(`/services/${id}`, data),
    delete: (id) => api.delete(`/services/${id}`),
    search: (params) => api.get('/services/search', { params }),
    images: {
      list: (serviceId) => api.get(`/services/${serviceId}/images`),
      upload: (serviceId, file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post(`/services/${serviceId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
      reorder: (serviceId, orderData) =>
          api.post(`/services/${serviceId}/images/reorder`, orderData),
      bulkUpload: (serviceId, files) => {
        const formData = new FormData();
        files.forEach((f) => formData.append('images[]', f));
        return api.post(`/services/${serviceId}/images/bulk_upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
      setPrimary: (serviceId, imageId) =>
          api.post(`/services/${serviceId}/images/${imageId}/set_primary`),
      delete: (serviceId, imageId) =>
          api.delete(`/services/${serviceId}/images/${imageId}`),
    },
  },

  // Vendors
  vendors: {
    getAll: (params) => api.get('/vendors', { params }),
    getById: (id) => api.get(`/vendors/${id}`),
    getServices: (id) => api.get(`/vendors/${id}/services`),
    getAvailability: (id, params) =>
        api.get(`/vendors/${id}/availability`, { params }),
    getPortfolio: (id, params) => api.get(`/vendors/${id}/portfolio`, { params }),
    getReviews: (id, params) => api.get(`/vendors/${id}/reviews`, { params }),
    portfolioItems: (vendorId) =>
        api.get(`/vendors/${vendorId}/portfolio_items`),
  },

  // Portfolio Items
  portfolioItems: {
    getAll: (params) => api.get('/portfolio_items', { params }),
    getById: (id) => api.get(`/portfolio_items/${id}`),
    create: (data) => api.post('/portfolio_items', data),
    update: (id, data) => api.put(`/portfolio_items/${id}`, data),
    delete: (id) => api.delete(`/portfolio_items/${id}`),
    uploadImages: (id, files) => {
      const formData = new FormData();
      files.forEach((f) => formData.append('images[]', f));
      return api.post(`/portfolio_items/${id}/upload_images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    removeImage: (id, imageId) =>
        api.delete(`/portfolio_items/${id}/remove_image/${imageId}`),
    duplicate: (id) => api.post(`/portfolio_items/${id}/duplicate`),
    summary: () => api.get('/portfolio_items/summary'),
    reorder: (data) => api.post('/portfolio_items/reorder', data),
    setFeatured: (data) => api.patch('/portfolio_items/set_featured', data),
  },

  // Bookings
  bookings: {
    getAll: (params) => api.get('/bookings', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    create: (data) => api.post('/bookings', data),
    update: (id, data) => api.put(`/bookings/${id}`, data),
    delete: (id) => api.delete(`/bookings/${id}`),
    respond: (id, response) => api.post(`/bookings/${id}/respond`, response),
    messages: (id) => api.get(`/bookings/${id}/messages`),
    sendMessage: (id, message) =>
        api.post(`/bookings/${id}/send_message`, message),
  },

  // Availability Slots
  availabilitySlots: {
    getAll: (params) => api.get('/availability_slots', { params }),
    create: (data) => api.post('/availability_slots', data),
    update: (id, data) => api.put(`/availability_slots/${id}`, data),
    delete: (id) => api.delete(`/availability_slots/${id}`),
    bulkCreate: (data) => api.post('/availability_slots/bulk_create', data),
    checkConflicts: (params) =>
        api.get('/availability_slots/check_conflicts', { params }),
  },
};

export default api;