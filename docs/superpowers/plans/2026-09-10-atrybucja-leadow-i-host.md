# Atrybucja leadów i kanoniczny host — plan wdrożenia

> **Dla agentów wykonawczych:** WYMAGANY SUB-SKILL: użyj `subagent-driven-development` (zalecane)
> albo `executing-plans` do wykonania tego planu zadanie po zadaniu.
> Kroki mają składnię checkboxów (`- [ ]`) do odhaczania.

**Cel:** Powiązać każdego nowego leada ze źródłem wizyty i stroną wejścia oraz naprawić
rozjazd kanonicznego hosta, żeby każdy kolejny etap projektu widoczności był mierzalny.

**Architektura:** Czysty moduł `lib/attribution.ts` bez zależności klasyfikuje źródło i normalizuje
dane. Komponent kliencki zapisuje pierwsze wejście do `sessionStorage`. Trzy miejsca zbierające leady
(formularz kontaktowy, lead magnet, czat) dokładają te wartości do zapisu w bazie.
Kolumny w `leads` są opcjonalne, więc brak danych nigdy nie blokuje wysyłki formularza.

**Stos:** Next.js App Router, TypeScript strict, Supabase, Zod, testy przez `node --test`.

**Źródło:** `docs/superpowers/specs/2026-09-10-widocznosc-w-wyszukiwarce-design.md`, punkty 0.1 i 1.8.

**To pierwszy z czterech planów.** Spec obejmuje cztery niezależne podsystemy i każdy dostaje
własny plan, bo każdy z osobna daje działające oprogramowanie:

| Plan | Zakres | Stan |
|---|---|---|
| 1. Atrybucja i host | ten dokument | gotowy do wykonania |
| 2. Strony docelowe | rebase `feat/strony-uslugowe`, `/uslugi`, `/cennik`, `/kontakt`, `/o-mnie`, strona lokalna | do napisania po Planie 1 |
| 3. Silnik treści bloga | migracja `016`, standard pisarski, bramka, tryby publikacji, brief na maila, zmiana modelu | do napisania |
| 4. Automat postów | propozycje na LinkedIn i Facebooka mailem | do napisania |

---

## Struktura plików

| Plik | Odpowiedzialność |
|---|---|
| `lib/attribution.ts` | Czysta logika: klasyfikacja źródła, normalizacja i przycinanie wartości. Zero importów, żeby dało się go testować transpilacją. |
| `scripts/attribution.test.mjs` | Testy jednostkowe czystego modułu. |
| `scripts/canonical-host.test.mjs` | Test regresyjny pilnujący, żeby fallback hosta nie wrócił do wersji bez www. |
| `supabase/migrations/015_lead_attribution.sql` | Cztery opcjonalne kolumny w `leads` plus indeks. |
| `components/analytics/attribution-tracker.tsx` | Komponent kliencki zapisujący pierwsze wejście do `sessionStorage` i funkcja odczytu. |
| `lib/actions/contact.actions.ts` | Odczyt atrybucji z `FormData` i zapis przy leadzie z formularza oraz z lead magnetu. |
| `lib/actions/chat.actions.ts` | Zapis atrybucji przy leadzie z czatu. |
| `components/marketing/contact-form.tsx` | Ukryte pola z atrybucją. |
| `components/chat/chat-widget.tsx` | Przekazanie atrybucji do akcji zapisującej leada. |
| `app/layout.tsx` | Osadzenie komponentu śledzącego, poprawka fallbacku hosta. |
| `app/sitemap.ts`, `app/robots.ts`, `app/blog/[slug]/page.tsx` | Poprawka fallbacku hosta. |
| `docs/seo/baseline.md` | Punkt odniesienia przed zmianami. |

Numeracja migracji: `015` zgodnie ze specem. Migracje `013` i `014` przyjdą z gałęzią
`feat/strony-uslugowe` w Planie 2. Luka w numeracji jest nieszkodliwa, kolizja numerów już nie.

---

## Przygotowanie

- [ ] **Krok 1: Gałąź robocza**

