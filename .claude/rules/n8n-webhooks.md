# Reguła: Integracja n8n — Webhook Security

Zasady dla bezpiecznej integracji z n8n w tym projekcie.

---

## Architektura webhooków

```
n8n → POST /api/blog/publish  (inbound: publikacja postów z n8n)
Form → n8n lead webhook        (outbound: leady z formularza kontaktowego)
Chat → n8n lead webhook        (outbound: leady z chatbota)
```

---

## Bezpieczny inbound webhook (n8n → Next.js)

```typescript
// app/api/blog/publish/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { BlogPublishPayload } from '@/types'
import { z } from 'zod'

// Zawsze weryfikuj secret header
function verifySecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-webhook-secret')
  return secret === process.env.N8N_WEBHOOK_SECRET
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

**Zasady bezpieczeństwa:**
- Zawsze porównuj secret w stałym czasie (unikaj timing attacks) — użyj `crypto.timingSafeEqual()`
- Używaj `createServiceClient()` (service role) dla operacji zapisu z n8n — omija RLS
- Waliduj payload przez Zod przed zapisem do bazy

---

## Outbound webhook (Next.js → n8n)

```typescript
// Wysyłanie leada do n8n
async function sendLeadToN8n(lead: Lead): Promise<void> {
  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL
  if (!webhookUrl) return // graceful degradation — log, nie crash

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })
}
```

**Zasady:**
- n8n webhook URL jest sekretem — tylko w `.env.local`, nigdy w kliencie
- Nigdy nie blokuj UX na wysłanie do n8n — fire and forget lub background job
- Oznacz `leads.n8n_sent = true` po pomyślnym wysłaniu

---

## Zmienne środowiskowe dla n8n

```env
N8N_WEBHOOK_SECRET=...    # losowy string, min 32 znaki — generuj: openssl rand -hex 32
N8N_LEAD_WEBHOOK_URL=...  # URL do n8n workflow (tylko server-side, bez NEXT_PUBLIC_)
```

---

## Timing-safe comparison (zapobieganie timing attacks)

```typescript
import { timingSafeEqual } from 'crypto'

function verifySecret(received: string, expected: string): boolean {
  if (received.length !== expected.length) return false
  return timingSafeEqual(
    Buffer.from(received),
    Buffer.from(expected)
  )
}
```
