import { cookies } from 'next/headers'
import { hashSecret, timingSafeEqual } from '@/lib/auth-utils'

export const ADMIN_COOKIE_NAME = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

/** Verify password and set session cookie. Returns true on success. */
export async function loginAdmin(password: string): Promise<boolean> {
  const adminSecret = process.env['ADMIN_SECRET']
  if (!adminSecret) return false

  const expected = await hashSecret(adminSecret)
  const received = await hashSecret(password)

  if (!timingSafeEqual(expected, received)) return false

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return true
}

/** Check if current request has a valid admin session cookie. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const adminSecret = process.env['ADMIN_SECRET']
  if (!adminSecret) return false

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)
  if (!sessionCookie) return false

  const expected = await hashSecret(adminSecret)
  return timingSafeEqual(expected, sessionCookie.value)
}

/** Destroy the admin session cookie. */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}
