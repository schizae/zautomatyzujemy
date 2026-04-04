import { NextRequest, NextResponse } from 'next/server'
import { hashSecret, timingSafeEqual } from '@/lib/auth-utils'

const ADMIN_COOKIE_NAME = 'admin_session'

async function isValidSession(cookieValue: string): Promise<boolean> {
  const adminSecret = process.env['ADMIN_SECRET']
  if (!adminSecret) return false
  const expected = await hashSecret(adminSecret)
  return timingSafeEqual(expected, cookieValue)
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)

    if (!sessionCookie || !(await isValidSession(sessionCookie.value))) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
