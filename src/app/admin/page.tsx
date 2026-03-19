'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import {
  getAllUsersUsage,
  updateUserTier,
  getAdminConfig,
  updateAdminConfig,
  isAdmin,
} from '@/lib/usage'
import type { UserUsage, UserTier } from '@/lib/types'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserUsage[]>([])
  const [adminEmails, setAdminEmails] = useState<string[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAdmin = useCallback(async () => {
    if (!user?.email) return
    
    try {
      const db = await import('@/lib/firebase').then(m => m.getFirestore())
      if (!db) {
        setError('Firebase not initialized')
        return
      }
      
      const { doc, getDoc } = await import('firebase/firestore')
      const configRef = doc(db, 'config', 'admin')
      const configSnap = await getDoc(configRef)
      
      // Check if admin config exists
      if (!configSnap.exists() || !configSnap.data().adminEmails?.length) {
        setError('No admin config found')
        return
      }
      
      const adminEmails = configSnap.data().adminEmails as string[]
      const isAdminEmail = adminEmails.includes(user.email)
      
      if (!isAdminEmail) {
        setError('Email not authorized as admin')
        return
      }
      
      setIsAdminUser(true)
      loadUsers()
      loadAdminConfig()
    } catch (error) {
      console.error('Error checking admin:', error)
      setError((error as Error).message || 'Error checking admin access')
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user) {
      checkAdmin()
    }
  }, [user, loading, checkAdmin, router])

  const loadUsers = async () => {
    setLoadingUsers(true)
    const allUsers = await getAllUsersUsage()
    setUsers(allUsers)
    setLoadingUsers(false)
  }

  const loadAdminConfig = async () => {
    const config = await getAdminConfig()
    setAdminEmails(config.adminEmails)
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return
    await updateAdminConfig({
      adminEmails: [...adminEmails, newAdminEmail.trim()],
    })
    setAdminEmails([...adminEmails, newAdminEmail.trim()])
    setNewAdminEmail('')
    alert(`Added ${newAdminEmail} as admin!`)
  }

  const handleRemoveAdmin = async (email: string) => {
    await updateAdminConfig({
      adminEmails: adminEmails.filter(e => e !== email),
    })
    setAdminEmails(adminEmails.filter(e => e !== email))
  }

  const handleTierChange = async (userId: string, newTier: UserTier) => {
    await updateUserTier(userId, newTier)
    await loadUsers()
    alert(`User tier updated to ${newTier}!`)
  }

  const formatNumber = (num: number) => {
    if (num === -1) return '∞'
    return num.toLocaleString()
  }

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case 'admin': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'premium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'free': return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  const getUsagePercent = (user: UserUsage) => {
    if (user.dailyLimit === -1) return 0
    return Math.min(100, (user.tokensUsedToday / user.dailyLimit) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]">
        <div className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]">
        <div className="text-center p-8 rounded-2xl border border-red-500/30 bg-red-500/10">
          <h2 className="text-xl font-bold text-red-400 mb-2">Admin Access Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!isAdminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin mb-4" />
          <p className="text-gray-400">Checking admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between bg-[#0d1117]/80">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl hover:bg-gray-800/50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold">
            Admin Access
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Admin Config */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl border border-gray-700/50 bg-gray-800/30"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Admin Configuration</h2>
          
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 mb-3">Admin Emails</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {adminEmails.map(email => (
                <div
                  key={email}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm"
                >
                  {email}
                  <button
                    onClick={() => handleRemoveAdmin(email)}
                    className="hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Add admin email..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-700/50 bg-gray-800/30 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              />
              <button
                onClick={handleAddAdmin}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Add Admin
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Free Limit</div>
              <div className="text-2xl font-bold text-white">10,000</div>
              <div className="text-xs text-gray-500">tokens/day</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Premium Limit</div>
              <div className="text-2xl font-bold text-yellow-400">100,000</div>
              <div className="text-xs text-gray-500">tokens/day</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Admin Limit</div>
              <div className="text-2xl font-bold text-red-400">∞</div>
              <div className="text-xs text-gray-500">unlimited</div>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">All Users ({users.length})</h2>
            <button
              onClick={loadUsers}
              className="px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Refresh
            </button>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-700/50">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Tier</th>
                    <th className="pb-3 font-semibold">Usage Today</th>
                    <th className="pb-3 font-semibold">Total Usage</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userUsage, index) => (
                    <tr
                      key={userUsage.userId}
                      className="border-b border-gray-700/30 last:border-0"
                    >
                      <td className="py-4">
                        <div className="text-sm text-white">{userUsage.userId}</div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getTierColor(userUsage.tier)}`}>
                          {userUsage.tier.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-white">
                          {formatNumber(userUsage.tokensUsedToday)} / {formatNumber(userUsage.dailyLimit)}
                        </div>
                        {userUsage.dailyLimit !== -1 && (
                          <div className="mt-1 w-32 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                              style={{ width: `${getUsagePercent(userUsage)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-gray-400">
                          {formatNumber(userUsage.totalTokensUsed)}
                        </div>
                      </td>
                      <td className="py-4">
                        <select
                          value={userUsage.tier}
                          onChange={(e) => handleTierChange(userUsage.userId, e.target.value as UserTier)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white text-sm focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
