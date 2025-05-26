import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

interface RequireAuthProps {
  children: ReactNode
  allowedRoles?: ('innovator' | 'investor' | 'hub')[]
  requireApproval?: boolean
  fallbackPath?: string
}

export function RequireAuth({ 
  children, 
  allowedRoles, 
  requireApproval = false,
  fallbackPath = '/login' 
}: RequireAuthProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    // Save the attempted location for redirect after login
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check approval status for restricted roles
  if (requireApproval && (user.role === 'investor' || user.role === 'hub') && !user.isApproved) {
    return <Navigate to="/pending-approval" replace />
  }

  return <>{children}</>
}

interface RequireRoleProps {
  children: ReactNode
  role: 'innovator' | 'investor' | 'hub'
  requireApproval?: boolean
}

export function RequireRole({ children, role, requireApproval = false }: RequireRoleProps) {
  return (
    <RequireAuth allowedRoles={[role]} requireApproval={requireApproval}>
      {children}
    </RequireAuth>
  )
}

interface RequireApprovalProps {
  children: ReactNode
}

export function RequireApproval({ children }: RequireApprovalProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if ((user.role === 'investor' || user.role === 'hub') && !user.isApproved) {
    return <Navigate to="/pending-approval" replace />
  }

  return <>{children}</>
}
