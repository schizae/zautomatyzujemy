import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { resolvePublishState } from '@/lib/ai-disclosure'
import { getBlogPublishMode } from '@/lib/app-settings'
import { sendDraftAwaitingReview } from '@/lib/email/resend'
import type { BlogPublishPayload } from '@/types'

// ─── Walidacja ────────────────────────────────────────────────────────────────

const BlogPublishSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki.'),
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  excerpt: z.string().max(500).optional(),
  cover_image: z.string().url().nullable().optional(),
  author: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  published_at: z.string().datetime().optional(),
  ai_generated: z.boolean().optional(),
  ai_model: z.string().max(100).optional(),
})

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Weryfikacja sekretu
  const secret = process.env['N8N_WEBHOOK_SECRET']
  if (!secret) {
    console.error('[/api/blog/publish] Brak N8N_WEBHOOK_SECRET w zmiennych środowiskowych.')
    return NextResponse.json({ error: 'Konfiguracja serwera.' }, { status: 500 })
  }

  const receivedSecret = req.headers.get('x-webhook-secret') ?? ''
  if (!verifySecret(receivedSecret, secret)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  // 2. Parsowanie body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON.' }, { status: 400 })
  }

  // 3. Walidacja payloadu
  const parsed = BlogPublishSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Błąd walidacji.', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const payload = parsed.data as BlogPublishPayload

  // 4. Zapis do bazy danych
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('posts')
    .select('id, is_published, published_at, reviewed_at')
    .eq('slug', payload.slug)
    .maybeSingle()

  const mode = await getBlogPublishMode()
  const publishState = resolvePublishState(
    mode,
    new Date().toISOString(),
    payload.published_at ?? null,
    existing
      ? {
          is_published: existing.is_published,
          published_at: existing.published_at,
          reviewed_at: existing.reviewed_at,
        }
      : null
  )

  const postData = {
    slug: payload.slug,
    title: payload.title,
    content: payload.content,
    excerpt: payload.excerpt ?? null,
    cover_image: payload.cover_image ?? null,
    author: payload.author ?? 'Zautomatyzujemy',
    tags: payload.tags ?? [],
    // Znacznik zapisujemy w obu trybach. W trybie redakcyjnym zgodność opiera się
    // na kontroli redakcyjnej, w automatycznym na znaczniku — jedno zabezpiecza drugie.
    ai_generated: payload.ai_generated ?? false,
    ai_model: payload.ai_model ?? null,
    ...publishState,
  }

  if (existing) {
    // Aktualizacja istniejącego posta (np. retry z n8n)
    const { error } = await supabase
      .from('posts')
      .update(postData)
      .eq('slug', payload.slug)

    if (error) {
      console.error('[/api/blog/publish] Błąd aktualizacji:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Nowy post
    const { error } = await supabase.from('posts').insert(postData)

    if (error) {
      console.error('[/api/blog/publish] Błąd zapisu:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // 5. Powiadomienie o szkicu czekającym na zatwierdzenie
  //
  // Await, nie fire-and-forget: na Vercelu funkcja kończy się po odpowiedzi
  // i porzucona obietnica ginie. Błąd wysyłki nie może jednak wywrócić publikacji.
  if (!publishState.is_published) {
    try {
      await sendDraftAwaitingReview(payload.title, payload.slug)
    } catch (err) {
      console.error('[/api/blog/publish] Nie udało się wysłać powiadomienia o szkicu:', err)
    }
  }

  // 6. Rewalidacja cache
  revalidatePath('/blog')
  revalidatePath(`/blog/${payload.slug}`)
  revalidatePath('/')

  const statusLabel = publishState.is_published ? 'Opublikowano' : 'Zapisano szkic'
  console.log(`[/api/blog/publish] ${statusLabel}: "${payload.title}" (${payload.slug})`)

  return NextResponse.json({
    success: true,
    slug: payload.slug,
    url: `/blog/${payload.slug}`,
    published: publishState.is_published,
  })
}
