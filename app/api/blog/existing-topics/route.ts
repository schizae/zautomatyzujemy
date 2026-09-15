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

  // Generator potrzebuje obu list naraz: artykułów, żeby wiedzieć, które tematy
  // z planu treści są wykorzystane, i slugów usług, żeby bramka jakości mogła
  // sprawdzić, czy odnośniki wewnętrzne prowadzą do istniejących stron.
  const [postsResult, servicesResult] = await Promise.all([
    supabase
      .from('posts')
      .select('title, tags, slug, target_keyword')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(100),
    supabase.from('services').select('slug').eq('is_active', true),
  ])

  if (postsResult.error) {
    console.error('[/api/blog/existing-topics] Błąd Supabase:', postsResult.error.message)
    return NextResponse.json({ error: postsResult.error.message }, { status: 500 })
  }

  const topics = (postsResult.data ?? []).map((post) => ({
    title: post.title as string,
    slug: post.slug as string,
    tags: (post.tags as string[]) ?? [],
    targetKeyword: (post.target_keyword as string | null) ?? null,
  }))

  const services = (servicesResult.data ?? []).map((service) => service.slug as string)

  return NextResponse.json({ topics, services })
}
