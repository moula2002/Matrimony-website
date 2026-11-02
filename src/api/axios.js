import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return 'https://server.familiess.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
    try {
      const url = response.config?.url || '';
      if (typeof window !== 'undefined' && url.includes('/users/profile') && response.data && typeof response.data === 'object') {
        const storedFeatured = localStorage.getItem('featured_account');
        if (storedFeatured) {
          const parsed = JSON.parse(storedFeatured);
          const now = new Date();
          const validUntil = parsed.validUntil ? new Date(parsed.validUntil) : null;
          if (parsed.isActive && (!validUntil || validUntil > now)) {
            response.data.isFeatured = true;
            response.data.featuredAccount = parsed;
          } else if (validUntil && validUntil <= now) {
            localStorage.removeItem('featured_account');
          }
        }
      }
    } catch {
      // Ignore storage/json parse errors
    }
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
import maleAvatar from '../assets/male_avatar.png';
import femaleAvatar from '../assets/female_avatar.png';

export const getDefaultAvatar = (gender) => {
  if (!gender) return maleAvatar;
  const g = String(gender).toLowerCase();
  if (g === 'female' || g === 'f' || g === 'bride' || g === 'woman') {
    return femaleAvatar;
  }
  return maleAvatar;
};

export const handleImageError = (e, gender) => {
  if (e && e.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = getDefaultAvatar(gender);
  }
};

export const getPhotoUrl = (photoPath, gender) => {
  let path = photoPath;
  if (path && typeof path === 'object') {
    path = path.url || path.secure_url || path.path || path.imageUrl || path.image || path.src || path.photo || path.link || '';
  }
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return gender ? getDefaultAvatar(gender) : null;
  }
  if (path.startsWith('data:') || path.startsWith('http')) {
    return path;
  }
  let formattedPath = path.trim();
  if (!formattedPath.includes('media_uploads')) {
    const cleanPath = formattedPath.startsWith('/') ? formattedPath.substring(1) : formattedPath;
    formattedPath = `/media_uploads/${cleanPath}`;
  }
  const origin = (import.meta.env.VITE_IMAGE_SERVER_URL || 'https://server.familiess.com').replace(/\/$/, '');
  return `${origin}${formattedPath.startsWith('/') ? '' : '/'}${formattedPath}`;
};

export default api;

