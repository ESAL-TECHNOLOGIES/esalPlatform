import axios from 'axios'
import { LoginCredentials, RegisterData, User } from './types'

const API_BASE_URL = typeof window !== 'undefined' && (window as any).__VITE_API_URL__ || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('esal_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('esal_token')
      localStorage.removeItem('esal_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post('/auth/refresh')
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile')
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/auth/profile', data)
    return response.data
  },

  requestApproval: async (role: 'investor' | 'hub'): Promise<void> => {
    await apiClient.post('/auth/request-approval', { role })
  },
}

export default apiClient
