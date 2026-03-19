import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Estimate tokens
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

    // Check usage limits if user is provided
    let userUsage: any = null
    if (userId) {
      try {
        const { getFirestore } = await import('firebase/firestore')
        const { getFirebaseApp } = await import('@/lib/firebase')
        const { doc, getDoc, updateDoc, increment, Timestamp } = await import('firebase/firestore')
        const { DEFAULT_LIMITS } = await import('@/lib/types')

        const app = await getFirebaseApp()
        if (app) {
          const db = getFirestore(app)
          const usageRef = doc(db, 'user_usage', userId)
          const usageSnap = await getDoc(usageRef)

          if (usageSnap.exists()) {
            userUsage = usageSnap.data()
            
            // Reset daily usage if needed
            const today = new Date().toISOString().split('T')[0]
            if (userUsage.lastResetDate !== today) {
              await updateDoc(usageRef, {
                tokensUsedToday: 0,
                lastResetDate: today,
              })
              userUsage.tokensUsedToday = 0
            }
          } else {
            // Create new user usage
            userUsage = {
              userId,
              userEmail: userEmail || '',
              tier: 'free',
              tokensUsedToday: 0,
              dailyLimit: DEFAULT_LIMITS.defaultDailyLimit,
              lastResetDate: new Date().toISOString().split('T')[0],
              totalTokensUsed: 0,
            }
            await updateDoc(usageRef, {
              ...userUsage,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            })
          }

          // Check if user has enough tokens
          const estimatedTokens = messages.reduce((acc: number, m: any) => acc + estimateTokens(m.content), 0)
          
          if (userUsage.tier !== 'admin' || userUsage.dailyLimit !== -1) {
            if (userUsage.tokensUsedToday + estimatedTokens > userUsage.dailyLimit) {
              return NextResponse.json(
                { 
                  error: 'Daily limit exceeded',
                  remaining: userUsage.dailyLimit - userUsage.tokensUsedToday,
                  limit: userUsage.dailyLimit,
                  upgrade: 'Contact admin to upgrade your tier'
                },
                { status: 429 }
              )
            }
          }
        }
      } catch (error) {
        console.error('Error checking usage:', error)
        // Continue without limit check if Firestore fails
      }
    }

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Chatbot',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Failed to get response from OpenRouter' },
        { status: response.status }
      )
    }

    // Create a streaming response with token tracking
    const encoder = new TextEncoder()
    let totalTokens = 0

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  if (content) {
                    controller.enqueue(encoder.encode(content))
                    totalTokens += estimateTokens(content)
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
        } finally {
          // Update user usage after streaming completes
          if (userId && totalTokens > 0) {
            try {
              const { getFirestore } = await import('firebase/firestore')
              const { getFirebaseApp } = await import('@/lib/firebase')
              const { doc, updateDoc, increment, Timestamp } = await import('firebase/firestore')

              const app = await getFirebaseApp()
              if (app) {
                const db = getFirestore(app)
                const usageRef = doc(db, 'user_usage', userId)
                await updateDoc(usageRef, {
                  tokensUsedToday: increment(totalTokens),
                  totalTokensUsed: increment(totalTokens),
                  updatedAt: Timestamp.now(),
                })
              }
            } catch (error) {
              console.error('Error updating usage:', error)
            }
          }
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
