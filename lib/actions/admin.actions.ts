'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { loginAdmin, logoutAdmin, isAdminAuthenticated } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/server'
import { createRateLimiter } from '@/lib/rate-limit'
import { setBlogPublishMode } from '@/lib/app-settings'
import type { BlogPublishMode } from '@/lib/ai-disclosure'
import type { ActionResult, Post, PageContent, Service, FaqItem, CaseStudy } from '@/types'

const UNAUTHORIZED: ActionResult = { success: false, error: 'Brak uprawnień.' }

const loginLimiter = createRateLimiter('login', {
  maxRequests: 5,     // 5 prób
  windowMs: 900_000,  // na 15 minut
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const headerStore = await headers()
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { success: withinLimit } = loginLimiter.check(ip)

  if (!withinLimit) {
    return { success: false, error: 'Zbyt wiele prób logowania. Spróbuj za 15 minut.' }
  }

  const password = formData.get('password')
  if (typeof password !== 'string' || !password) {
    return { success: false, error: 'Podaj hasło.' }
  }

  const ok = await loginAdmin(password)
  if (!ok) {
    return { success: false, error: 'Nieprawidłowe hasło.' }
  }

  redirect('/admin/blog')
}

export async function logoutAction(): Promise<void> {
  await logoutAdmin()
  redirect('/admin/login')
}

// ─── Blog — Post schema ───────────────────────────────────────────────────────

const PostSchema = z.object({
  title: z.string().min(3, 'Tytuł musi mieć min. 3 znaki.').max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki.'),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10, 'Treść musi mieć min. 10 znaków.'),
  author: z.string().max(100).optional(),
  tags: z.string().optional(), // comma-separated, parsed below
  cover_image: z.string().url('Podaj poprawny URL obrazu.').optional().or(z.literal('')),
  is_published: z.boolean().optional(),
  ai_generated: z.boolean(),
  ai_model: z.string().max(100).optional(),
})

function parseTags(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

function parsePostFormData(formData: FormData) {
  return PostSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt') || undefined,
    content: formData.get('content'),
    author: formData.get('author') || undefined,
    tags: formData.get('tags') || undefined,
    cover_image: formData.get('cover_image') || undefined,
    is_published: formData.get('is_published') === 'true',
    ai_generated: formData.get('ai_generated') === 'true',
    ai_model: formData.get('ai_model') || undefined,
  })
}

/**
 * Zapis wpisu z panelu jest decyzją człowieka: jeśli treść powstała maszynowo
 * i redaktor publikuje ją świadomie, to właśnie jest kontrola redakcyjna.
 * Szkic zostaje bez daty — nie ma czego poświadczać.
 */
function resolveReviewedAt(aiGenerated: boolean, isPublished: boolean, now: string): string | null {
  return aiGenerated && isPublished ? now : null
}

// ─── Blog — CRUD ──────────────────────────────────────────────────────────────

