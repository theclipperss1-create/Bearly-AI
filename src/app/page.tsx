'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatMessage from '@/components/ChatMessage'
import ModelSwitcher from '@/components/ModelSwitcher'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { createChat, saveMessage, getMessages, getChatHistory, updateChatTitle, Chat } from '@/lib/firestore'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const AVAILABLE_MODELS = [
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'stepfun/step-3.5-flash', name: 'Step 3.5 Flash (free)' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' },
]

// Throttle function untuk limit re-renders
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  } as T
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id)
  const [isModelSwitcherOpen, setIsModelSwitcherOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, loading: authLoading, signIn, logOut } = useAuth()
  const saveMessageRef = useRef<NodeJS.Timeout | null>(null)
  const [userUsage, setUserUsage] = useState<{ tokensUsedToday: number; dailyLimit: number; tier: string } | null>(null)

  // Optimized scroll with throttle
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  const throttledScrollToBottom = useMemo(
    () => throttle(scrollToBottom, 100),
    [scrollToBottom]
  )

  useEffect(() => {
    throttledScrollToBottom()
  }, [messages, throttledScrollToBottom])

  useEffect(() => {
    const handleSignOut = () => {
      logOut()
    }
    window.addEventListener('sign-out', handleSignOut)
    return () => window.removeEventListener('sign-out', handleSignOut)
  }, [logOut])

  // Load chat history - memoized
  const loadChats = useCallback(async () => {
    if (!user) return
    try {
      const chatHistory = await getChatHistory(user.uid)
      setChats(chatHistory)
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }, [user])

  // Load chat history effect
  useEffect(() => {
    if (user) {
      loadChats()
    } else {
      setChats([])
    }
  }, [user, loadChats])

  // Load user usage
  const loadUserUsage = useCallback(async () => {
    if (!user) return
    try {
      const { getOrCreateUserUsage } = await import('@/lib/usage')
      const usage = await getOrCreateUserUsage(user.uid, user.email || '')
      setUserUsage({
        tokensUsedToday: usage.tokensUsedToday,
        dailyLimit: usage.dailyLimit,
        tier: usage.tier,
      })
    } catch (error) {
      console.error('Error loading user usage:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadUserUsage()
    } else {
      setUserUsage(null)
    }
  }, [user, loadUserUsage])

  // Load specific chat - memoized
  const loadChat = useCallback(async (chatId: string) => {
    if (!user) return
    try {
      const chatMessages = await getMessages(chatId)
      setMessages(prev => {
        const newMessages = chatMessages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.createdAt.toMillis(),
        }))
        if (JSON.stringify(prev) === JSON.stringify(newMessages)) return prev
        return newMessages
      })
      setCurrentChatId(chatId)
    } catch (error) {
      console.error('Error loading chat:', error)
    }
  }, [user])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setMessages([])
        setInput('')
        setSelectedModel(AVAILABLE_MODELS[0].id)
        setCurrentChatId(null)
      }
      if (e.key === 'Escape') {
        setInput('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Clear messages and start new chat - memoized
  const handleNewChat = useCallback(() => {
    setMessages([])
    setInput('')
    setSelectedModel(AVAILABLE_MODELS[0].id)
    setCurrentChatId(null)
  }, [])

  // Select existing chat - memoized
  const handleSelectChat = useCallback((chatId: string) => {
    loadChat(chatId)
  }, [loadChat])

  // Copy message to clipboard - memoized
  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  // Regenerate last response - memoized
  const handleRegenerate = useCallback(() => {
    if (messages.length < 2) return
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) return

    setMessages(prev => prev.slice(0, -1))
    setInput(lastUserMessage.content)
  }, [messages])

  // Resize handler - memoized
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  // Resize effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = Math.max(200, Math.min(450, e.clientX))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Optimized submit handler with debounced Firestore saves
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    let chatId = currentChatId

    // Create new chat if doesn't exist
    if (!chatId && user) {
      chatId = await createChat(user.uid, input.trim().slice(0, 50))
      setCurrentChatId(chatId)
      loadChats()
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])

    // Save to Firestore (debounced)
    if (chatId && user) {
      saveMessage(chatId, 'user', input.trim())
      if (messages.length === 0) {
        updateChatTitle(chatId, input.trim().slice(0, 50))
        loadChats()
      }
    }

    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          userId: user?.uid,
          userEmail: user?.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          // Limit exceeded
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `⚠️ **Daily Limit Exceeded**\n\nYou've used ${errorData.remaining?.toLocaleString() || 0} of ${errorData.limit?.toLocaleString() || 0} tokens today.\n\n${errorData.upgrade || 'Please try again tomorrow.'}`,
            timestamp: Date.now(),
          }])
          setIsLoading(false)
          return
        }
        throw new Error(errorData.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, assistantMessage])

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let fullContent = ''
        let updateCount = 0
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          fullContent += chunk
          
          // Throttle UI updates (every 5 chunks)
          updateCount++
          if (updateCount % 5 === 0) {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMessage.id
                  ? { ...m, content: m.content + chunk }
                  : m
              )
            )
            throttledScrollToBottom()
          }
        }
        
        // Final update
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id
              ? { ...m, content: fullContent }
              : m
          )
        )
        scrollToBottom()

        // Save assistant message to Firestore (debounced)
        if (chatId && user) {
          saveMessage(chatId, 'assistant', fullContent)
          updateChatTitle(chatId, input.trim().slice(0, 50))
          loadChats()
        }
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, currentChatId, user, messages, selectedModel, loadChats, throttledScrollToBottom, scrollToBottom])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--muted)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-3 border-[var(--accent)] border-t-transparent"
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 flex items-center justify-center"
            style={{
              boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4), inset 0 4px 15px rgba(255, 255, 255, 0.3)',
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3.5-3c.83 0 1.5-.67 1.5-1.5S14.83 8 14 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
            </svg>
          </motion.div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Bearly
          </h2>
          <p className="text-gray-400 text-lg max-w-md mb-8">
            Your intelligent AI assistant powered by cutting-edge language models
          </p>

          <motion.button
            onClick={signIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold flex items-center gap-3 mx-auto"
            style={{
              boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.15)',
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </motion.button>

          <p className="text-gray-500 text-sm mt-6">
            Sign in to save your chat history
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
        onSignOut={logOut}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50 bg-[#0d1117]/80">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <motion.button
                onClick={handleNewChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-800/50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                New chat (Ctrl+K)
              </span>
            </div>
            <div className="relative group">
              <motion.h2 
                className="text-lg font-medium text-gray-300 cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                onClick={handleNewChat}
              >
                Chat
              </motion.h2>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Click to start new chat
              </span>
            </div>
            {messages.length > 0 && (
              <div className="flex items-center gap-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2.5 py-1 rounded-lg bg-gray-800/50 text-xs text-gray-500"
                >
                  {messages.length} messages
                </motion.span>
                <div className="relative group">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRegenerate}
                    className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058M20.97 12a9 9 0 11-1.97-5.644M15 11l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  </motion.button>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Regenerate response
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Usage Indicator */}
            {user && userUsage && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/30 border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-400">
                    {userUsage.tier === 'admin' ? '∞' : userUsage.tokensUsedToday.toLocaleString()} / {userUsage.dailyLimit === -1 ? '∞' : userUsage.dailyLimit.toLocaleString()}
                  </span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    userUsage.tier === 'admin' ? 'bg-red-500/20 text-red-400' :
                    userUsage.tier === 'premium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {userUsage.tier.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            <ModelSwitcher
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isOpen={isModelSwitcherOpen}
              onToggle={() => setIsModelSwitcherOpen(!isModelSwitcherOpen)}
            />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <motion.div 
                className="flex items-center justify-center min-h-[500px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center">
                  {/* Animated Logo */}
                  <motion.div 
                    className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 flex items-center justify-center"
                    style={{
                      boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4), inset 0 4px 15px rgba(255, 255, 255, 0.3)',
                    }}
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{ 
                      y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                      rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
                    }}
                  >
                    <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3.5-3c.83 0 1.5-.67 1.5-1.5S14.83 8 14 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                    </svg>
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
                    Bearly
                  </h2>
                  <p className="text-gray-400 text-lg max-w-md mb-10">
                    Your intelligent AI assistant powered by cutting-edge language models
                  </p>
                  
                  {/* Suggestion Chips */}
                  <div className="flex gap-3 justify-center flex-wrap">
                    {[
                      { icon: '💻', text: 'Help me code' },
                      { icon: '🔬', text: 'Explain quantum physics' },
                      { icon: '✍️', text: 'Write a poem' },
                    ].map((suggestion, i) => (
                      <motion.button
                        key={suggestion.text}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setInput(suggestion.text)
                          setTimeout(() => {
                            const form = document.querySelector('form')
                            if (form) {
                              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                            }
                          }, 100)
                        }}
                        className="px-5 py-3.5 rounded-2xl border border-gray-700/50 text-gray-300 text-sm hover:bg-gray-800/50 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-lg">{suggestion.icon}</span>
                        {suggestion.text}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    onCopy={handleCopy}
                    copiedId={copiedId}
                    onRegenerate={handleRegenerate}
                    isLastMessage={index === messages.length - 1}
                  />
                ))}
              </AnimatePresence>
            )}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="px-5 py-4 rounded-2xl"
                     style={{ 
                       background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                       backdropFilter: 'blur(10px)',
                       border: '1px solid rgba(255, 255, 255, 0.1)',
                     }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 typing-dot" />
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 typing-dot" />
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="px-6 py-5 border-t border-gray-700/50 bg-[#0d1117]/80">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative flex items-center gap-3">
              <motion.input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Message Bearly..."
                disabled={isLoading}
                className="flex-1 px-5 py-4 rounded-2xl border border-gray-700/50 bg-gray-800/30 text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
                }}
                onFocus={e => {
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
                onBlur={e => {
                  e.target.style.boxShadow = '0 0 0 0 rgba(59, 130, 246, 0)';
                  e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                }}
              />
              {isLoading ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50"
                >
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                        animate={{
                          y: [0, -6, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="relative group">
                  <motion.button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
                    whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{
                      boxShadow: input.trim() && !isLoading ? '0 8px 25px rgba(59, 130, 246, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.15)' : 'none',
                    }}
                  >
                    <motion.svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ x: input.trim() && !isLoading ? [0, 4, 0] : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                    </motion.svg>
                  </motion.button>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Send message
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Bearly can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
