'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env['RESEND_API_KEY'])

const FROM_EMAIL =
  process.env['RESEND_FROM_EMAIL'] ?? 'powiadomienia@zautomatyzujemy.pl'
const TO_EMAIL = process.env['NOTIFICATION_EMAIL'] ?? ''

export interface LeadNotificationData {
  source: 'contact_form' | 'chatbot' | 'lead_magnet'
  name: string | null
  email: string
  message: string
}

export async function sendChecklistDelivery(email: string): Promise<void> {
  if (!process.env['RESEND_API_KEY']) return

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'
  const checklistUrl = `${siteUrl}/ai-act-checklist`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: '📋 Twoja checklista AI Act dla MŚP — Zautomatyzujemy.pl',
    html: `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">

        <tr>
          <td style="background:#0d1f1f;padding:28px 32px">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#70e5ea">zautomatyzujemy.pl</p>
            <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#e2e3df">Checklista AI Act dla MŚP</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">
              Cześć,
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">
              tutaj Norbert z Zautomatyzujemy.pl. Obiecałem checklistę — trzymasz ją poniżej.
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6">
              Znajdziesz w niej konkretne kroki, które Twoja firma powinna podjąć przed <strong>2 sierpnia 2026</strong>,
              żeby być zgodna z unijnym rozporządzeniem AI Act — bez prawniczego żargonu.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 24px">
                  <a href="${checklistUrl}"
                     style="display:inline-block;padding:14px 32px;background:#ffa07b;color:#1a0a00;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px">
                    Otwórz checklistę →
                  </a>
                </td>
              </tr>
            </table>

            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#374151">Co znajdziesz w checkliście:</p>
              <ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:#6b7280;line-height:1.8">
                <li>Klasyfikacja systemów AI według poziomu ryzyka</li>
                <li>Obowiązki dla firm korzystających z AI (nawet ChatGPT)</li>
                <li>Wymagania szkoleniowe dla pracowników (AI literacy)</li>
                <li>Terminy wejścia w życie poszczególnych przepisów</li>
                <li>Plan działania krok po kroku dla MŚP</li>
              </ul>
            </div>

            <p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.6">
              Jeśli masz pytania lub chcesz omówić jak przygotować Twoją firmę —
              <a href="${siteUrl}/#kontakt" style="color:#0ea5e9;text-decoration:none">umów bezpłatną konsultację</a>.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af">
              Zautomatyzujemy.pl · <a href="${siteUrl}" style="color:#9ca3af">${siteUrl}</a>
              <br>Wysłano, bo zapisałeś/aś się na naszej stronie.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

export async function sendLeadNotification(data: LeadNotificationData): Promise<void> {
  if (!TO_EMAIL || !process.env['RESEND_API_KEY']) return

  const sourceLabel =
    data.source === 'contact_form' ? 'Formularz kontaktowy'
    : data.source === 'chatbot' ? 'Chatbot'
    : 'Lead magnet — Checklista AI Act'
  const emoji =
    data.source === 'contact_form' ? '📩'
    : data.source === 'chatbot' ? '🤖'
    : '📋'
  const subject = `${emoji} Nowy lead — ${sourceLabel}: ${data.name ?? data.email}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject,
    html: buildEmailHtml(data, sourceLabel),
  })
}

function buildEmailHtml(data: LeadNotificationData, sourceLabel: string): string {
  const nameRow = data.name
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px">Imię</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827">${escHtml(data.name)}</td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">

        <!-- Header -->
        <tr>
          <td style="background:#0d1f1f;padding:28px 32px">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#70e5ea">zautomatyzujemy.pl</p>
            <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#e2e3df">Nowy lead — ${escHtml(sourceLabel)}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
              ${nameRow}
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px">Email</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827"><a href="mailto:${escHtml(data.email)}" style="color:#0ea5e9;text-decoration:none">${escHtml(data.email)}</a></td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Źródło</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827">${escHtml(sourceLabel)}</td></tr>
            </table>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">

            <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280">
              ${data.source === 'chatbot' ? 'Brief AI' : 'Wiadomość'}
            </p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;font-size:14px;line-height:1.6;color:#374151;white-space:pre-wrap">${escHtml(data.message)}</div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af">
              Powiadomienie wygenerowane automatycznie · ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
