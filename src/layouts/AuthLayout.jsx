import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/beranda" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Hospital EMR
          </h1>
          <p className="text-slate-600">
            Electronic Medical Record System
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
