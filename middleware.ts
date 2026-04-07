import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { hashSecret, timingSafeEqual } from '@/lib/auth-utils'

const ADMIN_COOKIE_NAME = 'admin_session'

async function isValidAdminSession(cookieValue: string): Promise<boolean> {
  const adminSecret = process.env['ADMIN_SECRET']
  if (!adminSecret) return false
  const expected = await hashSecret(adminSecret)
  return timingSafeEqual(expected, cookieValue)
}

function createSupabaseMiddlewareClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseAnonKey) return null

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  // ─── Odświeżanie sesji Supabase (wymagane przez @supabase/ssr) ─────────
  const supabase = createSupabaseMiddlewareClient(request, response)
  if (supabase) {
    // getUser() odświeża JWT token w cookies jeśli wygasł
    await supabase.auth.getUser()
  }

  // ─── Ochrona /admin/* (istniejąca logika — admin_session cookie) ────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)

    if (!sessionCookie || !(await isValidAdminSession(sessionCookie.value))) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ─── Ochrona /account/settings (wymaga sesji Supabase) ─────────────────
  if (pathname.startsWith('/account/settings')) {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const loginUrl = new URL('/account/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
    } else {
      // Brak konfiguracji Supabase — redirect na login
      const loginUrl = new URL('/account/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/account/settings/:path*'],
}
