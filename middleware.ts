import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter for development
// For production, use Upstash Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = 10 // requests per minute
const WINDOW_MS = 60 * 1000 // 1 minute

export function rateLimit(identifier: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  rateLimitMap.set(identifier, record)
  return true
}

export async function middleware(request: NextRequest) {
  // Apply rate limiting to chat API
  if (request.nextUrl.pathname.startsWith('/api/chat')) {
    // Use forwarded header or fallback to anonymous
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0] ?? 'anonymous'
    const allowed = rateLimit(ip)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}
