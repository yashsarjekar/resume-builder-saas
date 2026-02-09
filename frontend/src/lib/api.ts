import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Request to ${config.url} - Token attached: ${token.substring(0, 20)}...`);
    } else {
      console.log(`[API] Request to ${config.url} - No token found`);
    }
  }
  return config;
});

// Handle 401 and 403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (typeof window !== 'undefined') {
      if (status === 401) {
        console.error('[API] 401 Unauthorized - Clearing token and redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('[API] 403 Forbidden - Token might be invalid or expired');
        console.error('[API] Error details:', error.response?.data);
        // Check if token exists
        const hasToken = !!localStorage.getItem('token');
        console.error('[API] Has token in localStorage:', hasToken);
      } else if (error.response) {
        console.error(`[API] Error ${status}:`, error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
