'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { getChatHistory, Chat, deleteChat } from '@/lib/firestore'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  currentChatId: string | null
  onSignOut?: () => void
}

export default function Sidebar({
  isOpen,
  onClose,
  user,
  onNewChat,
  onSelectChat,
  currentChatId,
  onSignOut,
}: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  const loadChats = async () => {
    if (!user) return
    try {
      const chatHistory = await getChatHistory(user.uid)
      setChats(chatHistory)
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadChats()
    } else {
      setChats([])
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    if (!user) return
    try {
      await deleteChat(chatId)
      loadChats()
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  return (
    <>
      {/* Overlay */}
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

      {/* Sidebar */}
      <motion.aside
        data-testid="sidebar"
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 z-50 lg:translate-x-0 lg:static lg:z-0"
        style={{
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="flex flex-col h-full p-5">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
                }}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3.5-3c.83 0 1.5-.67 1.5-1.5S14.83 8 14 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                </svg>
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Bearly
              </h1>
            </motion.div>
          </div>

          {/* New Chat Button */}
          <motion.button
            onClick={onNewChat}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(59, 130, 246, 0.35)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium mb-6 flex items-center justify-center gap-2 relative group"
            style={{
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25), inset 0 2px 10px rgba(255, 255, 255, 0.15)',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              New chat (Ctrl+K)
            </span>
          </motion.button>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Recent Chats
            </p>
            <div className="space-y-1.5">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                </div>
              ) : chats.length === 0 ? (
                <div className="px-3 py-8 rounded-xl text-gray-500 text-sm text-center border border-dashed border-gray-700"
                     style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  No chat history yet
                  <p className="text-xs mt-1 text-gray-600">Start a conversation!</p>
                </div>
              ) : (
                chats.map(chat => (
                  <motion.div
                    key={chat.id}
                    data-testid="chat-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group relative"
                  >
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 ${
                        currentChatId === chat.id
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300 border border-transparent'
                      }`}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span className="truncate flex-1">{chat.title}</span>
                    </button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl"
                   style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shadow-lg"
                     style={{ boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (confirm('Sign out?')) {
                      onSignOut?.()
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}