```bash
git checkout main
git pull
git checkout -b feat/atrybucja-leadow
```

- [ ] **Krok 2: Sprawdź, że testy przechodzą przed zmianami**

Uruchom: `npm test`
Oczekiwane: wszystkie testy zielone (dziś dwa pliki: `ai-disclosure.test.mjs`, `voice-context.test.mjs`).

---

## Zadanie 1: Czysty moduł atrybucji

**Pliki:**
- Utwórz: `lib/attribution.ts`
- Test: `scripts/attribution.test.mjs`

Moduł nie może niczego importować. Test wykonuje go przez `ts.transpileModule` i `new Function`,
dokładnie tak jak `scripts/ai-disclosure.test.mjs`, a import zepsułby ten mechanizm.

- [ ] **Krok 1: Napisz test, który nie przechodzi**

Utwórz `scripts/attribution.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

// Moduł jest czysty — bez importów, bez sieci — więc wystarczy stranspilować
// go do CommonJS i wykonać, tak samo jak w ai-disclosure.test.mjs.
const source = readFileSync(new URL('../lib/attribution.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

const moduleExports = {}
const load = new Function('exports', 'module', compiled)
load(moduleExports, { exports: moduleExports })

const { classifySource, normalizeAttribution } = moduleExports

// ─── Klasyfikacja źródła ──────────────────────────────────────────────────────

test('brak referrera i kampanii to wejście bezpośrednie', () => {
  assert.equal(classifySource(null, null), 'direct')
})

test('pusty referrer jest traktowany jak jego brak', () => {
  assert.equal(classifySource('   ', null), 'direct')
})

test('wyszukiwarka daje źródło organiczne', () => {
  assert.equal(classifySource('https://www.google.com/', null), 'organic')
  assert.equal(classifySource('https://duckduckgo.com/?q=automatyzacja', null), 'organic')
})

test('serwisy społecznościowe dają źródło społecznościowe', () => {
  assert.equal(classifySource('https://www.linkedin.com/feed/', null), 'social')
  assert.equal(classifySource('https://lnkd.in/abc', null), 'social')
  assert.equal(classifySource('https://m.facebook.com/', null), 'social')
})

test('obca witryna to odesłanie', () => {
  assert.equal(classifySource('https://n8n.io/creators/', null), 'referral')
})

test('wejście z własnej domeny jest oznaczone jako wewnętrzne', () => {
  assert.equal(classifySource('https://www.zautomatyzujemy.pl/blog', null), 'internal')
  assert.equal(classifySource('http://localhost:3000/blog', null), 'internal')
})

test('utm_source wygrywa z referrerem', () => {
  assert.equal(classifySource('https://www.google.com/', 'newsletter'), 'campaign')
})

test('nieparsowalny referrer nie wywraca klasyfikacji', () => {
  assert.equal(classifySource('to nie jest adres', null), 'direct')
})

// ─── Normalizacja ─────────────────────────────────────────────────────────────

test('normalizacja przycina wartości do 500 znaków', () => {
  const result = normalizeAttribution({
    referrer: `https://example.com/${'a'.repeat(600)}`,
    landingPath: '/blog',
    utmSource: null,
  })
  assert.equal(result.referrer.length, 500)
})

test('ścieżka wejścia bez ukośnika jest odrzucana', () => {
  const result = normalizeAttribution({
    referrer: null,
    landingPath: 'blog/artykul',
    utmSource: null,
  })
  assert.equal(result.landingPath, null)
})

test('normalizacja zwraca komplet pól także dla pustego wejścia', () => {
  const result = normalizeAttribution({ referrer: null, landingPath: null, utmSource: null })
  assert.deepEqual(result, {
    referrer: null,
    landingPath: null,
    utmSource: null,
    sourceKind: 'direct',
  })
})

