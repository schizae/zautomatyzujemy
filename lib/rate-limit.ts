/**
 * In-memory rate limiter for API routes.
 * For production with multiple instances, replace with Upstash Redis.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimiterOptions {
  /** Max requests allowed in the window */
  maxRequests: number
  /** Window duration in milliseconds */
  windowMs: number
}

// Use globalThis to persist across Next.js HMR reloads in development
const globalStores = globalThis as typeof globalThis & {
  __rateLimitStores?: Map<string, Map<string, RateLimitEntry>>
}

if (!globalStores.__rateLimitStores) {
  globalStores.__rateLimitStores = new Map()
}

function getStore(name: string): Map<string, RateLimitEntry> {
  const stores = globalStores.__rateLimitStores!
  let store = stores.get(name)
  if (!store) {
    store = new Map()
    stores.set(name, store)
  }
  return store
}

export function createRateLimiter(name: string, options: RateLimiterOptions) {
  const { maxRequests, windowMs } = options
  const store = getStore(name)

  // Periodic cleanup to prevent memory leak (every 60s)
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 60_000).unref()

  return {
    check(key: string): { success: boolean; remaining: number; resetAt: number } {
      const now = Date.now()
      const entry = store.get(key)

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs })
        return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs }
      }

      entry.count++
      if (entry.count > maxRequests) {
        return { success: false, remaining: 0, resetAt: entry.resetAt }
      }

      return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
    },
  }
}
