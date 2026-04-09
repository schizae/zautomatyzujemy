import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
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
  cover_image: z.string().url().optional(),
  author: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  published_at: z.string().datetime().optional(),
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
    .select('id')
    .eq('slug', payload.slug)
    .maybeSingle()

  const postData = {
    slug: payload.slug,
    title: payload.title,
    content: payload.content,
    excerpt: payload.excerpt ?? null,
    cover_image: payload.cover_image ?? null,
    author: payload.author ?? 'Zautomatyzujemy',
    tags: payload.tags ?? [],
    is_published: true,
    published_at: payload.published_at ?? new Date().toISOString(),
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

  // 5. Rewalidacja cache
  revalidatePath('/blog')
  revalidatePath(`/blog/${payload.slug}`)
  revalidatePath('/')

  console.log(`[/api/blog/publish] Opublikowano: "${payload.title}" (${payload.slug})`)

  return NextResponse.json({
    success: true,
    slug: payload.slug,
    url: `/blog/${payload.slug}`,
  })
}
