'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Model {
  id: string
  name: string
}

interface ModelSwitcherProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  isOpen: boolean
  onToggle: () => void
}

const AVAILABLE_MODELS: Model[] = [
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'stepfun/step-3.5-flash', name: 'Step 3.5 Flash (free)' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' },
]

export default function ModelSwitcher({
  selectedModel,
  onModelChange,
  isOpen,
  onToggle,
}: ModelSwitcherProps) {
  const selectedModelName = AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name

  return (
    <div className="relative">
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-700/50 bg-gray-800/30 text-gray-300 hover:bg-gray-800/50 transition-all relative group"
        style={{
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        }}
      >
        <motion.svg 
          className="w-4 h-4 text-blue-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </motion.svg>
        <span className="text-sm font-medium">{selectedModelName}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        
        {/* Tooltip */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
             style={{
               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
             }}>
          Switch model
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onToggle()}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 12, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-700/50 bg-gray-900 shadow-2xl overflow-hidden z-50"
              style={{
                backdropFilter: 'blur(40px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="px-4 py-3 border-b border-gray-700/50"
                   style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Model</p>
              </div>
              {AVAILABLE_MODELS.map((model, index) => (
                <motion.button
                  key={model.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    onModelChange(model.id)
                    onToggle()
                  }}
                  className={`w-full px-4 py-3.5 text-left text-sm hover:bg-gray-800/50 transition-colors flex items-center justify-between group/item ${
                    selectedModel === model.id 
                      ? 'text-blue-400 font-semibold' 
                      : 'text-gray-300'
                  }`}
                >
                  <span>{model.name}</span>
                  {selectedModel === model.id && (
                    <motion.svg 
                      className="w-5 h-5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </motion.svg>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