test('normalizacja przyjmuje wejście niepełne i nie rzuca', () => {
  const result = normalizeAttribution({})
  assert.equal(result.sourceKind, 'direct')
  assert.equal(result.landingPath, null)
})
```

- [ ] **Krok 2: Uruchom test i potwierdź, że nie przechodzi**

Uruchom: `node --test scripts/attribution.test.mjs`
Oczekiwane: błąd odczytu pliku `lib/attribution.ts` (ENOENT), bo moduł jeszcze nie istnieje.

- [ ] **Krok 3: Napisz moduł**

Utwórz `lib/attribution.ts`:

```typescript
/**
 * Skąd przyszedł odwiedzający. Moduł jest świadomie bez importów — dzięki temu
 * testuje się go transpilacją, tak samo jak `lib/ai-disclosure.ts`.
 *
 * Uwaga o zakresie pomiaru: dane pochodzą z `sessionStorage`, więc opisują
 * pierwsze wejście w obrębie jednej karty przeglądarki, a nie pierwszą wizytę
 * klienta w całej jego historii. To świadomie przyjęte minimum.
 */

export type LeadSourceKind =
  | 'organic'
  | 'social'
  | 'referral'
  | 'direct'
  | 'campaign'
  | 'internal'

export interface RawAttribution {
  referrer?: string | null
  landingPath?: string | null
  utmSource?: string | null
}

export interface NormalizedAttribution {
  referrer: string | null
  landingPath: string | null
  utmSource: string | null
  sourceKind: LeadSourceKind
}

/** Kolumny w bazie są typu TEXT, ale nie ma powodu zapisywać cudzych megabajtów. */
const MAX_LENGTH = 500

const OWN_HOSTS = ['zautomatyzujemy.pl', 'localhost']

// Dopasowanie po fragmencie nazwy hosta. Świadomie proste: fałszywe trafienie
// na domenie zawierającej „google" jest tańsze niż utrzymywanie pełnej listy.
const SEARCH_TOKENS = ['google', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'brave', 'yandex']
const SOCIAL_TOKENS = ['linkedin', 'lnkd.in', 'facebook', 'instagram', 'twitter', 'x.com', 't.co', 'tiktok', 'youtube']

function clamp(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '') return null
  return trimmed.slice(0, MAX_LENGTH)
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

export function classifySource(
  referrer: string | null | undefined,
  utmSource: string | null | undefined
): LeadSourceKind {
  if (clamp(utmSource) !== null) return 'campaign'

  const referrerValue = clamp(referrer)
  if (referrerValue === null) return 'direct'

  const host = hostOf(referrerValue)
  if (host === null) return 'direct'

  if (OWN_HOSTS.some(own => host === own || host.endsWith(`.${own}`))) return 'internal'
  if (SEARCH_TOKENS.some(token => host.includes(token))) return 'organic'
  if (SOCIAL_TOKENS.some(token => host.includes(token))) return 'social'

  return 'referral'
}

export function normalizeAttribution(raw: RawAttribution): NormalizedAttribution {
  const landingPath = clamp(raw.landingPath)

  return {
    referrer: clamp(raw.referrer),
    landingPath: landingPath !== null && landingPath.startsWith('/') ? landingPath : null,
    utmSource: clamp(raw.utmSource),
    sourceKind: classifySource(raw.referrer, raw.utmSource),
  }
}
```

- [ ] **Krok 4: Uruchom test i potwierdź, że przechodzi**

Uruchom: `node --test scripts/attribution.test.mjs`
Oczekiwane: wszystkie asercje zielone, `pass 12`.

- [ ] **Krok 5: Sprawdź typy**

Uruchom: `npm run type-check`
Oczekiwane: brak błędów.

- [ ] **Krok 6: Commit**

```bash
git add lib/attribution.ts scripts/attribution.test.mjs
git commit -m "feat(atrybucja): modul klasyfikacji zrodla wizyty"
```

---

## Zadanie 2: Migracja bazy

**Pliki:**
- Utwórz: `supabase/migrations/015_lead_attribution.sql`

- [ ] **Krok 1: Napisz migrację**

```sql
-- 015_lead_attribution.sql
-- Skąd przyszedł lead. Wszystkie kolumny opcjonalne: brak atrybucji nie może
-- blokować zapisu leada, bo lead jest ważniejszy niż wiedza o jego pochodzeniu.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS landing_path TEXT,
  ADD COLUMN IF NOT EXISTS referrer     TEXT,
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS source_kind  TEXT;

