import axios from 'axios';

const API_BASE_URL =
  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const getAuthToken = () => localStorage.getItem('authToken');
const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};


api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token available for request:', config.url);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(normalizeApiError(error));
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response success:', response.config.url);
    return response.data;
  },
  (error) => {
    const normalizedError = normalizeApiError(error);

    console.error('❌ Response error:', {
      url: error.config?.url,
      status: normalizedError.status,
      message: normalizedError.message
    });

    if (normalizedError.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/');
      
      if (!isAuthRoute) {
        console.log('🔴 401 on protected route, triggering logout');
        clearAuthData();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      } else {
        console.log('ℹ️ 401 on auth route, not triggering logout');
      }
    }

    return Promise.reject(normalizedError);
  }
);

function normalizeApiError(error) {
  if (axios.isCancel(error)) {
    return {
      message: 'Request cancelled',
      status: 0,
      cancelled: true
    };
  }

  if (error?.response) {
    return {
      message:
        error.response.data?.message ||
        error.response.data?.error ||
        'Request failed',
      status: error.response.status
    };
  }

  if (error?.request) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0
    };
  }

  return {
    message: error?.message || 'Unexpected error occurred',
    status: 0
  };
}

export default api;