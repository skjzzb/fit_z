import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

/**
 * Custom hook for Supabase authentication
 * Provides session state and auth methods
 */
/**
 * Custom hook for Supabase authentication
 * Provides session state and auth methods
 */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setSession(null)
    return { error }
  }

  return {
    session,
    loading,
    signInWithGoogle,
    signOut
  }
}