COMMENT ON COLUMN leads.source_kind IS
  'organic | social | referral | direct | campaign | internal — klasyfikacja z lib/attribution.ts';

-- Raport miesięczny grupuje właśnie po tej kolumnie
CREATE INDEX IF NOT EXISTS leads_source_kind_idx ON leads (source_kind);
```

- [ ] **Krok 2: Zastosuj migrację na projekcie Supabase**

Wykonaj treść pliku w edytorze SQL projektu produkcyjnego.
Weryfikacja: zapytanie poniżej ma zwrócić cztery wiersze.

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'leads'
  AND column_name IN ('landing_path', 'referrer', 'utm_source', 'source_kind')
ORDER BY column_name;
```

Oczekiwane: `landing_path`, `referrer`, `source_kind`, `utm_source`.

- [ ] **Krok 3: Odśwież typy bazy, jeśli projekt je generuje**

Uruchom: `npm run type-check`
Oczekiwane: brak błędów. Jeśli typy Supabase są generowane do pliku, zregeneruj je przed tym krokiem.

- [ ] **Krok 4: Commit**

```bash
git add supabase/migrations/015_lead_attribution.sql
git commit -m "feat(atrybucja): kolumny zrodla leada w tabeli leads"
```

---

## Zadanie 3: Zapis pierwszego wejścia po stronie przeglądarki

**Pliki:**
- Utwórz: `components/analytics/attribution-tracker.tsx`
- Modyfikuj: `app/layout.tsx`

Serwer tego nie zobaczy: `headers()` w Server Action zwraca referrera własnego POST-a,
a nie stronę, z której przyszedł odwiedzający. Dlatego zapis dzieje się w przeglądarce.

- [ ] **Krok 1: Napisz komponent**

Utwórz `components/analytics/attribution-tracker.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import type { RawAttribution } from '@/lib/attribution'

const STORAGE_KEY = 'zautomatyzujemy:first-touch'

const EMPTY: RawAttribution = { referrer: null, landingPath: null, utmSource: null }

/**
 * Zapisuje pierwsze wejście w tej karcie przeglądarki. Kolejne podstrony go nie
 * nadpisują, bo interesuje nas wejście na witrynę, a nie ostatnie kliknięcie.
 */
export function AttributionTracker(): null {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) !== null) return

      const params = new URLSearchParams(window.location.search)
      const payload: RawAttribution = {
        referrer: document.referrer === '' ? null : document.referrer,
        landingPath: window.location.pathname,
        utmSource: params.get('utm_source'),
      }

      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Prywatne okno albo zablokowane dane witryny. Atrybucja jest opcjonalna,
      // więc brak zapisu nie może niczego zepsuć.
    }
  }, [])

  return null
}

/** Odczyt dla formularzy. Zawsze zwraca komplet pól, także gdy zapisu nie było. */
export function readFirstTouch(): RawAttribution {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored === null) return EMPTY

    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY

    const record = parsed as Record<string, unknown>
    return {
      referrer: typeof record['referrer'] === 'string' ? record['referrer'] : null,
      landingPath: typeof record['landingPath'] === 'string' ? record['landingPath'] : null,
      utmSource: typeof record['utmSource'] === 'string' ? record['utmSource'] : null,
    }
  } catch {
    return EMPTY
  }
}
```

- [ ] **Krok 2: Osadź komponent w layoucie**

W `app/layout.tsx` dodaj import obok pozostałych:

```tsx
import { AttributionTracker } from '@/components/analytics/attribution-tracker'
```

i wstaw komponent bezpośrednio przed `<Analytics />` w drzewie `<body>`:

```tsx
        <AttributionTracker />
        <Analytics />
```

- [ ] **Krok 3: Sprawdź w przeglądarce**

