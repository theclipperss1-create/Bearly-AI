import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, increment, Timestamp, setDoc, collection } from 'firebase/firestore'
import { DEFAULT_LIMITS } from '@/lib/types'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model, userId, userEmail } = await request.json()

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // Check usage limits
    let userUsage: any = null
    if (userId && db) {
      const usageRef = doc(db, 'user_usage', userId)
      const usageSnap = await getDoc(usageRef)

      if (usageSnap.exists()) {
        userUsage = usageSnap.data()
        const today = new Date().toISOString().split('T')[0]
        if (userUsage.lastResetDate !== today) {
          await updateDoc(usageRef, { tokensUsedToday: 0, lastResetDate: today })
          userUsage.tokensUsedToday = 0
        }
      } else {
        userUsage = {
          userId,
          userEmail: userEmail || '',
          tier: 'free',
          tokensUsedToday: 0,
          dailyLimit: DEFAULT_LIMITS.defaultDailyLimit,
          lastResetDate: new Date().toISOString().split('T')[0],
          totalTokensUsed: 0,
        }
        await setDoc(usageRef, { ...userUsage, createdAt: Timestamp.now(), updatedAt: Timestamp.now() })
      }

      const estimatedTokens = messages.reduce((acc: number, m: any) => acc + estimateTokens(m.content), 0)

      if (userUsage.tier !== 'admin' || userUsage.dailyLimit !== -1) {
        if (userUsage.tokensUsedToday + estimatedTokens > userUsage.dailyLimit) {
          return NextResponse.json(
            { error: 'Daily limit exceeded', remaining: userUsage.dailyLimit - userUsage.tokensUsedToday, limit: userUsage.dailyLimit },
            { status: 429 }
          )
        }
      }
    }

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'NOIR AI Chatbot',
      },
      body: JSON.stringify({ model, messages, stream: true }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || 'Failed to get response' }, { status: response.status })
    }

    const encoder = new TextEncoder()
    let totalTokens = 0
    let buffer = ''

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) { controller.close(); return }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk

            const parts = buffer.split('\n\n')
            buffer = parts.pop() || ''

            for (const part of parts) {
              const lines = part.split('\n')
              for (const line of lines) {
                const trimmedLine = line.trim()
                if (trimmedLine.startsWith('data: ')) {
                  const data = trimmedLine.slice(6).trim()
                  if (data === '[DONE]') continue

                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content || ''
                    if (content) {
                      controller.enqueue(encoder.encode(content))
                      totalTokens += estimateTokens(content)
                    }
                  } catch (e) { /* ignore */ }
                }
              }
            }
          }
        } finally {
          // Update usage
          if (userId && db && totalTokens > 0) {
            try {
              const usageRef = doc(db, 'user_usage', userId)
              await updateDoc(usageRef, {
                tokensUsedToday: increment(totalTokens),
                totalTokensUsed: increment(totalTokens),
                updatedAt: Timestamp.now(),
              })
            } catch (e) { console.error('Error updating usage:', e) }
          }
          controller.close()
        }
      },
    })

    const decoder = new TextDecoder()
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
