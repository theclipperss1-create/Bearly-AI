'use client'

import { useState, useEffect, useCallback } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  logOut: () => Promise<void>
  error: string | null
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setError('Firebase not configured. Check .env.local')
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    }, (authError) => {
      setError(authError.message)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = useCallback(async () => {
    if (!auth) throw new Error('Firebase not initialized')
    
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in')
      throw err
    }
  }, [])

  const logOut = useCallback(async () => {
    if (!auth) throw new Error('Firebase not initialized')
    
    try {
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    } catch (err: any) {
      setError(err?.message || 'Failed to sign out')
      throw err
    }
  }, [])

  return { user, loading, signIn, logOut, error }
}
