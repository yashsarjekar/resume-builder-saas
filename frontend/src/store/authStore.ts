import { create } from 'zustand';
import { User, LoginData, SignupData } from '@/types/user';
import api from '@/lib/api';
import { trackSignup } from '@/lib/tracking';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,

  login: async (data: LoginData) => {
    set({ loading: true });
    try {
      const response = await api.post('/api/auth/login', data);
      console.log('Login response received:', { hasToken: !!response.data?.access_token });

      const { access_token } = response.data;

      if (!access_token) {
        console.error('No access token in login response:', response.data);
        throw new Error('No access token received from server');
      }

      localStorage.setItem('token', access_token);
      console.log('Token stored in localStorage');

      // Fetch user data with the token
      const userResponse = await api.get('/api/auth/me');
      console.log('User data fetched successfully');

      set({
        user: userResponse.data,
        token: access_token,
        isAuthenticated: true,
        loading: false
      });
    } catch (error) {
      console.error('Login error:', error);
      set({ loading: false });
      throw error;
    }
  },

  signup: async (data: SignupData) => {
    set({ loading: true });
    try {
      // Step 1: Create the user account
      await api.post('/api/auth/signup', data);
      console.log('✅ Signup successful, auto-logging in...');

      // Small delay to avoid rate limiting (backend has 5 req/min limit on auth endpoints)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Automatically log in with the same credentials
      // Backend signup doesn't return token, so we need to login separately
      const loginResponse = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { access_token } = loginResponse.data;

      if (!access_token) {
        throw new Error('No access token received from login');
      }

      localStorage.setItem('token', access_token);
      console.log('✅ Token stored');

      // Small delay to avoid rate limiting before fetching user data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Fetch user data with the token
      const userResponse = await api.get('/api/auth/me');
      console.log('✅ User data fetched');

      set({
        user: userResponse.data,
        token: access_token,
        isAuthenticated: true,
        loading: false
      });

      // Track successful signup conversion
      trackSignup(data.email);
      console.log('✅ Signup conversion tracked');
    } catch (error) {
      console.error('❌ Signup error:', error);
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    try {
      const response = await api.get('/api/auth/me');
      set({ user: response.data, token, isAuthenticated: true });
    } catch (error: any) {
      // Only clear token on 401 (truly unauthorized)
      // Don't clear on 403 (rate limit), network errors (CORS), or other temporary issues
      if (error.response?.status === 401) {
        console.error('[Auth] Token invalid (401), clearing auth state');
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      } else {
        // For other errors (403, network issues), keep the user logged in
        // The token is probably still valid, just hit a rate limit or CORS issue
        console.warn('[Auth] checkAuth failed but keeping auth state:', error.response?.status || 'network error');
        // Don't change auth state - keep user logged in
      }
    }
  },

  refreshUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await api.get('/api/auth/me');
      set({ user: response.data });
      console.log('[Auth] User data refreshed');
    } catch (error: any) {
      console.warn('[Auth] refreshUser failed:', error.response?.status || 'network error');
    }
  },
}));
