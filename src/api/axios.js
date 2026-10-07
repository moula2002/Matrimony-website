import axios from 'axios';

const api = axios.create({
  baseURL: 'https://server.familiess.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const showOfflineToast = () => {
  if (typeof window !== 'undefined') {
    const existingToast = document.getElementById('no-internet-toast');
    if (!existingToast) {
      const toast = document.createElement('div');
      toast.id = 'no-internet-toast';
      toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl z-[9999] font-bold text-sm flex items-center gap-2 animate-bounce';
      toast.innerHTML = '⚠️ No Internet Connection or Server Unreachable';
      document.body.appendChild(toast);
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 5000);
    }
  }
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      showOfflineToast();
      const offlineError = new Error('No internet connection.');
      offlineError.isOffline = true;
      return Promise.reject(offlineError);
    }
    
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

// Response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.isOffline || (!error.response && error.message === 'Network Error')) {
      showOfflineToast();
    }
    
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
export const getPhotoUrl = (photoPath) => {
  let path = photoPath;
  if (path && typeof path === 'object' && path.url) {
    path = path.url;
  }
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('data:') || path.startsWith('http')) {
    return path;
  }
  let formattedPath = path;
  if (!formattedPath.includes('media_uploads')) {
    const cleanPath = formattedPath.startsWith('/') ? formattedPath.substring(1) : formattedPath;
    formattedPath = `/media_uploads/${cleanPath}`;
  }
  const baseURL = api.defaults.baseURL || 'https://server.familiess.com/api';
  const origin = baseURL.replace(/\/api$/, '');
  return `${origin}${formattedPath.startsWith('/') ? '' : '/'}${formattedPath}`;
};

export default api;
