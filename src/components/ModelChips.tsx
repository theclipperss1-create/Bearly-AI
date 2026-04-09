'use client'

import { motion } from 'framer-motion'

interface Model {
  id: string
  name: string
  shortName: string
  icon: string
  description: string
}

interface ModelChipsProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
}

const AVAILABLE_MODELS: Model[] = [
  { 
    id: 'openai/gpt-3.5-turbo', 
    name: 'GPT-3.5 Turbo',
    shortName: 'Kilat',
    icon: '⚡',
    description: 'Fast & efficient' 
  },
  { 
    id: 'stepfun/step-3.5-flash', 
    name: 'Step 3.5 Flash',
    shortName: 'Efisien',
    icon: '✨',
    description: 'Completely free' 
  },
  { 
    id: 'qwen/qwen-2.5-72b-instruct', 
    name: 'Qwen 2.5 72B',
    shortName: 'Jenius',
    icon: '🧠',
    description: 'Best value - recommended' 
  },
  { 
    id: 'google/gemma-2-9b-it', 
    name: 'Gemma 2 9B',
    shortName: 'Ringan',
    icon: '🍃',
    description: 'Lightweight & fast' 
  },
]

export default function ModelChips({ selectedModel, onModelChange }: ModelChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {AVAILABLE_MODELS.map((model, index) => {
        const isSelected = selectedModel === model.id
        
        return (
          <motion.button
            key={model.id}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => onModelChange(model.id)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all touch-target-lg ${
              isSelected
                ? 'bg-white/15 text-white border border-white/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-gray-300'
            }`}
            style={{
              backdropFilter: 'blur(10px)',
              boxShadow: isSelected 
                ? '0 0 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-1.5 text-sm sm:text-base">{model.icon}</span>
            <span className="hidden sm:inline">{model.shortName}</span>
            <span className="sm:hidden">{model.icon}</span>
            
            {/* Tooltip on hover (desktop only) */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-[#161616] border border-[#1A1A1A] text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden sm:block">
              {model.name} - {model.description}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
