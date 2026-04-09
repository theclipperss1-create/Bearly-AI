'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { getAllUsersUsage, updateUserTier, getAdminConfig, updateAdminConfig } from '@/lib/usage'
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
      const config = await getAdminConfig()
      const adminEmailsList = config.adminEmails || []
      const isAdminEmail = adminEmailsList.includes(user.email)

      if (!isAdminEmail) {
        setError('Email not authorized as admin')
        return
      }

      setIsAdminUser(true)
      loadUsers()
      loadAdminConfig()
    } catch (err) {
      console.error('Admin check error:', err)
      setError('Failed to check admin status')
    }
  }, [user?.email])

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
    setAdminEmails(config.adminEmails || [])
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return
    await updateAdminConfig({ adminEmails: [...adminEmails, newAdminEmail.trim()] })
    setAdminEmails([...adminEmails, newAdminEmail.trim()])
    setNewAdminEmail('')
    alert(`Added ${newAdminEmail} as admin!`)
  }

  const handleRemoveAdmin = async (email: string) => {
    await updateAdminConfig({ adminEmails: adminEmails.filter(e => e !== email) })
    setAdminEmails(adminEmails.filter(e => e !== email))
  }

  const handleTierChange = async (userId: string, newTier: UserTier) => {
    await updateUserTier(userId, newTier)
    await loadUsers()
    alert(`Updated user tier to ${newTier}`)
  }

  if (loading || loadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  if (!user || !isAdminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Access denied'}</p>
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
            className="px-6 py-3 rounded-xl bg-white text-black"
          >
            Go Home
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-medium text-white mb-8">Admin Dashboard</h1>

        {/* Add Admin Section */}
        <div className="mb-8 p-6 rounded-2xl bg-[#161616] border border-[#1A1A1A]">
          <h2 className="text-xl font-medium text-white mb-4">Manage Admins</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              className="flex-1 px-4 py-2 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-white"
            />
            <motion.button
              onClick={handleAddAdmin}
              whileHover={{ scale: 1.02 }}
              className="px-6 py-2 rounded-xl bg-white text-black"
            >
              Add Admin
            </motion.button>
          </div>
          <div className="space-y-2">
            {adminEmails.map((email) => (
              <div key={email} className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A]">
                <span className="text-gray-300">{email}</span>
                <motion.button
                  onClick={() => handleRemoveAdmin(email)}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-sm"
                >
                  Remove
                </motion.button>
              </div>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="p-6 rounded-2xl bg-[#161616] border border-[#1A1A1A]">
          <h2 className="text-xl font-medium text-white mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1A1A]">
                  <th className="text-left py-3 px-4 text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400">Tier</th>
                  <th className="text-left py-3 px-4 text-gray-400">Tokens Used</th>
                  <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId} className="border-b border-[#1A1A1A]">
                    <td className="py-3 px-4 text-white">{user.userId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.tier === 'admin' ? 'bg-red-500/20 text-red-400' :
                        user.tier === 'premium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{user.tokensUsedToday.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.tier}
                        onChange={(e) => handleTierChange(user.userId, e.target.value as UserTier)}
                        className="px-3 py-1 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] text-white text-sm"
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
        </div>
      </div>
    </div>
  )
}
