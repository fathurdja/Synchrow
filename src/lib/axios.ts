import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // important for Sanctum CSRF if we were using cookie auth, though we are using tokens here
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    // We will get the token from localStorage (managed by Zustand usually)
    // To avoid circular dependency with Zustand, we can read localStorage directly
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (e) {
          console.error("Error parsing auth storage in axios interceptor");
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
