import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login/register page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        // Token expired or invalid - redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  resendVerificationCode: async (email) => {
    const response = await api.post('/auth/resend-code', { email });
    return response.data;
  },
};

// ==================== PROJECTS API ====================

export const projectsAPI = {
  list: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  get: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  update: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  delete: async (projectId) => {
    await api.delete(`/projects/${projectId}`);
  },

  export: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/export`);
    return response.data;
  },
};

// ==================== NODES API ====================

export const nodesAPI = {
  list: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/nodes`);
    return response.data;
  },

  get: async (projectId, nodeId) => {
    const response = await api.get(`/projects/${projectId}/nodes/${nodeId}`);
    return response.data;
  },

  create: async (projectId, nodeData) => {
    const response = await api.post(`/projects/${projectId}/nodes`, nodeData);
    return response.data;
  },

  bulkCreate: async (projectId, nodes) => {
    const response = await api.post(`/projects/${projectId}/nodes/bulk`, { nodes });
    return response.data;
  },

  update: async (projectId, nodeId, nodeData) => {
    const response = await api.put(`/projects/${projectId}/nodes/${nodeId}`, nodeData);
    return response.data;
  },

  delete: async (projectId, nodeId) => {
    await api.delete(`/projects/${projectId}/nodes/${nodeId}`);
  },
};

// ==================== TEAMS API ====================

export const teamsAPI = {
  list: async () => {
    const response = await api.get('/teams');
    return response.data;
  },

  get: async (teamId) => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  create: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  update: async (teamId, teamData) => {
    const response = await api.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  delete: async (teamId) => {
    await api.delete(`/teams/${teamId}`);
  },

  // Team Members
  listMembers: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },

  addMember: async (teamId, memberData) => {
    const response = await api.post(`/teams/${teamId}/members`, memberData);
    return response.data;
  },

  updateMemberRole: async (teamId, userId, roleData) => {
    const response = await api.put(`/teams/${teamId}/members/${userId}`, roleData);
    return response.data;
  },

  removeMember: async (teamId, userId) => {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },
};

export default api;
