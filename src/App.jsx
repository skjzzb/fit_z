import { useAuth } from './hooks/useAuth'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function App() {
  // const { session, loading } = useAuth()
  // console.log('App: Current session state:', { session, loading })

  // if (loading) {
  //   return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  // }

  // return session ? <Dashboard /> : <Login />

  // Temporarily show dashboard only for testing
  return <Dashboard />
}

export default App
