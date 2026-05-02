import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Notes
export const notesAPI = {
  create: (formData) => API.post('/notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => API.get('/notes', { params }),
  getById: (id) => API.get(`/notes/${id}`),
  update: (id, data) => API.put(`/notes/${id}`, data),
  delete: (id) => API.delete(`/notes/${id}`),
  download: (id) => API.post(`/notes/${id}/download`),
  rate: (id, rating) => API.post(`/notes/${id}/rate`, { rating }),
  report: (id, data) => API.post(`/notes/${id}/report`, data),
  bookmark: (id) => API.post(`/notes/${id}/bookmark`),
  getMyNotes: () => API.get('/notes/my-notes'),
};

// Admin
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  updateRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
  getAllNotes: (params) => API.get('/admin/notes', { params }),
  deleteNote: (id) => API.delete(`/admin/notes/${id}`),
  getReports: (params) => API.get('/admin/reports', { params }),
  resolveReport: (id, status) => API.put(`/admin/reports/${id}`, { status }),
};

export default API;
