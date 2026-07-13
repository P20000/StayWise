import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // If running in production (not on localhost/127.0.0.1), default to relative path
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.warn('[API] VITE_API_BASE_URL environment variable is not defined in production. Falling back to relative path "/api".');
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // Default 30-second timeout prevents silent hangs (e.g. during Cloudinary uploads)
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for centralized error handling and session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized or expired session gracefully
      console.warn('[AUTH] Session expired or unauthorized.');
    }

    // Translate opaque browser-level network failures into actionable messages.
    // "Network Error" (no error.response) means the request never reached the server
    // or the server closed the connection before sending response headers.
    if (!error.response && error.message === 'Network Error') {
      error.message =
        `[SERVER_UNREACHABLE] Cannot connect to the API at ${API_BASE_URL}. ` +
        'Please ensure the backend server is running (npm run dev in /server) ' +
        'and that your VITE_API_BASE_URL / CLOUDINARY credentials are correctly configured.';
    }

    if (error.code === 'ECONNABORTED') {
      error.message =
        '[REQUEST_TIMEOUT] The server took too long to respond (>30s). ' +
        'This may be caused by a slow Cloudinary image upload or an overloaded server.';
    }

    return Promise.reject(error);
  }
);

export default api;

