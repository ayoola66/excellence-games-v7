import { NextRequest, NextResponse } from 'next/server'
import { AuthError, AuthErrorType } from '../errors/authErrors'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum number of requests allowed in the window
}

interface RateLimitEntry {
  count: number
  resetTime: number
  failedAttempts: number
  lastFailedTime: number
}

// In-memory stores for rate limiting
const userLoginStore = new Map<string, RateLimitEntry>()
const adminLoginStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  Array.from(userLoginStore.entries()).forEach(([key, entry]) => {
    if (entry.resetTime <= now) {
      userLoginStore.delete(key)
    }
  })
  Array.from(adminLoginStore.entries()).forEach(([key, entry]) => {
    if (entry.resetTime <= now) {
      adminLoginStore.delete(key)
    }
  })
}, 60000) // Clean up every minute

const USER_RATE_LIMIT = 10 // attempts per window
const USER_RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 minutes
const USER_MAX_FAILED_ATTEMPTS = 3 // Max failed attempts before extended lockout
const USER_FAILED_LOCKOUT_TIME = 30 * 60 * 1000 // 30 minutes lockout after max failed attempts

const ADMIN_RATE_LIMIT = 5 // attempts per window
const ADMIN_RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const ADMIN_MAX_FAILED_ATTEMPTS = 3 // Max failed attempts before extended lockout
const ADMIN_FAILED_LOCKOUT_TIME = 60 * 60 * 1000 // 1 hour lockout after max failed attempts

function getRateLimitResponse(remainingTime: number, isFailedAttempt: boolean = false) {
  const minutes = Math.ceil(remainingTime / 1000 / 60)
  const seconds = Math.ceil(remainingTime / 1000)
  
  const timeMessage = minutes > 1 
    ? `${minutes} minutes` 
    : seconds > 30 
      ? '1 minute' 
      : `${seconds} seconds`

  const message = isFailedAttempt
    ? `Too many failed attempts. Account is locked for ${timeMessage} for security.`
    : `Too many attempts. Please try again in ${timeMessage}.`

  return NextResponse.json(
    {
      error: {
        type: AuthErrorType.RATE_LIMIT,
        message
      }
    },
    { status: 429 }
  )
}

/**
 * Gets a unique identifier for the client
 * @param req Next.js request object
 * @returns Client identifier string
 */
function getClientIdentifier(req: NextRequest): string {
  // Use X-Forwarded-For header if available (e.g., behind proxy)
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const clientIp = forwardedFor 
    ? forwardedFor.split(',')[0].trim() 
    : realIp || 'unknown'
  
  // Include user agent to further differentiate clients
  const userAgent = req.headers.get('user-agent') || 'unknown'
  
  // Hash the identifier to protect privacy and reduce key size
  return Buffer.from(`${clientIp}:${userAgent}`).toString('base64')
}

/**
 * Rate limiter for admin login attempts
 * More restrictive than regular endpoints
 */
export async function adminLoginRateLimiter(req: NextRequest, failed: boolean = false): Promise<NextResponse | null> {
  const clientId = getClientIdentifier(req)
  const now = Date.now()
  
  let entry = adminLoginStore.get(clientId)
  
  if (!entry) {
    entry = {
      count: 0,
      resetTime: now + ADMIN_RATE_LIMIT_WINDOW,
      failedAttempts: 0,
      lastFailedTime: 0
    }
  }

  if (entry.failedAttempts >= ADMIN_MAX_FAILED_ATTEMPTS) {
    const lockoutEndTime = entry.lastFailedTime + ADMIN_FAILED_LOCKOUT_TIME
    if (now < lockoutEndTime) {
      return getRateLimitResponse(lockoutEndTime - now, true)
    }
    entry.failedAttempts = 0
  }
  
  if (entry.count >= ADMIN_RATE_LIMIT) {
    const remainingTime = entry.resetTime - now
    if (remainingTime > 0) {
      return getRateLimitResponse(remainingTime)
    }
    adminLoginStore.delete(clientId)
    entry.count = 0
  }
  
  if (now > entry.resetTime) {
    entry.count = 1
    entry.resetTime = now + ADMIN_RATE_LIMIT_WINDOW
  } else {
    entry.count++
  }

  if (failed) {
    entry.failedAttempts++
    entry.lastFailedTime = now
  }
  
  adminLoginStore.set(clientId, entry)
  return null
}

/**
 * Rate limiter for user login attempts
 * Less restrictive than admin login
 */
export async function userLoginRateLimiter(req: NextRequest, failed: boolean = false): Promise<NextResponse | null> {
  const clientId = getClientIdentifier(req)
  const now = Date.now()
  
  let entry = userLoginStore.get(clientId)
  
  if (!entry) {
    entry = {
      count: 0,
      resetTime: now + USER_RATE_LIMIT_WINDOW,
      failedAttempts: 0,
      lastFailedTime: 0
    }
  }

  if (entry.failedAttempts >= USER_MAX_FAILED_ATTEMPTS) {
    const lockoutEndTime = entry.lastFailedTime + USER_FAILED_LOCKOUT_TIME
    if (now < lockoutEndTime) {
      return getRateLimitResponse(lockoutEndTime - now, true)
    }
    entry.failedAttempts = 0
  }
  
  if (entry.count >= USER_RATE_LIMIT) {
    const remainingTime = entry.resetTime - now
    if (remainingTime > 0) {
      return getRateLimitResponse(remainingTime)
    }
    userLoginStore.delete(clientId)
    entry.count = 0
  }
  
  if (now > entry.resetTime) {
    entry.count = 1
    entry.resetTime = now + USER_RATE_LIMIT_WINDOW
  } else {
    entry.count++
  }

  if (failed) {
    entry.failedAttempts++
    entry.lastFailedTime = now
  }
  
  userLoginStore.set(clientId, entry)
  return null
}

/**
 * Rate limiter for general API endpoints
 */
export async function apiRateLimiter(req: NextRequest): Promise<NextResponse | null> {
  const config: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120 // 120 requests per minute
  }
  
  try {
    checkRateLimit(req, config)
    return null
  } catch (error) {
    if (error instanceof AuthError && error.type === AuthErrorType.RATE_LIMIT) {
      return NextResponse.json(
        { error: error.toJSON().error },
        { status: 429 }
      )
    }
    throw error
  }
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Rate limiter middleware
 * @param req Next.js request object
 * @param config Rate limit configuration
 * @throws AuthError if rate limit is exceeded
 */
function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120 // 120 requests per minute
  }
): void {
  const clientId = getClientIdentifier(req)
  const now = Date.now()
  
  let entry = rateLimitStore.get(clientId)
  
  if (!entry) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      failedAttempts: 0,
      lastFailedTime: 0
    }
  }
  
  if (entry.count >= config.maxRequests) {
    const remainingTime = entry.resetTime - now
    if (remainingTime > 0) {
      throw new AuthError(AuthErrorType.RATE_LIMIT, {
        message: `Rate limit exceeded. Please try again in ${Math.ceil(remainingTime / 1000)} seconds.`
      })
    }
    rateLimitStore.delete(clientId)
    entry.count = 0
  }
  
  if (now > entry.resetTime) {
    entry.count = 1
    entry.resetTime = now + config.windowMs
  } else {
    entry.count++
  }
  
  rateLimitStore.set(clientId, entry)
} 