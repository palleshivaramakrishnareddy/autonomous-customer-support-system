import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if expired
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
};

// Tickets endpoints
export const ticketsApi = {
  getTickets: (params) => api.get('/api/tickets', { params }),
  getTicket: (id) => api.get(`/api/tickets/${id}`),
  createTicket: (data) => api.post('/api/tickets', data),
  updateTicket: (id, data) => api.put(`/api/tickets/${id}`, data),
  deleteTicket: (id) => api.delete(`/api/tickets/${id}`),
  addMessage: (ticketId, data) => api.post(`/api/tickets/${ticketId}/messages`, data),
  getMessages: (ticketId) => api.get(`/api/tickets/${ticketId}/messages`),
  submitFeedback: (ticketId, data) => api.post(`/api/tickets/${ticketId}/feedback`, data),
};

// Knowledge Base endpoints
export const knowledgeApi = {
  getArticles: (params) => api.get('/api/knowledge', { params }),
  getArticle: (id) => api.get(`/api/knowledge/${id}`),
  createArticle: (data) => api.post('/api/knowledge', data),
  updateArticle: (id, data) => api.put(`/api/knowledge/${id}`, data),
  deleteArticle: (id) => api.delete(`/api/knowledge/${id}`),
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: () => api.get('/api/dashboard/stats'),
  getTrends: () => api.get('/api/dashboard/ticket-trends'),
  getCategoryDist: () => api.get('/api/dashboard/category-distribution'),
  getPriorityDist: () => api.get('/api/dashboard/priority-distribution'),
  getStatusDist: () => api.get('/api/dashboard/status-distribution'),
  getSentimentDist: () => api.get('/api/dashboard/sentiment-distribution'),
};

// Admin endpoints
export const adminApi = {
  getUsers: (params) => api.get('/api/admin/users', { params }),
  updateUserRole: (userId, role) => api.put(`/api/admin/users/${userId}/role?role=${role}`),
  getAIDecisions: (limit = 50) => api.get(`/api/admin/ai-decisions?limit=${limit}`),
  getRecurringIssues: () => api.get('/api/admin/recurring-issues'),
};

// AI endpoints
export const aiApi = {
  analyzeTicket: (ticketId) => api.post(`/api/ai/analyze-ticket/${ticketId}`),
  generateResponse: (ticketId) => api.post(`/api/ai/generate-response/${ticketId}`),
  escalate: (ticketId, reason) => api.post(`/api/ai/escalate/${ticketId}?reason=${encodeURIComponent(reason || '')}`),
};

// Notifications endpoints
export const notificationsApi = {
  getNotifications: () => api.get('/api/notifications'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
};

// Feedback endpoints
export const feedbackApi = {
  getFeedbackList: () => api.get('/api/feedback'),
};

export default api;
