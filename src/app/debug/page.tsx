'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { firebaseApp, auth } from '@/lib/firebase'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  useEffect(() => {
    const testFirebase = async () => {
      addLog('Starting Firebase connection test...')
      setFirebaseStatus('checking')

      try {
        // Test 1: Check environment variables
        addLog('Test 1: Checking environment variables...')
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        
        if (!apiKey) {
          addLog('❌ NEXT_PUBLIC_FIREBASE_API_KEY is missing!')
        } else {
          addLog(`✓ NEXT_PUBLIC_FIREBASE_API_KEY: ${apiKey.substring(0, 10)}...`)
        }
        
        if (!projectId) {
          addLog('❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing!')
        } else {
          addLog(`✓ NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${projectId}`)
        }

        // Test 2: Check Firebase app
        addLog('\nTest 2: Checking Firebase app...')
        
        if (!firebaseApp) {
          addLog('❌ Firebase app not initialized!')
          setFirebaseStatus('error')
          return
        }
        
        addLog('✓ Firebase app initialized successfully')
        setFirebaseStatus('connected')

        // Test 3: Check Auth
        addLog('\nTest 3: Checking Firebase Auth...')
        if (!auth) {
          addLog('❌ Firebase Auth not initialized!')
        } else {
          addLog(`✓ Firebase Auth initialized (currentUser: ${auth.currentUser?.email || 'null'})`)
        }

        addLog('\n✅ All tests passed! Firebase is working correctly.')

      } catch (error: any) {
        addLog(`\n❌ Test failed: ${error.message}`)
        setFirebaseStatus('error')
        console.error('Firebase test error:', error)
      }
    }

    testFirebase()
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-medium text-white mb-2">Firebase Connection Test</h1>
          <p className="text-gray-500">Debug page to test Firebase configuration</p>
        </motion.div>

        {/* Status Card */}
        <div className="mb-6 p-6 rounded-2xl bg-[#161616] border border-[#1A1A1A]">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              firebaseStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
              firebaseStatus === 'connected' ? 'bg-green-400' :
              'bg-red-400'
            }`} />
            <span className="text-white font-medium">
              Status: {
                firebaseStatus === 'checking' ? 'Checking...' :
                firebaseStatus === 'connected' ? 'Connected' :
                'Error'
              }
            </span>
          </div>

          {firebaseStatus === 'error' && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">
                ⚠️ Firebase connection failed. Check the logs below for details.
              </p>
              <p className="text-red-400/70 text-xs mt-2">
                Make sure you have configured Firebase correctly in Firebase Console and added the credentials to .env.local
              </p>
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="p-6 rounded-2xl bg-[#111111] border border-[#1A1A1A]">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Connection Logs</h2>
          <div className="space-y-2 font-mono text-xs text-gray-500 max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap">{log}</div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-600">Initializing tests...</div>
            )}
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 p-6 rounded-2xl bg-[#161616] border border-[#1A1A1A]">
          <h3 className="text-white font-medium mb-3">Setup Instructions</h3>
          <ol className="space-y-2 text-sm text-gray-500 list-decimal list-inside">
            <li>Go to <a href="https://console.firebase.google.com" target="_blank" className="text-white hover:underline">Firebase Console</a></li>
            <li>Create a new project or select existing</li>
            <li>Go to Project Settings &gt; General</li>
            <li>Copy the Firebase SDK configuration</li>
            <li>Paste the values in <code className="px-2 py-1 rounded bg-white/5 text-white">.env.local</code></li>
            <li>Go to Authentication &gt; Sign-in method</li>
            <li>Enable Google sign-in</li>
            <li>Add your domain to authorized domains (localhost for development)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
