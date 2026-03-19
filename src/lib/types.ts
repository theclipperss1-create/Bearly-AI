// User types and usage limits
export type UserTier = 'free' | 'premium' | 'admin'

export interface UserUsage {
  userId: string
  tier: UserTier
  tokensUsedToday: number
  dailyLimit: number
  lastResetDate: string // YYYY-MM-DD
  totalTokensUsed: number
  createdAt: Date
  updatedAt: Date
}

export interface AdminConfig {
  adminEmails: string[] // Emails yang punya akses admin
  defaultDailyLimit: number // Limit untuk free user
  premiumDailyLimit: number // Limit untuk premium user
  adminDailyLimit: number // Limit untuk admin ( -1 = unlimited)
}

// Default limits
export const DEFAULT_LIMITS: AdminConfig = {
  adminEmails: [], // Set your email here
  defaultDailyLimit: 10000, // 10K tokens untuk free user
  premiumDailyLimit: 100000, // 100K tokens untuk premium
  adminDailyLimit: -1, // Unlimited untuk admin
}

// Estimate tokens (rough estimate: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Check if user can make a request
export function canMakeRequest(usage: UserUsage, estimatedTokens: number): boolean {
  if (usage.tier === 'admin' && usage.dailyLimit === -1) return true
  return usage.tokensUsedToday + estimatedTokens <= usage.dailyLimit
}

// Reset daily usage if it's a new day
export function shouldResetUsage(lastResetDate: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return lastResetDate !== today
}
