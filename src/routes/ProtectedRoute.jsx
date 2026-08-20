import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bakery-cream">
        <Loader2 className="animate-spin text-bakery-brown-500" size={32} />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
