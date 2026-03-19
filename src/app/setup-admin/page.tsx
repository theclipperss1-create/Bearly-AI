'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { getFirestore } from '@/lib/firebase'

export default function SetupAdminPage() {
  const { user, loading, signIn, logOut } = useAuth()
  const router = useRouter()
  const [isSetup, setIsSetup] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')

  const checkIfAdminExists = useCallback(async () => {
    try {
      const db = await getFirestore()
      if (!db) return

      const configRef = doc(db, 'config', 'admin')
      const configSnap = await getDoc(configRef)

      if (configSnap.exists() && configSnap.data().adminEmails?.length > 0) {
        // Admin already exists, redirect to admin panel
        setIsSetup(true)
        setMessage('Admin already exists. Redirecting...')
        setTimeout(() => router.push('/admin'), 2000)
      }
    } catch (error) {
      console.error('Error checking admin:', error)
    }
  }, [router])

  useEffect(() => {
    if (!loading && !user) {
      signIn()
    }

    if (user) {
      checkIfAdminExists()
    }
  }, [user, loading, signIn, checkIfAdminExists])

  const handleBecomeAdmin = async () => {
    if (!user?.email) return
    
    setIsProcessing(true)
    setMessage('Setting up admin...')
    
    try {
      const db = await getFirestore()
      if (!db) throw new Error('Firestore not initialized')
      
      const configRef = doc(db, 'config', 'admin')
      await setDoc(configRef, {
        adminEmails: [user.email],
        createdAt: new Date().toISOString(),
      })
      
      setMessage('✅ Admin setup successful! Redirecting...')
      setTimeout(() => router.push('/admin'), 2000)
    } catch (error) {
      console.error('Error setting up admin:', error)
      setMessage('❌ Error: ' + (error as Error).message)
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]">
        <div className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          {/* Logo */}
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 flex items-center justify-center"
            style={{
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4), inset 0 3px 10px rgba(255, 255, 255, 0.3)',
            }}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3.5-3c.83 0 1.5-.67 1.5-1.5S14.83 8 14 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
            </svg>
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Admin Setup
          </h1>
          <p className="text-gray-400">
            {isSetup 
              ? 'Admin already configured' 
              : 'Create your admin account'}
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/30">
          {isSetup ? (
            <div className="text-center py-8">
              <div className="text-green-400 text-lg mb-4">✓ Admin Already Setup</div>
              <p className="text-gray-400 text-sm mb-4">{message || 'Redirecting to admin panel...'}</p>
            </div>
          ) : (
            <>
              {!user ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-6">Signing in with Google...</p>
                  <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-900/50 border border-gray-700/50">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{user.displayName || 'User'}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <p className="text-blue-400 text-sm">
                      <strong>Note:</strong> This email will be registered as the first admin. 
                      You can add/remove admins later from the admin panel.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      onClick={handleBecomeAdmin}
                      disabled={isProcessing || !user?.email}
                      whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                      whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                      className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Setting up...' : 'Become Admin'}
                    </motion.button>

                    <button
                      onClick={logOut}
                      disabled={isProcessing}
                      className="w-full px-6 py-3 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                    >
                      Sign Out
                    </button>
                  </div>

                  {message && !isProcessing && (
                    <p className={`text-center text-sm ${
                      message.includes('✅') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          This page is only for first-time admin setup
        </p>
      </motion.div>
    </div>
  )
}
