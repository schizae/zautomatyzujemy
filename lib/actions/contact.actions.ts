'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { sendLeadNotification } from '@/lib/email/resend'
import { checkRateLimit } from '@/lib/rate-limiter'
import type { ActionResult } from '@/types'

// ─── helpers ──────────────────────────────────────────────────────────────────

async function getClientIp(): Promise<string> {
  const headersList = await headers()
  return headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

/** Honeypot: pole "website" jest ukryte przed ludźmi, ale boty je wypełniają. */
function isBot(formData: FormData): boolean {
  return (formData.get('website') as string | null)?.trim() !== ''
}

// ─── Lead Magnet ──────────────────────────────────────────────────────────────

const LeadMagnetSchema = z.object({
  email: z.string().email('Podaj poprawny adres e-mail.'),
})

export async function subscribeLeadMagnetAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Honeypot — cicho odrzucamy boty (pozorny sukces)
  if (isBot(formData)) {
    return { success: true }
  }

  // Rate limiting: 3 próby / 60s per IP
  const ip = await getClientIp()
  if (!checkRateLimit(`lead_magnet:${ip}`, { maxRequests: 3, windowMs: 60_000 })) {
    return { success: false, error: 'Zbyt wiele prób. Spróbuj ponownie za chwilę.' }
  }

  const parsed = LeadMagnetSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Błąd walidacji.' }
  }

  const { email } = parsed.data
  const supabase = createServiceClient()

  const { error } = await supabase.from('leads').insert({
    name: null,
    email,
    conversation_summary: 'Lead magnet: Checklista AI Act dla MŚP',
    source: 'lead_magnet',
    n8n_sent: false,
  })

  if (error) {
    return { success: false, error: 'Błąd zapisu. Spróbuj ponownie.' }
  }

  sendLeadNotification({
    source: 'lead_magnet',
    name: null,
    email,
    message: 'Zapisał się na checklistę AI Act dla MŚP',
  }).catch((err: unknown) => console.error('[resend] lead magnet notification failed:', err))

  return { success: true }
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

const ContactSchema = z.object({
  name: z.string().min(2, 'Imię i nazwisko musi mieć min. 2 znaki.').max(100),
  email: z.string().email('Podaj poprawny adres e-mail.'),
  message: z.string().min(10, 'Wiadomość musi mieć min. 10 znaków.').max(2000),
  gdprConsent: z.literal('true', {
    errorMap: () => ({ message: 'Wymagana jest zgoda na przetwarzanie danych osobowych.' }),
  }),
})

export async function submitContactAction(
  _prev: ActionResult<string>,
  formData: FormData
): Promise<ActionResult<string>> {
  // Honeypot — cicho odrzucamy boty (pozorny sukces)
  if (isBot(formData)) {
    return { success: true, data: 'sent' }
  }

  // Rate limiting: 3 próby / 60s per IP
  const ip = await getClientIp()
  if (!checkRateLimit(`contact:${ip}`, { maxRequests: 3, windowMs: 60_000 })) {
    return { success: false, error: 'Zbyt wiele prób. Spróbuj ponownie za chwilę.' }
  }

  const parsed = ContactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
    gdprConsent: formData.get('gdprConsent'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Błąd walidacji.' }
  }

  const { name, email, message } = parsed.data
  const supabase = createServiceClient()

  const { error } = await supabase.from('leads').insert({
    name,
    email,
    conversation_summary: message,
    source: 'contact_form',
    n8n_sent: false,
  })

  if (error) {
    return { success: false, error: 'Błąd zapisu. Spróbuj ponownie.' }
  }

  // Fire-and-forget — email + n8n (nie blokują odpowiedzi)
  sendLeadNotification({ source: 'contact_form', name, email, message }).catch(
    (err: unknown) => console.error('[resend] contact form notification failed:', err)
  )

  // Fire-and-forget do n8n
  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_WEBHOOK_SECRET && {
          Authorization: `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
        }),
      },
      body: JSON.stringify({ name, email, message, source: 'contact_form', timestamp: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    }).catch((err: unknown) => {
      console.error('[n8n webhook] contact form failed:', err)
    })
  }

  return { success: true, data: 'sent' }
}
