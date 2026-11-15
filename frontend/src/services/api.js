/**
 * Unified Axios API Service Layer
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Attach JWT Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ai_analyzer_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Handle global errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = error.response?.data || {
      success: false,
      message: error.message || 'Network connection failed. Please ensure the backend server is running.',
      errors: [error.message]
    };
    return Promise.reject(errorResponse);
  }
);

// ==========================================
// AUTHENTICATION & PROFILE APIs
// ==========================================
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data)
};

// ==========================================
// RESUME & RESUMEIQ APIs
// ==========================================
export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyze: (payload) => api.post('/resume/analyze', payload),
  getUserResumes: () => api.get('/resume'),
  getById: (id) => api.get(`/resume/${id}`),
  getReport: (id) => api.get(`/resume/${id}/report`),
  deleteResume: (id) => api.delete(`/resume/${id}`),
  getRoles: () => api.get('/roles')
};

// ==========================================
// TEXT ANALYZER APIs
// ==========================================
export const textAPI = {
  analyzeText: (data) => {
    if (data instanceof FormData) {
      return api.post('/text/analyze', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/text/analyze', data);
  }
};

// ==========================================
// IMAGE ANALYZER APIs
// ==========================================
export const imageAPI = {
  analyzeImage: (formData) => api.post('/image/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// ==========================================
// CODE ANALYZER APIs
// ==========================================
export const codeAPI = {
  analyzeCode: (data) => {
    if (data instanceof FormData) {
      return api.post('/code/analyze', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/code/analyze', data);
  }
};

// ==========================================
// DATA ANALYZER APIs
// ==========================================
export const dataAPI = {
  analyzeData: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.post('/data/analyze', formDataOrJson, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/data/analyze', formDataOrJson);
  }
};

// ==========================================
// GENERAL AI ANALYZER APIs
// ==========================================
export const generalAPI = {
  chat: (payload) => api.post('/general/chat', payload)
};

// ==========================================
// HISTORY APIs
// ==========================================
export const historyAPI = {
  getAll: (params) => api.get('/history', { params }),
  getById: (id) => api.get(`/history/${id}`),
  deleteItem: (id) => api.delete(`/history/${id}`)
};

export default api;

