import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Endpoint wypisu dla nagłówka List-Unsubscribe (RFC 8058).
 *
 * Klient pocztowy (Gmail, Yahoo) wysyła tu POST po kliknięciu "Wypisz"
 * obok nadawcy — bez otwierania przeglądarki. Token w query stringu jest
 * jedyną autoryzacją, dlatego jest UUID-em i nie da się go zgadnąć.
 */

const TokenSchema = z.string().uuid()

async function unsubscribe(token: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)

  if (error) {
    console.error('[newsletter] wypis one-click nieudany:', error.message)
    return false
  }
  return true
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const parsed = TokenSchema.safeParse(req.nextUrl.searchParams.get('token'))

  if (!parsed.success) {
    return NextResponse.json({ error: 'Nieprawidłowy token.' }, { status: 400 })
  }

  const ok = await unsubscribe(parsed.data)

  // RFC 8058 oczekuje 2xx przy powodzeniu — treść nie jest nigdzie pokazywana
  return ok
    ? NextResponse.json({ status: 'unsubscribed' })
    : NextResponse.json({ error: 'Wypis nieudany.' }, { status: 500 })
}

/**
 * Część klientów odwiedza adres z nagłówka zwykłym GET-em zamiast POST-em.
 * Nie wypisujemy wtedy od razu — skanery linków w skrzynkach pocztowych
 * potrafią klikać w tle. Kierujemy na stronę z przyciskiem potwierdzenia.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get('token') ?? ''
  const target = new URL('/newsletter/wypisz', req.nextUrl.origin)
  if (token) target.searchParams.set('token', token)

  return NextResponse.redirect(target)
}
