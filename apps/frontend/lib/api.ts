import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

// Regular API instance for user routes
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Separate API instance for admin routes
export const strapiApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to get token from cookies
const getToken = () => {
  if (typeof document === 'undefined') return null;
  
  // Try to get either userToken or clientUserToken
  const userToken = document.cookie.split('userToken=')[1]?.split(';')[0];
  const clientUserToken = document.cookie.split('clientUserToken=')[1]?.split(';')[0];
  const adminToken = document.cookie.split('adminToken=')[1]?.split(';')[0];
  
  return adminToken || userToken || clientUserToken;
};

// Add request interceptor to add token for regular API
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add request interceptor for admin API
strapiApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling - regular API
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Only redirect if we're in the browser
      if (typeof window !== 'undefined') {
        console.warn('Session expired - redirecting to login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling - admin API
strapiApi.interceptors.response.use(
  response => response,
  error => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        config: error.config,
        response: error.response?.data
      })
    }
    
    return Promise.reject(error)
  }
);

// Add request interceptor for common headers
strapiApi.interceptors.request.use(
  config => {
    // Add any common headers or request processing here
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Helper function for API requests with proper error handling
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const token = getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include',
    });
    
    // Check for HTML response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Server returned HTML instead of JSON');
    }
    
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized - Please log in');
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('API request failed:', error);
    throw error;
  }
} 