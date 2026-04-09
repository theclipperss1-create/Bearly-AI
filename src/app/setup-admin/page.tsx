'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export default function SetupAdminPage() {
  const { user, loading, signIn, logOut } = useAuth()
  const router = useRouter()
  const [isSetup, setIsSetup] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')

  const checkIfAdminExists = useCallback(async () => {
    try {
      if (!db) return

      const configRef = doc(db, 'config', 'admin')
      const configSnap = await getDoc(configRef)

      if (configSnap.exists() && configSnap.data().adminEmails?.length > 0) {
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
      if (!db) throw new Error('Firestore not initialized')

      const configRef = doc(db, 'config', 'admin')
      await setDoc(configRef, {
        adminEmails: [user.email],
        createdAt: new Date().toISOString(),
      })

      setMessage('Admin setup successful! Redirecting...')
      setTimeout(() => router.push('/admin'), 2000)
    } catch (error) {
      console.error('Error setting up admin:', error)
      setMessage('Error: ' + (error as Error).message)
    } finally {
      setIsProcessing(false)
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
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md px-6"
      >
        <h1 className="text-3xl font-medium text-white mb-6">Admin Setup</h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.includes('Error') ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'
          }`}>
            <p className={message.includes('Error') ? 'text-red-400' : 'text-green-400'}>{message}</p>
          </div>
        )}

        {isSetup ? (
          <p className="text-gray-400">Admin already exists. Redirecting...</p>
        ) : (
          <motion.button
            onClick={handleBecomeAdmin}
            disabled={isProcessing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 rounded-xl bg-white text-black font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Setting up...' : 'Become Admin'}
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
