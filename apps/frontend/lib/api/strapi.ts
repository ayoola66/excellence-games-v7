import axios from 'axios'
import { getClientAuthTokens, clearClientAuthTokens } from '@/lib/auth/clientTokenManager'

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export const strapiApi = axios.create({
  baseURL: strapiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor
strapiApi.interceptors.request.use(
  (config) => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // Get the auth token from cookies
      const { accessToken } = getClientAuthTokens()
      
      // If we have a token, add it to the request
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor
strapiApi.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Strapi API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url
      })

      // Handle authentication errors
      if (error.response.status === 401 && typeof window !== 'undefined') {
        // Clear tokens on auth error
        clearClientAuthTokens()
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Strapi API Error: No response received', {
        request: error.request,
        url: error.config?.url
      })
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Strapi API Error:', {
        message: error.message,
        url: error.config?.url
      })
    }
    return Promise.reject(error)
  }
) 