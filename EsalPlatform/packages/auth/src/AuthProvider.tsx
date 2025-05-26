import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { authApi } from './api'
import { AuthState, User, LoginCredentials, RegisterData } from './types'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('esal_token')
        const userString = localStorage.getItem('esal_user')

        if (token && userString) {
          // Check if token is expired
          const decoded = jwtDecode(token)
          const now = Date.now() / 1000

          if (decoded.exp && decoded.exp > now) {
            const user = JSON.parse(userString)
            setState({
              user,
              token,
              isLoading: false,
              isAuthenticated: true,
            })
          } else {
            // Token expired, try to refresh
            await refreshAuth()
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const { user, token } = await authApi.login(credentials)
      
      localStorage.setItem('esal_token', token)
      localStorage.setItem('esal_user', JSON.stringify(user))
      
      setState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const { user, token } = await authApi.register(data)
      
      localStorage.setItem('esal_token', token)
      localStorage.setItem('esal_user', JSON.stringify(user))
      
      setState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('esal_token')
      localStorage.removeItem('esal_user')
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const refreshAuth = async () => {
    try {
      const { token } = await authApi.refreshToken()
      const user = await authApi.getProfile()
      
      localStorage.setItem('esal_token', token)
      localStorage.setItem('esal_user', JSON.stringify(user))
      
      setState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      localStorage.removeItem('esal_token')
      localStorage.removeItem('esal_user')
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      })
      throw error
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
