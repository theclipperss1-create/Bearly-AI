'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'firebase/auth'

interface ContextPanelProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  userUsage: { tokensUsedToday: number; dailyLimit: number; tier: string } | null
}

export default function ContextPanel({
  isOpen,
  onClose,
  user,
  userUsage,
}: ContextPanelProps) {
  const usagePercentage = userUsage && userUsage.dailyLimit > 0 
    ? Math.min(100, (userUsage.tokensUsedToday / userUsage.dailyLimit) * 100) 
    : 0

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'admin': return 'text-white'
      case 'premium': return 'text-white'
      default: return 'text-gray-400'
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'admin': return 'bg-white/10 text-white'
      case 'premium': return 'bg-white/10 text-white'
      default: return 'bg-gray-500/10 text-gray-400'
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Context Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-[#161616] border-l border-[#1A1A1A] z-50 lg:static lg:z-0 lg:translate-x-0"
            style={{
              boxShadow: '0 0 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="flex flex-col h-full p-5 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">Context</h2>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Bento Grid Cards */}
              <div className="space-y-4 flex-1">
                {/* Token Usage Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bento-card p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Token Usage</p>
                      <p className="text-xs text-gray-500">Today&apos;s consumption</p>
                    </div>
                  </div>
                  
                  {userUsage ? (
                    <>
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-light text-white">
                            {userUsage.tokensUsedToday.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            / {userUsage.dailyLimit === -1 ? '∞' : userUsage.dailyLimit.toLocaleString()}
                          </span>
                        </div>
                        {userUsage.dailyLimit > 0 && (
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${usagePercentage}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={`h-full rounded-full ${
                                usagePercentage > 90 ? 'bg-red-500/50' :
                                usagePercentage > 70 ? 'bg-yellow-500/50' :
                                'bg-white/20'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-lg ${getTierBadge(userUsage.tier)}`}>
                          {userUsage.tier.toUpperCase()}
                        </span>
                        {userUsage.dailyLimit === -1 && (
                          <span className="text-xs text-gray-500">Unlimited</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="shimmer h-12 rounded-lg" />
                  )}
                </motion.div>

                {/* User Profile Card */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bento-card p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Profile</p>
                        <p className="text-xs text-gray-500">Account settings</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white text-sm font-medium">
                        {user.email?.[0].toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bento-card p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Statistics</p>
                      <p className="text-xs text-gray-500">Your activity</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-lg font-light text-white">—</p>
                      <p className="text-xs text-gray-500">Total Chats</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-lg font-light text-white">—</p>
                      <p className="text-xs text-gray-500">Messages</p>
                    </div>
                  </div>
                </motion.div>

                {/* Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bento-card p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">About NOIR</p>
                      <p className="text-xs text-gray-500">Version 1.0</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    A premium AI chatbot experience with monochrome elegance. 
                    Built for professionals who appreciate minimalism.
                  </p>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-[#1A1A1A]">
                <p className="text-xs text-gray-600 text-center">
                  NOIR Evolution © 2024
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
