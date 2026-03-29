import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

/**
 * Custom hook for Supabase authentication
 * Provides session state and auth methods
 */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('useAuth: Initial session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: error?.message
      })
      setSession(session)
      setError(error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('useAuth: Auth state changed:', {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      })
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    console.log('useAuth: Starting Google sign in...')
    setLoading(true)
    setError(null)
    
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    
    if (signInError) {
      console.error('useAuth: Sign in error:', signInError)
      setError(signInError)
      setLoading(false)
    } else {
      console.log('useAuth: OAuth flow initiated successfully')
    }
    
    return { error: signInError }
  }

  const signOut = async () => {
    console.log('useAuth: Signing out...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('useAuth: Sign out error:', signOutError)
    } else {
      console.log('useAuth: Successfully signed out')
    }
    
    setSession(null)
    return { error: signOutError }
  }

  return {
    session,
    loading,
    error,
    signInWithGoogle,
    signOut
  }
}