Uruchom: `npm run dev`
Otwórz `http://localhost:3000/?utm_source=test` i w konsoli przeglądarki wykonaj:

```js
sessionStorage.getItem('zautomatyzujemy:first-touch')
```

Oczekiwane: JSON z `landingPath` równym `/` i `utmSource` równym `test`.
Następnie przejdź na `/blog` i powtórz odczyt. Oczekiwane: wartość bez zmian, `landingPath` nadal `/`.

- [ ] **Krok 4: Commit**

```bash
git add components/analytics/attribution-tracker.tsx app/layout.tsx
git commit -m "feat(atrybucja): zapis pierwszego wejscia w przegladarce"
```

---

## Zadanie 4: Lead z formularza kontaktowego

**Pliki:**
- Modyfikuj: `lib/actions/contact.actions.ts`
- Modyfikuj: `components/marketing/contact-form.tsx`

- [ ] **Krok 1: Dodaj odczyt atrybucji w akcjach serwerowych**

W `lib/actions/contact.actions.ts` dodaj import obok pozostałych:

```typescript
import { normalizeAttribution } from '@/lib/attribution'
import type { NormalizedAttribution } from '@/lib/attribution'
```

i pod sekcją `helpers`, zaraz za funkcją `isBot`, dodaj:

```typescript
const AttributionSchema = z.object({
  referrer: z.string().max(500).nullish(),
  landingPath: z.string().max(500).nullish(),
  utmSource: z.string().max(500).nullish(),
})

/**
 * Atrybucja przychodzi z ukrytych pól formularza, czyli spod kontroli klienta.
 * Wartości niezgodne ze schematem odrzucamy w całości — lead zapisze się bez nich.
 */
function attributionFromFormData(formData: FormData): NormalizedAttribution {
  const parsed = AttributionSchema.safeParse({
    referrer: formData.get('referrer'),
    landingPath: formData.get('landingPath'),
    utmSource: formData.get('utmSource'),
  })

  if (!parsed.success) {
    return normalizeAttribution({})
  }

  return normalizeAttribution({
    referrer: parsed.data.referrer ?? null,
    landingPath: parsed.data.landingPath ?? null,
    utmSource: parsed.data.utmSource ?? null,
  })
}
```

- [ ] **Krok 2: Zapisz atrybucję przy leadzie z formularza**

W `submitContactAction`, tuż przed `const { error } = await supabase.from('leads').insert({`, dodaj:

```typescript
  const attribution = attributionFromFormData(formData)
```

i rozszerz sam zapis o cztery pola:

```typescript
  const { error } = await supabase.from('leads').insert({
    name,
    email,
    conversation_summary: message,
    source: 'contact_form',
    n8n_sent: false,
    landing_path: attribution.landingPath,
    referrer: attribution.referrer,
    utm_source: attribution.utmSource,
    source_kind: attribution.sourceKind,
  })
```

Pola przekazujemy zawsze, także jako `null`. Przy `exactOptionalPropertyTypes` warunkowe
rozwijanie obiektu wymagałoby osobnego typu, a jawny `null` jest prostszy i czytelniejszy.

- [ ] **Krok 3: To samo w lead magnecie**

W `subscribeLeadMagnetAction`, tuż przed `const { error } = await supabase.from('leads').insert({`, dodaj:

```typescript
  const attribution = attributionFromFormData(formData)
```

i rozszerz zapis:

```typescript
  const { error } = await supabase.from('leads').insert({
    name: null,
    email,
    conversation_summary: 'Lead magnet: Checklista AI Act dla MŚP',
    source: 'lead_magnet',
    n8n_sent: false,
    landing_path: attribution.landingPath,
    referrer: attribution.referrer,
    utm_source: attribution.utmSource,
    source_kind: attribution.sourceKind,
  })
```

- [ ] **Krok 4: Dołóż ukryte pola do formularza kontaktowego**

W `components/marketing/contact-form.tsx` dodaj importy:

```tsx
import { readFirstTouch } from '@/components/analytics/attribution-tracker'
import type { RawAttribution } from '@/lib/attribution'
```

