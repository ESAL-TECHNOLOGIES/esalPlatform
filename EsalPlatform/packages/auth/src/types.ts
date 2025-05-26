export interface User {
  id: string
  email: string
  role: 'innovator' | 'investor' | 'hub'
  name: string
  isApproved: boolean
  profile?: {
    company?: string
    bio?: string
    avatar?: string
  }
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
  role: 'innovator' | 'investor' | 'hub'
}

export interface RegisterData extends LoginCredentials {
  name: string
  company?: string
}
