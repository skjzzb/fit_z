import { useAuth } from './hooks/useAuth'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function App() {
  const { session, loading } = useAuth()
  
  // Debug logging for login flow validation
  console.log('App: Session state:', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    loading,
    timestamp: new Date().toISOString()
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  return session ? <Dashboard /> : <Login />
}

export default App
