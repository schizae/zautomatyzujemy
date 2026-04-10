import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// ─── Weryfikacja sekretu (timing-safe) ───────────────────────────────────────

function verifySecret(received: string, expected: string): boolean {
  if (received.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  } catch {
    return false
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env['N8N_WEBHOOK_SECRET']
  if (!secret) {
    console.error('[/api/blog/existing-topics] Brak N8N_WEBHOOK_SECRET.')
    return NextResponse.json({ error: 'Konfiguracja serwera.' }, { status: 500 })
  }

  const receivedSecret = req.headers.get('x-webhook-secret') ?? ''
  if (!verifySecret(receivedSecret, secret)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('posts')
    .select('title, tags, slug')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[/api/blog/existing-topics] Błąd Supabase:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const topics = (data ?? []).map((post) => ({
    title: post.title as string,
    slug: post.slug as string,
    tags: (post.tags as string[]) ?? [],
  }))

  return NextResponse.json({ topics })
}
