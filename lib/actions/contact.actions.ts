'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { NEWSLETTER_CONSENT_TEXT } from '@/lib/newsletter-consent'
import { sendLeadNotification, sendChecklistDelivery } from '@/lib/email/resend'
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

/**
 * Zapis do newslettera — osobny od leada, bo to osobna zgoda (RODO art. 7).
 * Zwraca token wypisu, żeby trafił do stopki maila.
 */
async function subscribeToNewsletter(email: string, ip: string): Promise<string | null> {
  const supabase = createServiceClient()

  // onConflict — ponowny zapis tym samym adresem odnawia zgodę i cofa wypis
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      {
        email,
        consent_at: new Date().toISOString(),
        consent_ip: ip,
        consent_text: NEWSLETTER_CONSENT_TEXT,
        source: 'lead_magnet',
        unsubscribed_at: null,
      },
      { onConflict: 'email' }
    )
    .select('unsubscribe_token')
    .single()

  if (error) {
    console.error('[newsletter] zapis nieudany:', error.message)
    return null
  }

  return typeof data?.unsubscribe_token === 'string' ? data.unsubscribe_token : null
}

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

  // Zgoda dobrowolna — checklistę wysyłamy niezależnie od niej
  const wantsNewsletter = formData.get('newsletterConsent') === 'true'
  const unsubscribeToken = wantsNewsletter ? await subscribeToNewsletter(email, ip) : null

  const emailResults = await Promise.allSettled([
    sendChecklistDelivery(email, unsubscribeToken),
    sendLeadNotification({
      source: 'lead_magnet',
      name: null,
      email,
      message: 'Zapisał się na checklistę AI Act dla MŚP',
    }),
  ])

  emailResults.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`[email ${i === 0 ? 'checklist' : 'notification'}] failed:`, result.reason)
    } else {
      console.log(`[email ${i === 0 ? 'checklist' : 'notification'}] sent ok`)
    }
  })

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

  // Czekamy na maila — lead jest już w bazie, więc błąd wysyłki nie psuje formularza
  await sendLeadNotification({ source: 'contact_form', name, email, message }).catch(
    (err: unknown) => console.error('[resend] contact form notification failed:', err)
  )

  // after() — n8n ma timeout 5s, nie blokujemy nim odpowiedzi
  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL
  if (webhookUrl) {
    after(async () => {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.N8N_WEBHOOK_SECRET && {
              Authorization: `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
            }),
          },
          body: JSON.stringify({ name, email, message, source: 'contact_form', timestamp: new Date().toISOString() }),
          signal: AbortSignal.timeout(5000),
        })
      } catch (err: unknown) {
        console.error('[n8n webhook] contact form failed:', err)
      }
    })
  }

  return { success: true, data: 'sent' }
}
