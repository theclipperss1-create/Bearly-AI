'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let isMounted = true

    const initAuth = async () => {
      try {
        const { getAuth, onAuthStateChanged } = await import('firebase/auth')
        const { getFirebaseApp } = await import('@/lib/firebase')

        const app = await getFirebaseApp()
        if (!app) {
          console.warn('Firebase app not initialized')
          if (isMounted) setLoading(false)
          return
        }

        const auth = getAuth(app)
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (!isMounted) return
          setUser(firebaseUser || null)
          setLoading(false)
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [])

  const signIn = useCallback(async () => {
    try {
      const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
      const { getFirebaseApp } = await import('@/lib/firebase')
      
      const app = await getFirebaseApp()
      if (!app) throw new Error('Firebase not initialized')

      const auth = getAuth(app)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }, [])

  const logOut = useCallback(async () => {
    try {
      const { getAuth, signOut } = await import('firebase/auth')
      const { getFirebaseApp } = await import('@/lib/firebase')
      
      const app = await getFirebaseApp()
      if (!app) throw new Error('Firebase not initialized')

      const auth = getAuth(app)
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }, [])

  return { user, loading, signIn, logOut }
}
