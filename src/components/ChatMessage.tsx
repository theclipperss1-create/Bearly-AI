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
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] lg:max-w-[75%] rounded-2xl ${
          isUser ? '' : ''
        }`}
        style={{
          background: isUser 
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(34, 211, 238, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(10px)',
          border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isUser 
            ? '0 8px 30px rgba(59, 130, 246, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.1)'
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div className="px-5 py-3.5">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-white">{message.content}</p>
        </div>
        <div className="flex items-center justify-between px-5 py-2 border-t border-white/10">
          <span className={`text-xs ${isUser ? 'text-white/50' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipWrapper tooltip={copiedId === message.id ? 'Copied!' : 'Copy'}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onCopy(message.content, message.id)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors relative"
              >
                {copiedId === message.id ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </motion.button>
            </TooltipWrapper>
            {!isUser && isLastMessage && onRegenerate && (
              <TooltipWrapper tooltip="Regenerate">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors relative"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058M20.97 12a9 9 0 11-1.97-5.644M15 11l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </motion.button>
              </TooltipWrapper>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Tooltip Component
function TooltipWrapper({ tooltip, children }: { tooltip: string, children: React.ReactNode }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded-md bg-gray-900 border border-gray-700 text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50"
           style={{
             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
           }}>
        {tooltip}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
      </div>
    </div>
  )
}