export async function createPostAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const parsed = parsePostFormData(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Błąd walidacji.' }
  }

  const { tags, cover_image, ai_model, ...rest } = parsed.data
  const supabase = createServiceClient()
  const now = new Date().toISOString()

  const { error } = await supabase.from('posts').insert({
    ...rest,
    tags: parseTags(tags),
    cover_image: cover_image || null,
    ai_model: ai_model || null,
    published_at: rest.is_published ? now : null,
    reviewed_at: resolveReviewedAt(rest.ai_generated, rest.is_published ?? false, now),
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function updatePostAction(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const parsed = parsePostFormData(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Błąd walidacji.' }
  }

  const { tags, cover_image, ai_model, ...rest } = parsed.data
  const supabase = createServiceClient()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('posts')
    .update({
      ...rest,
      tags: parseTags(tags),
      cover_image: cover_image || null,
      ai_model: ai_model || null,
      published_at: rest.is_published ? now : null,
      reviewed_at: resolveReviewedAt(rest.ai_generated, rest.is_published ?? false, now),
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${parsed.data.slug}`)
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const supabase = createServiceClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { success: true }
}

/**
 * Zatwierdzenie redakcyjne: publikuje szkic i zapisuje moment sprawdzenia.
 * `reviewed_at` jest dowodem kontroli redakcyjnej, na którym opiera się
 * zwolnienie z art. 50 ust. 4 — dlatego ustawiamy je tylko tutaj, po realnej
 * decyzji człowieka.
 */
export async function approvePostAction(id: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const supabase = createServiceClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('posts')
    .update({ is_published: true, published_at: now, reviewed_at: now })
    .eq('id', id)
    .select('slug')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${data.slug}`)
  revalidatePath('/admin/blog')
  return { success: true }
}

export async function setBlogPublishModeAction(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return

  // `formData.get` zwraca `string | File | null`, a TypeScript nie zawęzi tego
  // do unii literałów samym porównaniem. Wartość pochodzi z naszego ukrytego
  // pola, więc wszystko poza „auto" traktujemy jak tryb redakcyjny — czyli
  // w stronę bezpieczniejszą.
  const raw = formData.get('mode')
  const mode: BlogPublishMode = raw === 'auto' ? 'auto' : 'review'

  const { error } = await setBlogPublishMode(mode)
  if (error) {
    console.error('[setBlogPublishModeAction]', error)
    return
  }

  revalidatePath('/admin/ustawienia')
}

// ─── Blog — AI Generation ─────────────────────────────────────────────────────

const GeneratedPostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
})

/** Model redaktora AI w panelu — ta sama wartość ląduje w kolumnie `ai_model`. */
const EDITOR_MODEL = 'gemini-2.5-flash'

/** Pola, które generator wypełnia w formularzu — celowo nie cały `Post`. */
interface GeneratedPostDraft {
  title: string
  slug: string
  excerpt: string
  content: string
  tags: string[]
  author: string
  /** Formularz zapisuje to w `ai_model`, zamiast powtarzać nazwę modelu u siebie. */
  model: string
}

export async function generatePostAction(
  topic: string
): Promise<ActionResult<GeneratedPostDraft>> {
  if (!(await isAdminAuthenticated())) return { success: false, error: 'Brak uprawnień.' }
  if (!topic.trim()) {
    return { success: false, error: 'Podaj temat artykułu.' }
  }

  try {
    const { object } = await generateObject({
      model: google(EDITOR_MODEL),
      schema: GeneratedPostSchema,
      prompt: `Napisz artykuł blogowy po polsku dla Zautomatyzujemy.pl (automatyzacja procesów z AI i n8n).

Temat: ${topic}

Wymagania:
- title: chwytliwy tytuł artykułu (max 100 znaków)
- slug: slug URL z myślnikami, tylko małe litery i cyfry (np. "automatyzacja-faktur-ai")
- excerpt: opis do SEO i listingów (max 200 znaków)
- content: pełna treść artykułu w formacie Markdown, min. 600 słów, z nagłówkami ## i ###, listami i podsumowaniem
- tags: 3-5 tagów po polsku (np. ["automatyzacja", "n8n", "AI"])

Styl: profesjonalny, praktyczny, przydatny dla właścicieli firm MŚP.`,
    })

    return {
      success: true,
      data: {
        title: object.title,
        slug: object.slug,
        excerpt: object.excerpt,
        content: object.content,
        tags: object.tags,
        author: 'Zautomatyzujemy',
        model: EDITOR_MODEL,
      },
    }
  } catch (err) {
    console.error('[generatePostAction]', err)
    return { success: false, error: 'Błąd generowania artykułu przez AI.' }
  }
}

// ─── Page Content ─────────────────────────────────────────────────────────────

const ALLOWED_PAGE_CONTENT_KEYS = new Set([
  'hero_title', 'hero_subtitle', 'hero_description', 'hero_cta',
  'hero_cta_primary', 'hero_cta_secondary',
  'about_title', 'about_description', 'about_text',
  'services_title', 'services_subtitle',
  'contact_title', 'contact_description',
  'cta_title', 'cta_description',
])

export async function upsertPageContentAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const supabase = createServiceClient()
  const updates: { key: string; value: string }[] = []

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && ALLOWED_PAGE_CONTENT_KEYS.has(key)) {
      updates.push({ key, value })
    }
  }

  if (updates.length === 0) {
    return { success: false, error: 'Brak danych do zapisania.' }
  }

  for (const u of updates) {
    const { error } = await supabase
      .from('page_content')
      .update({ value: u.value })
      .eq('key', u.key)

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/')
  return { success: true }
}

// ─── Services ─────────────────────────────────────────────────────────────────

const ServiceSchema = z.object({
  title: z.string().min(2, 'Tytuł musi mieć min. 2 znaki.').max(100),
  description: z.string().min(10, 'Opis musi mieć min. 10 znaków.').max(500),
  icon: z.string().min(1).max(50),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean().optional(),
  // Slug jest kluczem trasy /uslugi/<slug>, więc zmiana adresu zrywa linki i pozycje.
  // Zostaje edytowalny, bo mapa fraz może kazać go poprawić, ale świadomie.
  slug: z
    .string()
    .min(3, 'Slug musi mieć min. 3 znaki.')
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki.'),
  subtitle: z.string().max(300).nullish(),
  content: z.string().max(20000).nullish(),
  // Limity wyższe niż to, co pokazuje wyszukiwarka. Twarde ucinanie na 60 i 160
  // zmuszałoby do liczenia znaków w trakcie pisania, a licznik w formularzu wystarczy.
  seo_title: z.string().max(70).nullish(),
  seo_description: z.string().max(170).nullish(),
})