obok pozostałych `useState` dodaj stan i odczyt:

```tsx
  const [attribution, setAttribution] = useState<RawAttribution>({
    referrer: null,
    landingPath: null,
    utmSource: null,
  })

  useEffect(() => {
    setAttribution(readFirstTouch())
  }, [])
```

Odczyt jest w `useEffect`, bo `sessionStorage` nie istnieje podczas renderu na serwerze.

Następnie, zaraz za istniejącym `<input type="hidden" name="gdprConsent" ... />`, dodaj:

```tsx
      {/* Atrybucja — skąd przyszedł odwiedzający. Puste, gdy przeglądarka blokuje dane witryny. */}
      <input type="hidden" name="referrer" value={attribution.referrer ?? ''} />
      <input type="hidden" name="landingPath" value={attribution.landingPath ?? ''} />
      <input type="hidden" name="utmSource" value={attribution.utmSource ?? ''} />
```

- [ ] **Krok 5: To samo w formularzu lead magnetu**

Plik: `components/marketing/lead-magnet-section.tsx`. Formularz zaczyna się w linii 65,
honeypot siedzi zaraz pod nim w linii 67.

Zmień import Reacta w linii 7 i dodaj dwa nowe importy:

```tsx
import { useActionState, useEffect, useState } from 'react'
import { readFirstTouch } from '@/components/analytics/attribution-tracker'
import type { RawAttribution } from '@/lib/attribution'
```

W ciele komponentu, zaraz za linią z `useActionState`, dodaj:

```tsx
  const [attribution, setAttribution] = useState<RawAttribution>({
    referrer: null,
    landingPath: null,
    utmSource: null,
  })

  useEffect(() => {
    setAttribution(readFirstTouch())
  }, [])
```

Wewnątrz `<form action={formAction} ...>`, tuż przed blokiem honeypota, dodaj:

```tsx
                    {/* Atrybucja — skąd przyszedł odwiedzający */}
                    <input type="hidden" name="referrer" value={attribution.referrer ?? ''} />
                    <input type="hidden" name="landingPath" value={attribution.landingPath ?? ''} />
                    <input type="hidden" name="utmSource" value={attribution.utmSource ?? ''} />
```

Wcięcie dopasuj do sąsiednich linii w tym pliku — formularz jest zagnieżdżony głębiej
niż w komponencie kontaktowym.

- [ ] **Krok 6: Sprawdź typy i linter**

Uruchom: `npm run type-check && npm run lint`
Oczekiwane: brak błędów.

- [ ] **Krok 7: Sprawdź zapis od końca do końca**

Uruchom `npm run dev`, wejdź na `http://localhost:3000/?utm_source=test-lokalny`,
wyślij formularz kontaktowy, po czym w bazie wykonaj:

```sql
SELECT email, source, source_kind, landing_path, utm_source
FROM leads
ORDER BY created_at DESC
LIMIT 1;
```

Oczekiwane: `source_kind` równy `campaign`, `utm_source` równy `test-lokalny`, `landing_path` równy `/`.

- [ ] **Krok 8: Commit**

```bash
git add lib/actions/contact.actions.ts components/marketing/contact-form.tsx
git commit -m "feat(atrybucja): zrodlo leada z formularza i lead magnetu"
```

---

## Zadanie 5: Lead z czatu

**Pliki:**
- Modyfikuj: `lib/actions/chat.actions.ts:178`
- Modyfikuj: `components/chat/chat-widget.tsx:292`

Leada z czatu zapisuje Server Action wołana z komponentu klienckiego, więc atrybucja wchodzi
jako trzeci argument tej akcji. Transport czatu obsługuje wiadomości i nie ma z tym nic wspólnego.

- [ ] **Krok 1: Rozszerz akcję o trzeci argument**

W `lib/actions/chat.actions.ts` dodaj import:

```typescript
import { normalizeAttribution } from '@/lib/attribution'
import type { RawAttribution } from '@/lib/attribution'
```

