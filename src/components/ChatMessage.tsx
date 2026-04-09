'use client'

import { motion } from 'framer-motion'
import { Message } from '@/app/page'

interface ChatMessageProps {
  message: Message
  onCopy: (text: string, id: string) => void
  copiedId: string | null
  onRegenerate?: () => void
  isLastMessage: boolean
}

export default function ChatMessage({ message, onCopy, copiedId, onRegenerate, isLastMessage }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      data-testid="message"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`group border-b border-white/5 ${
        isUser ? 'bg-transparent' : 'bg-white/[0.02]'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {isUser ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                U
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {/* Sender Name */}
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              {isUser ? 'You' : 'NOIR'}
            </div>

            {/* Message Text */}
            <div className={`text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap ${
              isUser ? 'text-white/90' : 'text-white/95'
            }`}>
              {message.content}
            </div>

            {/* Actions - Only show on hover for assistant messages */}
            {!isUser && (
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onCopy(message.content, message.id)}
                  className="p-1.5 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
                  aria-label="Copy message"
                >
                  {copiedId === message.id ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                
                {isLastMessage && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
                    aria-label="Regenerate response"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058M20.97 12a9 9 0 11-1.97-5.644M15 11l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-600 mt-2">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
