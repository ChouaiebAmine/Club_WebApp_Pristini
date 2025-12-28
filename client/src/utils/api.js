import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// authenticaion API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// clubs API
export const clubsAPI = {
  getAll: (params) => api.get('/clubs', { params }),
  getById: (id) => api.get(`/clubs/${id}`),
  create: (data) => api.post('/clubs', data),
  update: (id, data) => api.put(`/clubs/${id}`, data),
  delete: (id) => api.delete(`/clubs/${id}`),

  join: (clubId) => api.post(`/clubs/${clubId}/join`),
  leave: (clubId) => api.post(`/clubs/${clubId}/leave`),
};
export const membersAPI = {
  getByClub: (clubId) => api.get(`/members/club/${clubId}`),
  updateRole: (clubId, memberId, role) =>
    api.put(`/clubs/${clubId}/members/${memberId}/role`, { role }),
};
//events API
export const eventsAPI = {
  getByClub: (clubId) => api.get(`/events/club/${clubId}`),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  register: (id) => api.post(`/events/${id}/register`),
  checkin: (id) => api.post(`/events/${id}/checkin`),
  cancel: (id) => api.post(`/events/${id}/cancel`),
};

export default api;