i zmień sygnaturę `saveChatLeadAction`:

```typescript
export async function saveChatLeadAction(
  email: string,
  messages: ChatMessage[],
  attribution: RawAttribution = {}
): Promise<ActionResult<string>> {
```

Wartość domyślna sprawia, że istniejące wywołania nadal się kompilują.

- [ ] **Krok 2: Zapisz atrybucję**

W tej samej funkcji, tuż przed `const supabase = createServiceClient()`, dodaj:

```typescript
  const normalized = normalizeAttribution(attribution)
```

i rozszerz zapis o cztery pola, zaraz za `n8n_sent: false,`:

```typescript
      landing_path: normalized.landingPath,
      referrer: normalized.referrer,
      utm_source: normalized.utmSource,
      source_kind: normalized.sourceKind,
```

- [ ] **Krok 3: Przekaż atrybucję z widżetu**

W `components/chat/chat-widget.tsx` dodaj import:

```tsx
import { readFirstTouch } from '@/components/analytics/attribution-tracker'
```

i w linii 292 zmień wywołanie:

```tsx
      const result = await saveChatLeadAction(detectedEmail!, chatMessages, readFirstTouch())
```

Odczyt jest tutaj bezpieczny bez `useEffect`, bo dzieje się w reakcji na zdarzenie użytkownika,
czyli zawsze w przeglądarce.

- [ ] **Krok 4: Sprawdź typy i linter**

Uruchom: `npm run type-check && npm run lint`
Oczekiwane: brak błędów.

- [ ] **Krok 5: Commit**

```bash
git add lib/actions/chat.actions.ts components/chat/chat-widget.tsx
git commit -m "feat(atrybucja): zrodlo leada z czatu"
```

---

## Zadanie 6: Kanoniczny host

**Pliki:**
- Modyfikuj: `app/layout.tsx:31`, `app/sitemap.ts:6`, `app/robots.ts:5`, `app/blog/[slug]/page.tsx:16`
- Test: `scripts/canonical-host.test.mjs`

Produkcja odpowiada z `https://www.zautomatyzujemy.pl`, a wszystkie cztery pliki mają w wartości
domyślnej wersję bez www. Dopóki `NEXT_PUBLIC_SITE_URL` jest ustawione, nic się nie dzieje.
Build bez tej zmiennej wypuści sitemapę i canonicale na złym hoście.

- [ ] **Krok 1: Napisz test regresyjny, który nie przechodzi**

Utwórz `scripts/canonical-host.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Produkcja żyje na www, a non-www tylko przekierowuje. Wartość domyślna bez www
// oznacza, że build bez NEXT_PUBLIC_SITE_URL wypuści canonicale na złym hoście.
const FILES = [
  '../app/layout.tsx',
  '../app/sitemap.ts',
  '../app/robots.ts',
  '../app/blog/[slug]/page.tsx',
]

for (const relativePath of FILES) {
  test(`${relativePath} nie zawiera fallbacku bez www`, () => {
    const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')
    assert.equal(
      source.includes("'https://zautomatyzujemy.pl'"),
      false,
      'Wartość domyślna hosta musi wskazywać https://www.zautomatyzujemy.pl'
    )
  })
}
```

- [ ] **Krok 2: Uruchom test i potwierdź, że nie przechodzi**

Uruchom: `node --test scripts/canonical-host.test.mjs`
Oczekiwane: cztery testy czerwone.

- [ ] **Krok 3: Popraw wartości domyślne**

W każdym z czterech plików zamień:

```typescript
process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'
```

na:

```typescript
process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://www.zautomatyzujemy.pl'
```

Sprawdź, czy nie ma innych wystąpień:

```bash
grep -rn "https://zautomatyzujemy.pl" app lib components --include=*.ts --include=*.tsx
```

Oczekiwane: brak wyników. Jeśli coś zostało, popraw i dopisz plik do listy w teście.

- [ ] **Krok 4: Uruchom testy i potwierdź, że przechodzą**

Uruchom: `npm test`
Oczekiwane: wszystkie testy zielone, łącznie z modułem atrybucji.

