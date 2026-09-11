import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Odbiera linki z maili Supabase — potwierdzenie rejestracji i reset hasła.
 *
 * Obsługuje oba formaty linku:
 *  - ?code=...                 domyślny szablon maila (przepływ PKCE)
 *  - ?token_hash=...&type=...  szablon z {{ .TokenHash }} — działa też, gdy
 *                              użytkownik otworzy link na innym urządzeniu
 */

const EMAIL_OTP_TYPES = [
  'signup',
  'recovery',
  'invite',
  'magiclink',
  'email',
  'email_change',
] as const

type EmailOtpTypeName = (typeof EMAIL_OTP_TYPES)[number]

function isEmailOtpType(value: string | null): value is EmailOtpTypeName {
  return value !== null && EMAIL_OTP_TYPES.some(allowed => allowed === value)
}

// Whitelista ścieżek docelowych — chroni przed open redirect na obcą domenę.
const ALLOWED_NEXT_PATHS = new Set(['/', '/account/settings', '/account/update-password'])

function safeNext(raw: string | null, fallback: string): string {
  return raw !== null && ALLOWED_NEXT_PATHS.has(raw) ? raw : fallback
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  // Reset hasła prowadzi do formularza nowego hasła, potwierdzenie konta — na stronę główną.
  const next = safeNext(
    searchParams.get('next'),
    type === 'recovery' ? '/account/update-password' : '/'
  )

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, origin))
    console.error('[auth/callback] exchangeCodeForSession:', error.message)
  } else if (tokenHash && isEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(new URL(next, origin))
    console.error('[auth/callback] verifyOtp:', error.message)
  }

  return NextResponse.redirect(new URL('/account/login?error=link', origin))
}
