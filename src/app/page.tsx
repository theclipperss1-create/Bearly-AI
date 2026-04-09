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
        {/* Header - Simplified & Cleaner */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#1A1A1A] bg-[#0A0A0A]/90 backdrop-blur-xl mobile-safe-top">
          {/* Left Section: Sidebar Toggle + New Chat + Title */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle - Mobile Only */}
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors touch-target-lg"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>

            {/* New Chat Button */}
            <motion.button
              onClick={handleNewChat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors touch-target-lg"
              aria-label="New chat"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </motion.button>

            {/* Chat Title */}
            <h2 className="text-sm sm:text-base font-medium text-white truncate max-w-[150px] sm:max-w-none">
              {currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'Chat' : 'New Chat'}
            </h2>

            {/* Message Count & Actions - Only when messages exist */}
            {messages.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-gray-500">
                  {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRegenerate}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors touch-target-lg"
                  aria-label="Regenerate response"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058M20.97 12a9 9 0 11-1.97-5.644M15 11l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </motion.button>
              </div>
            )}
          </div>

          {/* Right Section: Usage + Model Switcher + Context Panel */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Usage Indicator - Desktop Only */}
            {user && userUsage && (
              <div data-testid="token-usage" className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-[#1A1A1A]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  <span className="text-xs text-gray-400 font-medium">
                    {userUsage.tier === 'admin' ? '∞' : `${userUsage.tokensUsedToday.toLocaleString()} / ${userUsage.dailyLimit === -1 ? '∞' : userUsage.dailyLimit.toLocaleString()}`}
                  </span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    userUsage.tier === 'admin' ? 'bg-white/15 text-white' :
                    userUsage.tier === 'premium' ? 'bg-white/15 text-white' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {userUsage.tier}
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
              className={`p-2 rounded-lg border transition-all touch-target-lg ${
                isContextPanelOpen
                  ? 'bg-white/10 border-[#27272A] text-white'
                  : 'bg-transparent border-[#1A1A1A] text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              aria-label="Toggle context panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </motion.button>
          </div>
        </header>

        {/* Messages Area - ChatGPT Style */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Landing Page - ChatGPT Style */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
              <motion.div
                className="max-w-3xl w-full text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Simple Logo */}
                <motion.div
                  className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                </motion.div>

                <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                  How can I help you today?
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mb-12">
                  I'm NOIR, your AI assistant. Ask me anything.
                </p>

                {/* Suggestion Grid - ChatGPT Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {[
                    { icon: '💻', title: 'Help me code', desc: 'Debug, explain, or write code' },
                    { icon: '📝', title: 'Write content', desc: 'Essays, emails, posts' },
                    { icon: '🧠', title: 'Explain concepts', desc: 'Learn anything deeply' },
                    { icon: '🎯', title: 'Solve problems', desc: 'Math, logic, analysis' },
                    { icon: '💡', title: 'Brainstorm ideas', desc: 'Creative thinking partner' },
                    { icon: '🔍', title: 'Research topic', desc: 'Summarize & analyze' },
                  ].map((suggestion, i) => (
                    <motion.button
                      key={suggestion.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      onClick={() => {
                        setInput(suggestion.title)
                        setTimeout(() => {
                          const form = document.querySelector('form')
                          if (form) {
                            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                          }
                        }, 100)
                      }}
                      className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-left transition-all hover:border-white/10"
                    >
                      <div className="text-2xl mb-2">{suggestion.icon}</div>
                      <div className="text-sm font-medium text-white mb-0.5 group-hover:text-white/90">
                        {suggestion.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestion.desc}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            /* Messages - ChatGPT Style Alternating */
            <div className="max-w-none">
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
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-white/5 bg-white/[0.02]"
                >
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex gap-4 sm:gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                          <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          NOIR
                        </div>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-white/40 typing-dot" />
                          <div className="w-2 h-2 rounded-full bg-white/30 typing-dot" />
                          <div className="w-2 h-2 rounded-full bg-white/20 typing-dot" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - ChatGPT Style */}
        <div className="border-t border-white/5 bg-gradient-to-t from-[#0A0A0A] to-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <form onSubmit={handleSubmit}>
              {/* Input Container */}
              <div className="relative bg-[#161616] rounded-2xl border border-white/10 focus-within:border-white/20 transition-colors shadow-lg">
                {/* Limit Exceeded Warning */}
                {hasExceededLimit || (userUsage && userUsage.tier !== 'admin' && userUsage.dailyLimit !== -1 && userUsage.tokensUsedToday >= userUsage.dailyLimit) ? (
                  <div className="px-4 pt-3 pb-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-red-400 text-xs font-medium">
                        Daily limit reached ({userUsage?.tokensUsedToday.toLocaleString()} / {userUsage?.dailyLimit.toLocaleString()})
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Textarea */}
                <div className="flex items-end gap-2 p-3">
                  <motion.textarea
                    data-testid="chat-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Message NOIR..."
                    disabled={isLoading || hasExceededLimit || !!(userUsage && userUsage.tier !== 'admin' && userUsage.dailyLimit !== -1 && userUsage.tokensUsedToday >= userUsage.dailyLimit)}
                    rows={1}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm sm:text-[15px] leading-relaxed"
                    style={{
                      minHeight: '24px',
                      maxHeight: '200px',
                      fontSize: '16px',
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                  />
                  
                  {/* Send Button */}
                  {isLoading ? (
                    <motion.button
                      disabled
                      className="p-2 rounded-lg bg-white/10 text-white/50 flex-shrink-0"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full bg-white/50"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      whileHover={{ scale: input.trim() ? 1.05 : 1 }}
                      whileTap={{ scale: input.trim() ? 0.95 : 1 }}
                      className={`p-2 rounded-lg flex-shrink-0 transition-all ${
                        input.trim()
                          ? 'bg-white text-black shadow-md'
                          : 'bg-white/5 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Footer Text */}
              <p className="text-xs text-gray-600 text-center mt-3">
                NOIR can make mistakes. Consider checking important information.
              </p>
            </form>
          </div>
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
