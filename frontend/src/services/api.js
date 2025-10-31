import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout')
};

export const incidentAPI = {
  create: (data) => API.post('/incidents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => API.get('/incidents', { params }),
  getById: (id) => API.get(`/incidents/${id}`),
  update: (id, data) => API.put(`/incidents/${id}`, data),
  delete: (id) => API.delete(`/incidents/${id}`),
  bulkUpdate: (data) => API.post('/incidents/bulk-update', data),
  getAnalytics: () => API.get('/incidents/analytics')
};

export const userAPI = {
  getAll: () => API.get('/users'),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`)
};

export const auditAPI = {
  getLogs: (params) => API.get('/audit', { params })
};

export default API;