- [ ] **Krok 5: Commit**

```bash
git add app/layout.tsx app/sitemap.ts app/robots.ts "app/blog/[slug]/page.tsx" scripts/canonical-host.test.mjs
git commit -m "fix(seo): kanoniczny host z www w wartosciach domyslnych"
```

- [ ] **Krok 6: Zadanie właściciela — przekierowanie trwałe**

W panelu Vercel, w ustawieniach domeny projektu, zmień przekierowanie z `zautomatyzujemy.pl`
na `www.zautomatyzujemy.pl` z tymczasowego na trwałe.
Weryfikacja po zmianie:

```bash
curl -sI https://zautomatyzujemy.pl | head -3
```

Oczekiwane: `HTTP/1.1 308 Permanent Redirect` zamiast obecnego `307`.

---

## Zadanie 7: Punkt odniesienia przed zmianami

**Pliki:**
- Utwórz: `docs/seo/baseline.md`

Bez zapisanego stanu wyjściowego nie da się później powiedzieć, czy cokolwiek się poprawiło.

- [ ] **Krok 1: Zbierz dane**

W Search Console, zakres ostatnie 3 miesiące, zanotuj: liczbę kliknięć, wyświetleń,
średni CTR, średnią pozycję oraz liczbę zaindeksowanych stron z raportu indeksowania.
W PageSpeed Insights zmierz `https://www.zautomatyzujemy.pl/`, `/blog`
i jeden artykuł, wariant mobilny, i zanotuj LCP oraz wynik wydajności.

- [ ] **Krok 2: Zapisz plik**

Utwórz `docs/seo/baseline.md` w tej strukturze, wypełnionej zmierzonymi wartościami:

```markdown
# Punkt odniesienia — 2026-09-10

Stan przed rozpoczęciem projektu widoczności. Wszystkie kolejne pomiary porównujemy do tej tabeli.

## Search Console, ostatnie 3 miesiące

| Miara | Wartość |
|---|---|
| Kliknięcia | |
| Wyświetlenia | |
| Średni CTR | |
| Średnia pozycja | |
| Strony zaindeksowane | |
| Kliknięcia na adresy komercyjne | 0 (nie istnieją) |

## PageSpeed Insights, wariant mobilny

| Adres | LCP | Wynik wydajności |
|---|---|---|
| / | | |
| /blog | | |
| /blog/<wybrany artykuł> | | |

Pomiar laboratoryjny. Dane od realnych użytkowników sprawdzamy osobno w Search Console,
gdy uzbiera się ruch — to nie są te same liczby.

## Leady

| Miara | Wartość |
|---|---|
| Leady łącznie | 10 |
| Leady z rozpoznanym źródłem | 0 |
```

- [ ] **Krok 3: Commit**

```bash
git add docs/seo/baseline.md
git commit -m "docs(seo): punkt odniesienia przed projektem widocznosci"
```

---

## Domknięcie

- [ ] **Krok 1: Pełna weryfikacja**

```bash
npm test && npm run type-check && npm run lint && npm run build
```

Oczekiwane: wszystko przechodzi, build kończy się bez błędów.

- [ ] **Krok 2: Wypchnij gałąź i otwórz pull request**

```bash
git push -u origin feat/atrybucja-leadow
gh pr create --title "Atrybucja leadow i kanoniczny host" --body "Powiazanie leada ze zrodlem wizyty i strona wejscia oraz poprawka wartosci domyslnej hosta. Pierwszy z czterech planow projektu widocznosci."
```

- [ ] **Krok 3: Po wdrożeniu sprawdź produkcję**

Wejdź na witrynę z LinkedIna albo z wyniku wyszukiwania, wyślij formularz kontaktowy
i sprawdź w bazie, czy `source_kind` odpowiada rzeczywistej drodze wejścia.

**Kryterium ukończenia planu:** nowy lead z produkcji ma wypełnione `source_kind` i `landing_path`,
a `curl` na domenę bez www zwraca 308.
