'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ChatMessage from '@/components/ChatMessage'
import ModelSwitcher from '@/components/ModelSwitcher'
import Sidebar from '@/components/Sidebar'
import ContextPanel from '@/components/ContextPanel'
import { useAuth } from '@/hooks/useAuth'
import { createChat, saveMessage, getMessages, getChatHistory, updateChatTitle, Chat } from '@/lib/firestore'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const AVAILABLE_MODELS = [
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast & efficient' },
  { id: 'stepfun/step-3.5-flash', name: 'Step 3.5 Flash (free)', description: 'Completely free' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', description: 'Best value - recommended' },
  { id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B', description: 'Lightweight & fast' },
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
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id)
  const [isModelSwitcherOpen, setIsModelSwitcherOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, loading: authLoading, signIn, logOut } = useAuth()
  const saveMessageRef = useRef<NodeJS.Timeout | null>(null)
  const [userUsage, setUserUsage] = useState<{ tokensUsedToday: number; dailyLimit: number; tier: string } | null>(null)
  const [hasExceededLimit, setHasExceededLimit] = useState(false)

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
      // Reset exceeded flag if usage has been reset
      if (usage.tokensUsedToday < usage.dailyLimit || usage.dailyLimit === -1) {
        setHasExceededLimit(false)
      }
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

    // Check if user has exceeded limit
    if (userUsage && userUsage.tier !== 'admin' && userUsage.dailyLimit !== -1) {
      const remaining = userUsage.dailyLimit - userUsage.tokensUsedToday
      if (remaining <= 0) {
        setHasExceededLimit(true)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `⚠️ **Daily Limit Exceeded**\n\nYou've used **${userUsage.tokensUsedToday.toLocaleString()}** of **${userUsage.dailyLimit.toLocaleString()}** tokens today.\n\nPlease contact admin to upgrade your tier or try again tomorrow when your limit resets.`,
          timestamp: Date.now(),
        }])
        return
      }
    }

    let chatId = currentChatId

    // Create new chat if doesn't exist
    if (!chatId && user) {
      chatId = await createChat(user.uid, input.trim().slice(0, 50))
      setCurrentChatId(chatId)
      await loadChats()
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])

    // Save to Firestore
    if (chatId && user) {
      await saveMessage(chatId, 'user', input.trim())
      if (messages.length === 0) {
        await updateChatTitle(chatId, input.trim().slice(0, 50))
        await loadChats()
      }
    }

    setInput('')
    setIsLoading(true)
    setHasExceededLimit(false)

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

        // Save assistant message to Firestore
        if (chatId && user) {
          try {
            await saveMessage(chatId, 'assistant', fullContent)
            await updateChatTitle(chatId, input.trim().slice(0, 50))
            await loadChats()
          } catch (error) {
            console.error('Error saving chat:', error)
          }
        }

        // Refresh user usage after chat completes
        loadUserUsage()
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
      // Refresh user usage even on error
      loadUserUsage()
    }
  }, [input, isLoading, currentChatId, user, messages, selectedModel, loadChats, loadUserUsage, throttledScrollToBottom, scrollToBottom, userUsage])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#1A1A1A] flex items-center justify-center"
            style={{
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white"
            />
          </motion.div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-400 mb-4">Please sign in to continue</p>
          <motion.a
            href="/login"
            whileHover={{ scale: 1.02 }}
            className="inline-block px-6 py-3 rounded-xl bg-white text-black font-medium"
          >
            Sign In
          </motion.a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#111111] overflow-hidden">
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
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-[#1A1A1A] bg-[#0A0A0A]/80 backdrop-blur-xl mobile-safe-top">
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors touch-target-lg"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
            <div className="relative group">
              <motion.button
                onClick={handleNewChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl hover:bg-white/5 transition-colors touch-target-lg"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-[#161616] border border-[#1A1A1A] text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden sm:block">
                New chat (Ctrl+K)
              </span>
            </div>
            <div className="relative group">
              <motion.h2
                className="text-base sm:text-lg font-medium text-white cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                onClick={handleNewChat}
              >
                Chat
              </motion.h2>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-[#161616] border border-[#1A1A1A] text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden sm:block">
                Click to start new chat
              </span>
            </div>
            {messages.length > 0 && (
              <div className="flex items-center gap-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2 sm:px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-500"
                >
                  <span className="hidden sm:inline">{messages.length} messages</span>
                  <span className="sm:hidden">{messages.length}</span>
                </motion.span>
                <div className="relative group">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRegenerate}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors touch-target-lg"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058M20.97 12a9 9 0 11-1.97-5.644M15 11l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  </motion.button>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-[#161616] border border-[#1A1A1A] text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden sm:block">
                    Regenerate response
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Usage Indicator */}
            {user && userUsage && (
              <div data-testid="token-usage" className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                  <span className="text-xs text-gray-400">
                    {userUsage.tier === 'admin' ? '∞' : userUsage.tokensUsedToday.toLocaleString()} / {userUsage.dailyLimit === -1 ? '∞' : userUsage.dailyLimit.toLocaleString()}
                  </span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    userUsage.tier === 'admin' ? 'bg-white/10 text-white' :
                    userUsage.tier === 'premium' ? 'bg-white/10 text-white' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {userUsage.tier.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            {/* Model Switcher */}
            <ModelSwitcher
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isOpen={isModelSwitcherOpen}
              onToggle={() => setIsModelSwitcherOpen(!isModelSwitcherOpen)}
            />
            {/* Context Panel Toggle */}
            <motion.button
              onClick={() => setIsContextPanelOpen(!isContextPanelOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2.5 rounded-xl border transition-all ${
                isContextPanelOpen
                  ? 'bg-white/5 border-[#27272A] text-white'
                  : 'bg-transparent border-[#1A1A1A] text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </motion.button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {messages.length === 0 ? (
              <motion.div
                className="flex items-center justify-center min-h-[500px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center px-4">
                  {/* Animated Logo - NOIR Style */}
                  <motion.div
                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl bg-[#161616] border border-[#1A1A1A] flex items-center justify-center"
                    style={{
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
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
                    <svg className="w-10 h-10 sm:w-14 sm:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3.5-3c.83 0 1.5-.67 1.5-1.5S14.83 8 14 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                    </svg>
                  </motion.div>

                  <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-wide mb-2 sm:mb-3">
                    NOIR
                  </h2>
                  <p className="text-gray-500 text-base sm:text-lg max-w-md mb-8 sm:mb-10">
                    Premium AI chatbot with monochrome elegance
                  </p>

                  {/* Suggestion Chips - Mobile Optimized */}
                  <div className="flex gap-2 sm:gap-3 justify-center flex-wrap px-2">
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
                        className="suggestion-chip px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-[#1A1A1A] bg-[#161616] text-gray-400 text-xs sm:text-sm hover:bg-[#1C1C1C] hover:text-white transition-all flex items-center gap-2 cursor-pointer card-hover touch-target-lg"
                      >
                        <span className="text-base sm:text-lg">{suggestion.icon}</span>
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
                <div className="px-5 py-4 rounded-2xl border border-[#1A1A1A]"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                       backdropFilter: 'blur(10px)',
                       boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                     }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40 typing-dot" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/30 typing-dot" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20 typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form - NOIR Style - Mobile Optimized */}
        <div className="px-3 sm:px-6 py-3 sm:py-5 border-t border-[#1A1A1A] bg-[#0A0A0A]/80 backdrop-blur-xl mobile-safe-bottom">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            {/* Limit Exceeded Warning */}
            {hasExceededLimit || (userUsage && userUsage.tier !== 'admin' && userUsage.dailyLimit !== -1 && userUsage.tokensUsedToday >= userUsage.dailyLimit) ? (
              <motion.div
                data-testid="limit-exceeded-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-400 font-medium text-xs sm:text-sm">Daily Limit Exceeded</p>
                    <p className="text-red-400/70 text-xs mt-1">
                      You&apos;ve used <strong>{userUsage?.tokensUsedToday.toLocaleString()}</strong> of <strong>{userUsage?.dailyLimit.toLocaleString()}</strong> tokens today.
                      {userUsage?.tier === 'free' && ' Upgrade your tier or wait until tomorrow.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <div className="relative">
              <motion.textarea
                data-testid="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={hasExceededLimit || (userUsage && userUsage.tokensUsedToday >= userUsage.dailyLimit && userUsage.tier !== 'admin') ? "Daily limit exceeded - upgrade your tier" : "Message NOIR..."}
                disabled={isLoading || hasExceededLimit || !!(userUsage && userUsage.tier !== 'admin' && userUsage.dailyLimit !== -1 && userUsage.tokensUsedToday >= userUsage.dailyLimit)}
                rows={1}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-[#1A1A1A] bg-[#161616] text-white placeholder-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none touch-target-lg"
                style={{
                  minHeight: '56px',
                  maxHeight: '200px',
                  boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
                  fontSize: '16px', // Prevents iOS zoom on focus
                }}
                onFocus={e => {
                  e.target.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.03)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={e => {
                  e.target.style.boxShadow = '0 0 0 0 rgba(255, 255, 255, 0)';
                  e.target.style.borderColor = 'rgba(26, 26, 26, 1)';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3">
                {isLoading ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-2 sm:p-2.5 rounded-xl bg-[#1C1C1C] border border-[#1A1A1A]"
                  >
                    <div className="flex gap-1 sm:gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/30"
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
                      className="p-2 sm:p-2.5 rounded-xl bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-target-lg"
                      style={{
                        boxShadow: input.trim() && !isLoading ? '0 8px 25px rgba(255, 255, 255, 0.15)' : 'none',
                      }}
                    >
                      <motion.svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="currentColor"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ x: input.trim() && !isLoading ? [0, 4, 0] : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                      </motion.svg>
                    </motion.button>
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-[#161616] border border-[#1A1A1A] text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden sm:block">
                      Send message
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2 sm:mt-3 hidden sm:block">
              NOIR can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>

      {/* Context Panel */}
      <ContextPanel
        isOpen={isContextPanelOpen}
        onClose={() => setIsContextPanelOpen(false)}
        user={user}
        userUsage={userUsage}
      />
    </div>
  )
}
