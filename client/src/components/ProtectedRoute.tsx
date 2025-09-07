import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = redirectTo
        return
      }
      
      if (requireAdmin && !isAdmin) {
        window.location.href = '/dashboard'
        return
      }
    }
  }, [user, loading, isAdmin, requireAdmin, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null
  }

  return <>{children}</>
}