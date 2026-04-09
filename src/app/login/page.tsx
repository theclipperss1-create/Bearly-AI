'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState('')
  const [firebaseError, setFirebaseError] = useState('')

  useEffect(() => {
    // Check Firebase config
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    
    if (!apiKey || !projectId) {
      setFirebaseError('Firebase not configured. Check .env.local')
    }
    setLoading(false)
  }, [])

  const handleSignIn = async () => {
    try {
      setError('')
      setIsSigningIn(true)
      
      // Import Firebase dynamically
      const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
      const { firebaseApp } = await import('@/lib/firebase')
      
      if (!firebaseApp) {
        throw new Error('Firebase not initialized. Check .env.local')
      }
      
      const auth = getAuth(firebaseApp)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      
      // Redirect to home after successful sign in
      router.push('/')
    } catch (err: any) {
      console.error('Sign in error:', err)
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled.')
      } else if (err?.code === 'auth/network-request-failed') {
        setError('Network error. Check your connection.')
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized. Add localhost in Firebase Console > Authentication > Settings > Authorized domains')
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError('Google sign-in not enabled. Enable it in Firebase Console > Authentication > Sign-in method')
      } else {
        setError(err?.message || 'Failed to sign in.')
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.02]" />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#161616] border border-[#1A1A1A] flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
          </motion.div>
          <h1 className="text-4xl font-medium text-white mb-2">NOIR</h1>
          <p className="text-gray-500 text-sm">Premium AI Chatbot</p>
        </div>

        {/* Firebase Error */}
        {firebaseError && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-sm">{firebaseError}</p>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-[#111111] border border-[#1A1A1A] rounded-3xl p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-white mb-2">Welcome back</h2>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <motion.button
            onClick={handleSignIn}
            disabled={isSigningIn}
            whileHover={{ scale: isSigningIn ? 1 : 1.02 }}
            whileTap={{ scale: isSigningIn ? 1 : 0.98 }}
            className="w-full py-4 rounded-xl bg-white text-black font-medium flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSigningIn ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </motion.button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1A1A1A]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-[#111111] text-gray-600">Secure authentication</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: '💬', text: 'Continue conversations' },
              { icon: '📊', text: 'Track usage' },
              { icon: '🔒', text: 'Private & secure' },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3 text-sm text-gray-500">
                <span className="text-lg">{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 text-center">
          By signing in, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  )
}
