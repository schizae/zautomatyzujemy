interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

/**
 * Prosta rate limiter in-memory (per process/instancja).
 * Zwraca true jeśli request jest dozwolony, false gdy limit przekroczony.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return true
  }

  if (entry.count >= options.maxRequests) {
    return false
  }

  entry.count++
  return true
}
