// Usage tracking and limits management

import { getFirestore } from './firebase'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import type { UserUsage, UserTier, AdminConfig } from './types'
import { DEFAULT_LIMITS, estimateTokens, shouldResetUsage } from './types'

// Get or create user usage document
export async function getOrCreateUserUsage(userId: string, userEmail: string): Promise<UserUsage> {
  try {
    const db = await getFirestore()
    if (!db) throw new Error('Firestore not initialized')

    const usageRef = doc(db, 'user_usage', userId)
    const usageSnap = await getDoc(usageRef)

    if (usageSnap.exists()) {
      const data = usageSnap.data()
      
      // Check if we need to reset daily usage
      if (shouldResetUsage(data.lastResetDate)) {
        const newUsage = {
          tokensUsedToday: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
          updatedAt: Timestamp.now(),
        }
        await updateDoc(usageRef, newUsage)
        return {
          ...data,
          ...newUsage,
          createdAt: data.createdAt.toDate(),
          updatedAt: new Date(),
        } as UserUsage
      }

      return {
        userId: data.userId,
        tier: data.tier,
        tokensUsedToday: data.tokensUsedToday,
        dailyLimit: data.dailyLimit,
        lastResetDate: data.lastResetDate,
        totalTokensUsed: data.totalTokensUsed,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as UserUsage
    }

    // Create new user usage
    const today = new Date().toISOString().split('T')[0]
    const newUsage: UserUsage = {
      userId,
      tier: 'free', // Default tier
      tokensUsedToday: 0,
      dailyLimit: DEFAULT_LIMITS.defaultDailyLimit,
      lastResetDate: today,
      totalTokensUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(usageRef, {
      ...newUsage,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return newUsage
  } catch (error) {
    console.error('Error getting user usage:', error)
    // Return default free usage on error
    return {
      userId,
      tier: 'free',
      tokensUsedToday: 0,
      dailyLimit: DEFAULT_LIMITS.defaultDailyLimit,
      lastResetDate: new Date().toISOString().split('T')[0],
      totalTokensUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
}

// Update user token usage
export async function updateUserUsage(
  userId: string,
  tokensUsed: number
): Promise<void> {
  try {
    const db = await getFirestore()
    if (!db) return

    const usageRef = doc(db, 'user_usage', userId)
    await updateDoc(usageRef, {
      tokensUsedToday: increment(tokensUsed),
      totalTokensUsed: increment(tokensUsed),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating user usage:', error)
  }
}

// Check if user has enough tokens
export async function checkUserLimit(
  userId: string,
  userEmail: string,
  estimatedTokens: number
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  try {
    const usage = await getOrCreateUserUsage(userId, userEmail)
    
    // Admin with unlimited
    if (usage.tier === 'admin' && usage.dailyLimit === -1) {
      return { allowed: true, remaining: Infinity, limit: Infinity }
    }

    const remaining = usage.dailyLimit - usage.tokensUsedToday
    
    if (remaining >= estimatedTokens) {
      return { allowed: true, remaining, limit: usage.dailyLimit }
    }

    return { allowed: false, remaining, limit: usage.dailyLimit }
  } catch (error) {
    console.error('Error checking user limit:', error)
    return { allowed: false, remaining: 0, limit: 0 }
  }
}

// Update user tier (admin only)
export async function updateUserTier(
  userId: string,
  newTier: UserTier
): Promise<void> {
  try {
    const db = await getFirestore()
    if (!db) return

    const usageRef = doc(db, 'user_usage', userId)
    
    let dailyLimit = DEFAULT_LIMITS.defaultDailyLimit
    if (newTier === 'premium') dailyLimit = DEFAULT_LIMITS.premiumDailyLimit
    if (newTier === 'admin') dailyLimit = DEFAULT_LIMITS.adminDailyLimit

    await updateDoc(usageRef, {
      tier: newTier,
      dailyLimit,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating user tier:', error)
  }
}

// Get all users usage (admin only)
export async function getAllUsersUsage(): Promise<UserUsage[]> {
  try {
    const db = await getFirestore()
    if (!db) return []

    const usageRef = collection(db, 'user_usage')
    const snapshot = await getDocs(usageRef)
    
    return snapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as unknown as UserUsage[]
  } catch (error) {
    console.error('Error getting all users usage:', error)
    return []
  }
}

// Get admin config
export async function getAdminConfig(): Promise<AdminConfig> {
  try {
    const db = await getFirestore()
    if (!db) return DEFAULT_LIMITS

    const configRef = doc(db, 'config', 'admin')
    const configSnap = await getDoc(configRef)

    if (configSnap.exists()) {
      return configSnap.data() as AdminConfig
    }

    return DEFAULT_LIMITS
  } catch (error) {
    console.error('Error getting admin config:', error)
    return DEFAULT_LIMITS
  }
}

// Update admin config (add admin email)
export async function updateAdminConfig(config: Partial<AdminConfig>): Promise<void> {
  try {
    const db = await getFirestore()
    if (!db) return

    const configRef = doc(db, 'config', 'admin')
    await updateDoc(configRef, config)
  } catch (error) {
    console.error('Error updating admin config:', error)
  }
}

// Check if user is admin
export async function isAdmin(userEmail: string): Promise<boolean> {
  try {
    const config = await getAdminConfig()
    return config.adminEmails.includes(userEmail)
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
