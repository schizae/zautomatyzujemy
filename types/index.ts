/**
 * Typy współdzielone w całej aplikacji.
 * Odzwierciedlają schemat bazy danych Supabase.
 */

// ─── Blog ────────────────────────────────────────────────────────────────────

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  cover_image: string | null
  published_at: string | null
  is_published: boolean
  author: string
  tags: string[]
  created_at: string
  updated_at: string
}

/** Dane potrzebne do wylistowania artykułów (bez pełnego content) */
export type PostPreview = Omit<Post, 'content'>

// ─── RAG / Wiedza ─────────────────────────────────────────────────────────────

export interface Document {
  id: string
  content: string
  embedding: number[] | null
  metadata: Record<string, unknown>
  source: string | null
  created_at: string
}

/** Wynik similarity search zwracany przez funkcję match_documents */
export interface MatchedDocument {
  id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

// ─── Leady / Chatbot ──────────────────────────────────────────────────────────

export interface Lead {
  id: string
  email: string
  name: string | null
  conversation_summary: string | null
  source: string
  n8n_sent: boolean
  created_at: string
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ─── Admin CMS ───────────────────────────────────────────────────────────────

export interface PageContent {
  key: string
  value: string
  label: string
  section: string
  updated_at: string
}

export interface Service {
  id: string
  title: string
  description: string
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ─── Case Studies ─────────────────────────────────────────────────────────────

export interface CaseStudy {
  id: string
  slug: string
  title: string
  description: string
  content: string
  cover_image: string | null
  tag: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── User Profiles ──────────────────────────────────────────────────────────

export interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

// ─── n8n Webhook payloads ─────────────────────────────────────────────────────

/** Payload wysyłany przez n8n do /api/blog/publish */
export interface BlogPublishPayload {
  slug: string
  title: string
  content: string
  excerpt?: string
  cover_image?: string
  author?: string
  tags?: string[]
  published_at?: string
}

/** Payload wysyłany przez chatbota do n8n po zebraniu e-maila */
export interface LeadWebhookPayload {
  email: string
  name?: string
  conversation_summary?: string
  source: 'chatbot'
  timestamp: string
}