export async function upsertServiceAction(
  id: string | null,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const parsed = ServiceSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    sort_order: formData.get('sort_order') ?? 0,
    is_active: formData.get('is_active') === 'true',
    slug: formData.get('slug'),
    subtitle: formData.get('subtitle'),
    content: formData.get('content'),
    seo_title: formData.get('seo_title'),
    seo_description: formData.get('seo_description'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Błąd walidacji.' }
  }

  const supabase = createServiceClient()

  if (id) {
    const { error } = await supabase.from('services').update(parsed.data).eq('id', id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase.from('services').insert(parsed.data)
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/content')
  return { success: true }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const supabase = createServiceClient()
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/admin/content')
  return { success: true }
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FaqSchema = z.object({
  question: z.string().min(5, 'Pytanie musi mieć min. 5 znaków.').max(300),
  answer: z.string().min(10, 'Odpowiedź musi mieć min. 10 znaków.').max(1000),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean().optional(),
})

export async function upsertFaqAction(
  id: string | null,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const parsed = FaqSchema.safeParse({
    question: formData.get('question'),
    answer: formData.get('answer'),
    sort_order: formData.get('sort_order') ?? 0,
    is_active: formData.get('is_active') === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Błąd walidacji.' }
  }

  const supabase = createServiceClient()

  if (id) {
    const { error } = await supabase.from('faq_items').update(parsed.data).eq('id', id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase.from('faq_items').insert(parsed.data)
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/content')
  return { success: true }
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const supabase = createServiceClient()
  const { error } = await supabase.from('faq_items').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/admin/content')
  return { success: true }
}

// ─── Data fetchers (used in Server Components) ────────────────────────────────

export async function getAdminPosts(): Promise<Post[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Post[]
}

export async function getAdminPost(id: string): Promise<Post | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('posts').select('*').eq('id', id).single()
  return data as Post | null
}

export async function getPageContents(): Promise<PageContent[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('page_content')
    .select('*')
    .order('section')
  return (data ?? []) as PageContent[]
}

export async function getServices(): Promise<Service[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .order('sort_order')
  return (data ?? []) as Service[]
}

export async function getFaqItems(): Promise<FaqItem[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('faq_items')
    .select('*')
    .order('sort_order')
  return (data ?? []) as FaqItem[]
}

// ─── Case Studies ─────────────────────────────────────────────────────────────

const CaseStudySchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki.'),
  title: z.string().min(2, 'Tytuł musi mieć min. 2 znaki.').max(200),
  description: z.string().min(10, 'Opis musi mieć min. 10 znaków.').max(1000),
  content: z.string().optional(),
  cover_image: z.string().url('Podaj poprawny URL obrazu.').optional().or(z.literal('')),
  tag: z.string().max(50).optional(),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean().optional(),
})

function parseCaseStudyFormData(formData: FormData) {
  return CaseStudySchema.safeParse({
    slug: formData.get('slug'),
    title: formData.get('title'),
    description: formData.get('description'),
    content: formData.get('content') || undefined,
    cover_image: formData.get('cover_image') || undefined,
    tag: formData.get('tag') || undefined,
    sort_order: formData.get('sort_order') ?? 0,
    is_active: formData.get('is_active') === 'true',
  })
}

export async function createCaseStudyAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const parsed = parseCaseStudyFormData(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Błąd walidacji.' }
  }
  const { cover_image, ...rest } = parsed.data
  const supabase = createServiceClient()
  const { error } = await supabase.from('case_studies').insert({
    ...rest,
    cover_image: cover_image || null,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/case-studies')
  revalidatePath('/admin/case-studies')
  redirect('/admin/case-studies')
}

export async function updateCaseStudyAction(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const parsed = parseCaseStudyFormData(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Błąd walidacji.' }
  }
  const { cover_image, ...rest } = parsed.data
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('case_studies')
    .update({ ...rest, cover_image: cover_image || null })
    .eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/case-studies')
  revalidatePath(`/case-studies/${parsed.data.slug}`)
  revalidatePath('/admin/case-studies')
  redirect('/admin/case-studies')
}

export async function deleteCaseStudyAction(id: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return UNAUTHORIZED
  const supabase = createServiceClient()
  const { error } = await supabase.from('case_studies').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/case-studies')
  revalidatePath('/admin/case-studies')
  return { success: true }
}

export async function getAdminCaseStudies(): Promise<CaseStudy[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('sort_order')
  if (error) throw new Error(error.message)
  return (data ?? []) as CaseStudy[]
}

export async function getAdminCaseStudy(id: string): Promise<CaseStudy | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('case_studies').select('*').eq('id', id).single()
  return data as CaseStudy | null
}
