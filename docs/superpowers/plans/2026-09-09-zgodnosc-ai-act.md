# Zgodność z AI Act — plan wdrożenia

> **Dla agentów wykonujących:** WYMAGANY SUB-SKILL: użyj `superpowers:subagent-driven-development` (zalecane) albo `superpowers:executing-plans`, żeby wykonać ten plan zadanie po zadaniu. Kroki mają składnię checkboxów (`- [ ]`).

**Cel:** Oznaczyć maszynowo i widocznie treści generowane przez AI, dać właścicielowi przełącznik trybu publikacji bloga i wewnętrzny rejestr systemów AI — czyli wdrożyć u siebie obowiązki przejrzystości z art. 50 AI Act.

**Architektura:** Cała logika decyzyjna („czy publikować", „co napisać w adnotacji") siedzi w jednym module bez zależności od Next.js i bazy — `lib/ai-disclosure.ts` — dzięki czemu da się ją przetestować przez `node:test`. Odczyt i zapis trybu publikacji izoluje `lib/app-settings.ts`. Trasa `/api/blog/publish` zamienia dzisiejsze bezwarunkowe `is_published: true` na wynik funkcji czystej. Widoczna adnotacja to jeden komponent serwerowy, znacznik maszynowy to dwa meta tagi i jedno pole w istniejącym JSON-LD.

**Stos:** Next.js 15 App Router, TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Supabase (service role), Tailwind, `node:test` z `typescript` do testów, Resend do powiadomień.

**Spec:** `docs/superpowers/specs/2026-09-08-zgodnosc-ai-act-design.md`

---

## Rozstrzygnięcia podjęte przed pisaniem planu

Spec zostawiał dwie rzeczy do sprawdzenia. Obie sprawdzone w źródłach, nie z pamięci.

**1. Składnia znacznika IPTC w schema.org.** Spec zakładał wstawienie surowego URI IPTC jako wartości. To niedokładne. Schema.org ma własną właściwość `digitalSourceType` o dziedzinie `CreativeWork`, a więc również `BlogPosting`. Jej oczekiwaną wartością jest człon wyliczenia `IPTCDigitalSourceEnumeration`. Kanoniczny człon dla treści wygenerowanej maszynowo to **`https://schema.org/TrainedAlgorithmicMediaDigitalSource`**, opisany przez schema.org jako zakodowany według słownika IPTC i linkujący do niego. Używamy wartości schema.org, bo to ona jest poprawna w kontekście `https://schema.org`.

**2. Czy `blog-brief.mjs` wymaga tych samych zmian co `blog-auto.mjs`.** Tak, dokładnie tych samych. Oba skrypty mają identyczną funkcję `publishPost(post)` i wołają ją z obiektem o tym samym kształcie: `slug`, `title`, `excerpt`, `content`, `cover_image`, `tags`, `author`. Różnią się wyłącznie źródłem treści — jeden generuje temat, drugi czyta RSS. Zmiana w obu jest identyczna co do znaku.

**3. Numer migracji.** Kolejna wolna to `012`, nie `010`. Numery `010_services_pages.sql` i `011_services_content.sql` są zajęte przez odłożoną gałąź `feat/strony-uslugowe`. Użycie `010` dałoby dwie różne migracje o tym samym numerze.

---

## Struktura plików

### Nowe

| Plik | Odpowiedzialność |
|---|---|
| `supabase/migrations/012_ai_transparency.sql` | Trzy kolumny w `posts`, tabela `app_settings` z jednym wierszem |
| `lib/ai-disclosure.ts` | Logika czysta: treść adnotacji, stan publikacji, stała schema.org |
| `scripts/ai-disclosure.test.mjs` | Testy powyższego |
| `lib/app-settings.ts` | Odczyt i zapis `blog_publish_mode` |
| `lib/ai-registry.ts` | Typowana stała z pięcioma systemami AI |
| `app/blog/_components/AiDisclosure.tsx` | Widoczna adnotacja pod artykułem |
| `app/admin/ustawienia/page.tsx` | Przełącznik trybu publikacji |
| `app/admin/rejestr-ai/page.tsx` | Rejestr systemów AI |
| `app/admin/blog/_components/approve-button.tsx` | Zatwierdzenie szkicu |

### Modyfikowane

| Plik | Zmiana |
|---|---|
| `types/index.ts` | `Post` plus trzy pola, `BlogPublishPayload` plus dwa |
| `app/api/blog/publish/route.ts` | Tryb publikacji zamiast `is_published: true` |
| `app/blog/[slug]/page.tsx` | Meta tagi, `digitalSourceType`, adnotacja |
| `lib/actions/admin.actions.ts` | `approvePostAction`, `setBlogPublishModeAction` |
| `app/admin/blog/page.tsx` | Znacznik AI i przycisk zatwierdzenia |
| `app/admin/_components/admin-sidebar.tsx` | Dwie pozycje nawigacji |
| `lib/email/resend.ts` | Powiadomienie o szkicu czekającym na zatwierdzenie |
| `.github/scripts/blog-auto.mjs` | Dwa pola w payloadzie |
| `.github/scripts/blog-brief.mjs` | Dwa pola w payloadzie |
| `package.json` | Skrypt `test` |
| `.github/workflows/ci.yml` | Uruchamianie testów |

---

## Zadanie 0: Gałąź robocza

W tym katalogu pracuje równolegle Codex. Przełączenie gałęzi w `C:\Projects\zautomatyzujemy`, gdy ma otwartą sesję, wywraca mu pracę w połowie — 7 września skończyło się to całą sesją animacji zrobioną na złej gałęzi.

- [ ] **Krok 1: Sprawdź, czy Codex nie pracuje w katalogu głównym**

```bash
git worktree list && git status --short
```

Oczekiwane: katalog główny na `main`, bez zmodyfikowanych plików śledzonych. Nietknięte `.worktrees/`, `output/` i `tmp/` są w porządku — nie są nasze.

- [ ] **Krok 2: Załóż gałąź**

```bash
git fetch origin && git switch -c feat/zgodnosc-ai-act origin/main
```

Jeśli Codex ma otwartą sesję w katalogu głównym, użyj zamiast tego własnego worktree:

```bash
git worktree add .worktrees/zgodnosc-ai-act -b feat/zgodnosc-ai-act origin/main
```

---

## Zadanie 1: Migracja bazy

**Pliki:**
- Utwórz: `supabase/migrations/012_ai_transparency.sql`

- [ ] **Krok 1: Napisz migrację**

```sql
-- ============================================================
-- Migracja 012: Przejrzystość AI (art. 50 AI Act)
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── posts: znacznik maszynowego pochodzenia ─────────────────────────────────

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_model     TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at  TIMESTAMPTZ;

COMMENT ON COLUMN posts.ai_generated IS 'Czy tresc powstala maszynowo (art. 50 ust. 2 AI Act)';
COMMENT ON COLUMN posts.ai_model     IS 'Model uzyty do wygenerowania, np. gemini-2.5-flash';
COMMENT ON COLUMN posts.reviewed_at  IS 'Kiedy zatwierdzono redakcyjnie — dowod kontroli redakcyjnej (art. 50 ust. 4)';

-- Istniejące wpisy zostają z ai_generated = false. Nie mamy pewności co do
-- pochodzenia każdego z nich, a oznaczanie wstecz na podstawie domysłu byłoby
-- zmyślaniem dowodu.

-- ─── app_settings: ustawienia aplikacji ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Start w trybie redakcyjnym: nic nie trafia na stronę bez zatwierdzenia.
INSERT INTO app_settings (key, value)
VALUES ('blog_publish_mode', 'review')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Świadomie bez polityki publicznego odczytu — ustawienia są wewnętrzne.
CREATE POLICY "Service role — pelny dostep do app_settings"
  ON app_settings FOR ALL
  USING (auth.role() = 'service_role');
```

- [ ] **Krok 2: Zastosuj migrację w Supabase**

Wklej całą zawartość pliku do Supabase Dashboard → SQL Editor i uruchom.

Oczekiwane: `Success. No rows returned.`

- [ ] **Krok 3: Zweryfikuj, że kolumny i wiersz istnieją**

W SQL Editor:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
  AND column_name IN ('ai_generated', 'ai_model', 'reviewed_at')
ORDER BY column_name;

SELECT key, value FROM app_settings;
```

Oczekiwane: trzy wiersze z pierwszego zapytania — `ai_generated` typu `boolean` z domyślnym `false` i `is_nullable = NO`, `ai_model` typu `text`, `reviewed_at` typu `timestamp with time zone`. Z drugiego jeden wiersz: `blog_publish_mode` o wartości `review`.

- [ ] **Krok 4: Commit**

```bash
git add supabase/migrations/012_ai_transparency.sql
git commit -m "feat(ai-act): migracja 012 — znacznik AI w postach i tabela ustawien"
```

---

## Zadanie 2: Logika czysta i testy

Tu leży całość decyzji. Reszta wdrożenia tylko woła te funkcje.

**Pliki:**
- Modyfikuj: `package.json`
- Utwórz: `scripts/ai-disclosure.test.mjs`
- Utwórz: `lib/ai-disclosure.ts`

- [ ] **Krok 1: Dodaj skrypt testowy do `package.json`**

W sekcji `"scripts"`, zaraz po linii `"type-check": "tsc --noEmit",`, dodaj:

```json
    "test": "node --test \"scripts/**/*.test.mjs\"",
```

Wzorzec zostaje w cudzysłowie, bo `cmd.exe` na Windowsie nie rozwija globów — rozwija go sam Node.

- [ ] **Krok 2: Sprawdź, że skrypt działa na istniejącym teście**

Run: `npm test`
Oczekiwane: `pass 9`, `fail 0`. Przechodzi istniejący `scripts/voice-context.test.mjs`, którego nie ruszamy.

- [ ] **Krok 3: Napisz testy, które mają nie przejść**

Utwórz `scripts/ai-disclosure.test.mjs`. Sposób ładowania modułu jest przepisany z `scripts/voice-context.test.mjs`, żeby nie utrzymywać dwóch różnych sposobów wciągania TypeScriptu do testów.

```javascript
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

// Moduł jest czysty — bez Reacta, bez bazy, bez sieci — więc wystarczy
// stranspilować go do CommonJS i wykonać.
const source = readFileSync(new URL('../lib/ai-disclosure.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

// Świadomie `new Function`, a nie `vm.runInNewContext` jak w sąsiednim
// `voice-context.test.mjs`: nowy kontekst ma własny `Object.prototype`, więc
// `assert.deepEqual` ze `node:assert/strict` odrzucałby obiekty zwracane przez
// moduł mimo identycznej zawartości. Zweryfikowane — bez tego osiem testów
// stanu publikacji nie przechodzi.
const moduleExports = {}
const load = new Function('exports', 'module', compiled)
load(moduleExports, { exports: moduleExports })

const { buildDisclosureText, resolvePublishState, TRAINED_ALGORITHMIC_MEDIA } = moduleExports

// ─── Adnotacja ────────────────────────────────────────────────────────────────

test('wpis napisany przez człowieka nie dostaje adnotacji', () => {
  assert.equal(buildDisclosureText(false, null), null)
})

test('wpis zatwierdzony redakcyjnie deklaruje sprawdzenie wraz z datą', () => {
  const text = buildDisclosureText(true, '2026-09-08T10:15:00.000Z')
  assert.equal(
    text,
    'Tekst przygotowany przez redaktora AI Zautomatyzujemy.pl, sprawdzony przed publikacją 8 września 2026.'
  )
})

test('wpis opublikowany automatycznie nie deklaruje sprawdzenia', () => {
  const text = buildDisclosureText(true, null)
  assert.equal(
    text,
    'Tekst przygotowany przez redaktora AI Zautomatyzujemy.pl, publikowany automatycznie.'
  )
  // Sedno całego mechanizmu: zdanie o weryfikacji pod tekstem, którego nikt
  // nie czytał, podważa zwolnienie, na którym opieramy zgodność.
  assert.ok(!text.includes('sprawdzony'))
})

test('data zatwierdzenia nie zdradza godziny ani strefy', () => {
  const text = buildDisclosureText(true, '2026-01-03T23:45:00.000Z')
  assert.ok(text.includes('stycznia 2026'))
  assert.ok(!text.includes(':'))
})

// ─── Stan publikacji ──────────────────────────────────────────────────────────

const NOW = '2026-09-09T12:00:00.000Z'

test('tryb automatyczny publikuje od razu, tak jak dzisiaj', () => {
  assert.deepEqual(resolvePublishState('auto', NOW, null, null), {
    is_published: true,
    published_at: NOW,
    reviewed_at: null,
  })
})

test('tryb automatyczny szanuje datę publikacji z payloadu', () => {
  const state = resolvePublishState('auto', NOW, '2026-09-01T08:00:00.000Z', null)
  assert.equal(state.published_at, '2026-09-01T08:00:00.000Z')
})

test('tryb redakcyjny zatrzymuje wpis jako szkic', () => {
  assert.deepEqual(resolvePublishState('review', NOW, null, null), {
    is_published: false,
    published_at: null,
    reviewed_at: null,
  })
})

test('tryb redakcyjny ignoruje datę publikacji z payloadu', () => {
  const state = resolvePublishState('review', NOW, '2026-09-01T08:00:00.000Z', null)
  assert.equal(state.is_published, false)
  assert.equal(state.published_at, null)
})

test('ponowienie żądania nie cofa decyzji redaktora', () => {
  const zatwierdzony = {
    is_published: true,
    published_at: '2026-09-05T09:00:00.000Z',
    reviewed_at: '2026-09-05T08:55:00.000Z',
  }
  // Generator ponawia żądanie, panel stoi w trybie redakcyjnym. Bez tej gałęzi
  // zatwierdzony artykuł zniknąłby ze strony.
  assert.deepEqual(resolvePublishState('review', NOW, null, zatwierdzony), zatwierdzony)
})

test('ponowienie żądania na niezatwierdzonym szkicu zostawia go szkicem', () => {
  const szkic = { is_published: false, published_at: null, reviewed_at: null }
  assert.deepEqual(resolvePublishState('review', NOW, null, szkic), {
    is_published: false,
    published_at: null,
    reviewed_at: null,
  })
})

// ─── Znacznik schema.org ──────────────────────────────────────────────────────

test('stała wskazuje człon wyliczenia schema.org, nie surowy URI IPTC', () => {
  assert.equal(
    TRAINED_ALGORITHMIC_MEDIA,
    'https://schema.org/TrainedAlgorithmicMediaDigitalSource'
  )
})
```

- [ ] **Krok 4: Uruchom testy i potwierdź, że nie przechodzą**

Run: `npm test`
Oczekiwane: niepowodzenie z `ENOENT` na `lib/ai-disclosure.ts` — plik jeszcze nie istnieje.

- [ ] **Krok 5: Napisz moduł**

Utwórz `lib/ai-disclosure.ts`:

```typescript
/**
 * Treść widocznej adnotacji pod artykułem, stan publikacji i znacznik maszynowy.
 *
 * Moduł jest celowo wolny od zależności — testuje go `scripts/ai-disclosure.test.mjs`
 * bez bazy, Reacta i sieci.
 */

/**
 * Człon wyliczenia `IPTCDigitalSourceEnumeration` oznaczający treść w całości
 * wygenerowaną maszynowo. Schema.org opisuje go jako zakodowany według słownika
 * IPTC — dlatego w JSON-LD używamy tej wartości, a nie surowego URI IPTC.
 */
export const TRAINED_ALGORITHMIC_MEDIA =
  'https://schema.org/TrainedAlgorithmicMediaDigitalSource'

const AUTHOR_PHRASE = 'Tekst przygotowany przez redaktora AI Zautomatyzujemy.pl'

export type BlogPublishMode = 'review' | 'auto'

export interface PublishState {
  is_published: boolean
  published_at: string | null
  reviewed_at: string | null
}

function formatReviewDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Zwraca `null` dla treści pisanej przez człowieka — wtedy adnotacji nie ma wcale.
 *
 * Dowodem kontroli redakcyjnej jest `reviewedAt`, nie tryb ustawiony dzisiaj
 * w panelu. Dzięki temu przełączenie trybu nie zmienia wstecz tego, co adnotacja
 * mówi o artykułach opublikowanych wcześniej.
 */
export function buildDisclosureText(
  aiGenerated: boolean,
  reviewedAt: string | null
): string | null {
  if (!aiGenerated) return null
  if (reviewedAt) {
    return `${AUTHOR_PHRASE}, sprawdzony przed publikacją ${formatReviewDate(reviewedAt)}.`
  }
  return `${AUTHOR_PHRASE}, publikowany automatycznie.`
}

/**
 * Rozstrzyga, czy przychodzący artykuł ma trafić na stronę, czy poczekać w panelu.
 *
 * `existing` to stan wpisu o tym samym slugu, jeśli już jest w bazie.
 */
export function resolvePublishState(
  mode: BlogPublishMode,
  now: string,
  requestedPublishedAt: string | null,
  existing: PublishState | null
): PublishState {
  // Artykuł raz zatwierdzony przez człowieka nie wraca do szkiców przy ponowieniu
  // żądania z generatora — inaczej retry cofałby decyzję redaktora.
  if (existing?.reviewed_at) {
    return existing
  }

  if (mode === 'review') {
    return { is_published: false, published_at: null, reviewed_at: null }
  }

  return {
    is_published: true,
    published_at: requestedPublishedAt ?? now,
    reviewed_at: null,
  }
}
```

- [ ] **Krok 6: Uruchom testy i potwierdź, że przechodzą**

Run: `npm test`
Oczekiwane: `pass 20`, `fail 0` — dziewięć testów Codeksa plus jedenaście nowych.

- [ ] **Krok 7: Podłącz testy do CI**

W `.github/workflows/ci.yml`, w zadaniu `lint-and-typecheck`, po kroku `Type check` dodaj:

```yaml
      - name: Tests
        run: npm test
```

- [ ] **Krok 8: Commit**

```bash
git add package.json .github/workflows/ci.yml lib/ai-disclosure.ts scripts/ai-disclosure.test.mjs
git commit -m "feat(ai-act): logika adnotacji i trybu publikacji z testami"
```

---

## Zadanie 3: Typy i odczyt ustawień

**Pliki:**
- Modyfikuj: `types/index.ts:8-21` (interfejs `Post`) oraz `types/index.ts:151-160` (`BlogPublishPayload`)
- Utwórz: `lib/app-settings.ts`

- [ ] **Krok 1: Rozszerz `Post` o trzy pola**

W `types/index.ts` zamień interfejs `Post` na:

```typescript
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
  /** Czy treść powstała maszynowo (art. 50 ust. 2 AI Act) */
  ai_generated: boolean
  /** Model użyty do wygenerowania, np. `gemini-2.5-flash` */
  ai_model: string | null
  /** Kiedy zatwierdzono redakcyjnie — dowód kontroli redakcyjnej */
  reviewed_at: string | null
}
```

- [ ] **Krok 2: Rozszerz `BlogPublishPayload` o dwa pola**

W tym samym pliku zamień `BlogPublishPayload` na:

```typescript
export interface BlogPublishPayload {
  slug: string
  title: string
  content: string
  excerpt?: string
  cover_image?: string
  author?: string
  tags?: string[]
  published_at?: string
  /** Ustawiane przez generatory z `.github/scripts/` */
  ai_generated?: boolean
  ai_model?: string
}
```

- [ ] **Krok 3: Napisz moduł ustawień**

Utwórz `lib/app-settings.ts`:

```typescript
import { createServiceClient } from '@/lib/supabase/server'
import type { BlogPublishMode } from '@/lib/ai-disclosure'

const BLOG_PUBLISH_MODE_KEY = 'blog_publish_mode'

/**
 * Tabela `app_settings` nie ma polityki publicznego odczytu, więc czytamy ją
 * klientem service role.
 */
export async function getBlogPublishMode(): Promise<BlogPublishMode> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', BLOG_PUBLISH_MODE_KEY)
    .maybeSingle()

  if (error) {
    // Nieodczytany tryb traktujemy jak redakcyjny: wstrzymana publikacja jest
    // odwracalna jednym kliknięciem, opublikowany bez nadzoru artykuł nie jest.
    console.error('[app-settings] Nie udało się odczytać trybu publikacji:', error.message)
    return 'review'
  }

  return data?.value === 'auto' ? 'auto' : 'review'
}

export async function setBlogPublishMode(
  mode: BlogPublishMode
): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('app_settings')
    .update({ value: mode, updated_at: new Date().toISOString() })
    .eq('key', BLOG_PUBLISH_MODE_KEY)

  return { error: error?.message ?? null }
}
```

- [ ] **Krok 4: Sprawdź typy**

Run: `npm run type-check`
Oczekiwane: brak błędów. Jeśli `tsc` zgłasza brak `ai_generated` w miejscach, gdzie budowany jest obiekt `Post`, to znaczy, że któryś plik konstruuje posta ręcznie — dopisz tam pola zamiast zmieniać interfejs.

- [ ] **Krok 5: Commit**

```bash
git add types/index.ts lib/app-settings.ts
git commit -m "feat(ai-act): typy pol znacznika i odczyt trybu publikacji"
```

---

## Zadanie 4: Trasa publikacji respektuje tryb

To miejsce, w którym dzisiaj `is_published: true` stoi bezwarunkowo — `app/api/blog/publish/route.ts:87`.

**Pliki:**
- Modyfikuj: `app/api/blog/publish/route.ts`

- [ ] **Krok 1: Dodaj dwa pola do schematu Zod**

W `BlogPublishSchema`, po linii `published_at: z.string().datetime().optional(),`, dodaj:

```typescript
  ai_generated: z.boolean().optional(),
  ai_model: z.string().max(100).optional(),
```

- [ ] **Krok 2: Dodaj importy**

Na górze pliku, po `import type { BlogPublishPayload } from '@/types'`, dodaj:

```typescript
import { resolvePublishState } from '@/lib/ai-disclosure'
import { getBlogPublishMode } from '@/lib/app-settings'
```

- [ ] **Krok 3: Zamień blok zapisu do bazy**

Zastąp fragment od `const { data: existing } = await supabase` do zamknięcia `postData` następującym kodem:

```typescript
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
```

- [ ] **Krok 4: Zwróć w odpowiedzi informację o stanie**

Zastąp końcowy blok `console.log` i `return NextResponse.json` poniższym:

```typescript
  const statusLabel = publishState.is_published ? 'Opublikowano' : 'Zapisano szkic'
  console.log(`[/api/blog/publish] ${statusLabel}: "${payload.title}" (${payload.slug})`)

  return NextResponse.json({
    success: true,
    slug: payload.slug,
    url: `/blog/${payload.slug}`,
    published: publishState.is_published,
  })
```

- [ ] **Krok 5: Sprawdź typy i lint**

Run: `npm run type-check && npm run lint`
Oczekiwane: brak błędów.

- [ ] **Krok 6: Commit**

```bash
git add app/api/blog/publish/route.ts
git commit -m "feat(ai-act): publikacja bloga respektuje tryb redakcyjny"
```

---

## Zadanie 5: Powiadomienie o szkicu czekającym na zatwierdzenie

Bez tego tryb redakcyjny znaczy „artykuły cicho znikają" — nikt nie wie, że coś czeka.

**Pliki:**
- Modyfikuj: `lib/email/resend.ts`
- Modyfikuj: `app/api/blog/publish/route.ts`

- [ ] **Krok 1: Dodaj funkcję wysyłki**

Na końcu `lib/email/resend.ts`, przed `function escHtml`, dodaj:

```typescript
/**
 * Wysyłane, gdy generator zapisał artykuł jako szkic w trybie redakcyjnym.
 * Bez tego sygnału tryb redakcyjny znaczy tylko tyle, że artykuły przestają się
 * pojawiać, a nikt nie wie dlaczego.
 */
export async function sendDraftAwaitingReview(
  title: string,
  slug: string
): Promise<void> {
  if (!TO_EMAIL || !process.env['RESEND_API_KEY']) {
    console.warn(
      `[resend:draft] pominięto — TO_EMAIL=${TO_EMAIL ? 'ok' : 'brak'}, klucz=${process.env['RESEND_API_KEY'] ? 'ok' : 'brak'}`
    )
    return
  }

  const siteUrl = 'https://zautomatyzujemy.pl'

  const result = await getResend().emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `📝 Szkic czeka na zatwierdzenie — ${title}`,
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
            <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#e2e3df">Szkic czeka na zatwierdzenie</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111827">${escHtml(title)}</p>
            <p style="margin:0 0 24px;font-size:13px;color:#6b7280">/blog/${escHtml(slug)}</p>
            <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.6">
              Redaktor AI przygotował artykuł. Panel stoi w trybie redakcyjnym, więc tekst
              nie trafił na stronę i czeka na Twoje sprawdzenie.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0">
                  <a href="${siteUrl}/admin/blog"
                     style="display:inline-block;padding:14px 32px;background:#ffa07b;color:#1a0a00;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px">
                    Otwórz panel →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

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
</html>`,
  })

  assertSent(`draft→${slug}`, result)
}
```

- [ ] **Krok 2: Zawołaj ją z trasy publikacji**

W `app/api/blog/publish/route.ts` dodaj import na górze:

```typescript
import { sendDraftAwaitingReview } from '@/lib/email/resend'
```

Następnie, tuż przed blokiem `revalidatePath`, wstaw:

```typescript
  // Await, nie fire-and-forget: na Vercelu funkcja kończy się po odpowiedzi
  // i porzucona obietnica ginie. Błąd wysyłki nie może jednak wywrócić publikacji.
  if (!publishState.is_published) {
    try {
      await sendDraftAwaitingReview(payload.title, payload.slug)
    } catch (err) {
      console.error('[/api/blog/publish] Nie udało się wysłać powiadomienia o szkicu:', err)
    }
  }
```

- [ ] **Krok 3: Sprawdź typy i lint**

Run: `npm run type-check && npm run lint`
Oczekiwane: brak błędów.

- [ ] **Krok 4: Commit**

```bash
git add lib/email/resend.ts app/api/blog/publish/route.ts
git commit -m "feat(ai-act): powiadomienie mailowe o szkicu czekajacym na zatwierdzenie"
```

---

## Zadanie 6: Znacznik i adnotacja na stronie artykułu

**Pliki:**
- Utwórz: `app/blog/_components/AiDisclosure.tsx`
- Modyfikuj: `app/blog/[slug]/page.tsx`

- [ ] **Krok 1: Napisz komponent adnotacji**

Utwórz `app/blog/_components/AiDisclosure.tsx`. Nazwa w PascalCase dopasowana do sąsiada `BlogCarousel.tsx`. Kolory pochodzą z palety strony bloga, bez własnego CSS.

```tsx
import { buildDisclosureText } from '@/lib/ai-disclosure'

interface AiDisclosureProps {
  aiGenerated: boolean
  reviewedAt: string | null
}

export function AiDisclosure({ aiGenerated, reviewedAt }: AiDisclosureProps) {
  const text = buildDisclosureText(aiGenerated, reviewedAt)
  if (!text) return null

  return (
    <p className="mt-12 border-t border-[#d9d6d0] pt-5 text-xs leading-relaxed text-[#86867f]">
      {text}
    </p>
  )
}
```

- [ ] **Krok 2: Dodaj importy w stronie artykułu**

W `app/blog/[slug]/page.tsx`, po `import { getBlogCover } from '@/lib/editorial-covers'`, dodaj:

```typescript
import { TRAINED_ALGORITHMIC_MEDIA } from '@/lib/ai-disclosure'
import { AiDisclosure } from '../_components/AiDisclosure'
```

- [ ] **Krok 3: Dołóż pola do zapytania w `generateMetadata`**

Zamień listę kolumn w `generateMetadata`:

```typescript
    .select('title, excerpt, cover_image, published_at, updated_at, author, ai_generated, ai_model')
```

- [ ] **Krok 4: Dodaj meta tagi**

W `generateMetadata`, po linii `const description = data.excerpt ?? data.title`, wstaw:

```typescript
  // Budujemy obiekt zamiast rozwijać warunkowo — `exactOptionalPropertyTypes`
  // odrzuca właściwość, która raz jest, a raz jej nie ma.
  const aiMeta: Record<string, string> = {}
  if (data.ai_generated) {
    aiMeta['ai-generated'] = 'true'
    if (data.ai_model) aiMeta['ai-model'] = data.ai_model
  }
```

Następnie w zwracanym obiekcie, po bloku `twitter: { ... },`, dodaj:

```typescript
    other: aiMeta,
```

- [ ] **Krok 5: Dodaj `digitalSourceType` do JSON-LD**

W pierwszym `JsonLd` (typ `BlogPosting`), po linii `mainEntityOfPage: { ... },`, dodaj:

```typescript
          ...(post.ai_generated && { digitalSourceType: TRAINED_ALGORITHMIC_MEDIA }),
```

- [ ] **Krok 6: Wyświetl adnotację pod treścią**

W elemencie `<article>`, zaraz po `<MDXRemote source={post.content} components={safeMdxComponents} />`, dodaj:

```tsx
        <AiDisclosure aiGenerated={post.ai_generated} reviewedAt={post.reviewed_at} />
```

- [ ] **Krok 7: Sprawdź typy, lint i build**

Run: `npm run type-check && npm run lint && npm run build`
Oczekiwane: wszystkie trzy bez błędów.

- [ ] **Krok 8: Sprawdź w przeglądarce**

Uruchom `npm run dev` i otwórz dowolny istniejący artykuł. Ponieważ wszystkie mają `ai_generated = false`, **adnotacji nie powinno być widać, a w źródle strony nie powinno być `digitalSourceType`** — to jest poprawny wynik, nie usterka.

Żeby zobaczyć adnotację, ustaw tymczasowo w Supabase SQL Editor:

```sql
UPDATE posts SET ai_generated = true, ai_model = 'gemini-2.5-flash'
WHERE slug = (SELECT slug FROM posts WHERE is_published = true ORDER BY published_at DESC LIMIT 1);
```

Odśwież artykuł. Oczekiwane: pod tekstem szara linia i zdanie o publikacji automatycznej, w źródle strony `"digitalSourceType":"https://schema.org/TrainedAlgorithmicMediaDigitalSource"` oraz `<meta name="ai-generated" content="true">`.

Cofnij zmianę:

```sql
UPDATE posts SET ai_generated = false, ai_model = NULL
WHERE ai_generated = true;
```

- [ ] **Krok 9: Commit**

```bash
git add app/blog/_components/AiDisclosure.tsx "app/blog/[slug]/page.tsx"
git commit -m "feat(ai-act): znacznik maszynowy i widoczna adnotacja pod artykulem"
```

---

## Zadanie 7: Zatwierdzanie szkiców w panelu

**Pliki:**
- Modyfikuj: `lib/actions/admin.actions.ts`
- Utwórz: `app/admin/blog/_components/approve-button.tsx`
- Modyfikuj: `app/admin/blog/page.tsx`

- [ ] **Krok 1: Dodaj akcję zatwierdzania**

W `lib/actions/admin.actions.ts`, po `deletePostAction`, dodaj:

```typescript
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
```

- [ ] **Krok 2: Napisz przycisk**

Utwórz `app/admin/blog/_components/approve-button.tsx`. Wzorzec przepisany z sąsiedniego `delete-button.tsx`.

```tsx
'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { approvePostAction } from '@/lib/actions/admin.actions'

interface ApproveButtonProps {
  postId: string
  postTitle: string
}

export function ApproveButton({ postId, postTitle }: ApproveButtonProps) {
  const [isPending, setIsPending] = useState(false)

  async function handleApprove() {
    if (!confirm(`Opublikować "${postTitle}"? Potwierdzasz, że tekst został sprawdzony.`)) return
    setIsPending(true)
    const result = await approvePostAction(postId)
    setIsPending(false)
    if (!result.success) alert(result.error)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleApprove}
      disabled={isPending}
      title="Zatwierdź i opublikuj"
      className="text-green-400 hover:bg-green-900/20 hover:text-green-400"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
    </Button>
  )
}
```

- [ ] **Krok 3: Pokaż przycisk i znacznik AI na liście**

W `app/admin/blog/page.tsx` zamień import ikon i dodaj import przycisku:

```typescript
import { Plus, Pencil, Eye, EyeOff, Bot } from 'lucide-react'
import { ApproveButton } from './_components/approve-button'
```

W komórce z tytułem, zaraz po `<p className="text-xs text-outline-color">/blog/{post.slug}</p>`, dodaj:

```tsx
                      {post.ai_generated && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
                          <Bot className="size-3" />
                          {post.reviewed_at ? 'AI — sprawdzony' : 'AI — niesprawdzony'}
                        </span>
                      )}
```

W komórce akcji, przed `<Button variant="ghost" size="icon" asChild>`, dodaj:

```tsx
                      {!post.is_published && (
                        <ApproveButton postId={post.id} postTitle={post.title} />
                      )}
```

- [ ] **Krok 4: Sprawdź typy i lint**

Run: `npm run type-check && npm run lint`
Oczekiwane: brak błędów.

- [ ] **Krok 5: Sprawdź w przeglądarce**

Zaloguj się do `/admin/blog`. Utwórz szkic przez „Nowy artykuł" bez zaznaczania publikacji. Oczekiwane: przy szkicu widać zielony znaczek zatwierdzenia, przy opublikowanych go nie ma. Kliknij go, potwierdź. Oczekiwane: status zmienia się na „Opublikowany", a artykuł jest dostępny pod swoim adresem.

Usuń testowy artykuł po sprawdzeniu.

- [ ] **Krok 6: Commit**

```bash
git add lib/actions/admin.actions.ts app/admin/blog/_components/approve-button.tsx app/admin/blog/page.tsx
git commit -m "feat(ai-act): zatwierdzanie szkicow i znacznik AI na liscie artykulow"
```

---

## Zadanie 8: Przełącznik trybu publikacji

**Pliki:**
- Modyfikuj: `lib/actions/admin.actions.ts`
- Utwórz: `app/admin/ustawienia/page.tsx`

- [ ] **Krok 1: Dodaj akcję zmiany trybu**

W `lib/actions/admin.actions.ts` dodaj importy na górze pliku:

```typescript
import { setBlogPublishMode } from '@/lib/app-settings'
import type { BlogPublishMode } from '@/lib/ai-disclosure'
```

Na końcu sekcji `Blog — CRUD`, po `approvePostAction`, dodaj:

```typescript
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
```

Nie owijamy `getBlogPublishMode` w akcję serwerową — `lib/app-settings.ts` nie ma dyrektywy `'use server'`, więc strona ustawień zaimportuje ją wprost.

- [ ] **Krok 2: Napisz stronę ustawień**

Utwórz `app/admin/ustawienia/page.tsx`. Zamiast komponentu przełącznika, którego nie ma w `components/ui/`, używamy formularza z jednym przyciskiem — bez nowej zależności.

```tsx
import { Bot, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setBlogPublishModeAction } from '@/lib/actions/admin.actions'
import { getBlogPublishMode } from '@/lib/app-settings'

export const metadata = { title: 'Ustawienia — Admin' }

export default async function AdminSettingsPage() {
  const mode = await getBlogPublishMode()
  const isAuto = mode === 'auto'
  const nextMode = isAuto ? 'review' : 'auto'

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Ustawienia</h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Zachowanie publikacji artykułów z generatora
      </p>

      <div className="mt-6 rounded-2xl border border-outline-variant bg-surface-container p-6">
        <div className="flex items-start gap-3">
          {isAuto ? (
            <Zap className="mt-0.5 size-5 text-amber-400" />
          ) : (
            <Bot className="mt-0.5 size-5 text-on-surface-variant" />
          )}
          <div>
            <p className="font-semibold text-on-surface">
              {isAuto ? 'Tryb automatyczny' : 'Tryb redakcyjny'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {isAuto
                ? 'Artykuły trafiają na stronę bez sprawdzenia. Zgodność opiera się wtedy wyłącznie na znaczniku maszynowym.'
                : 'Artykuły z generatora czekają w panelu na zatwierdzenie. Dopóki ich nie sprawdzisz, nie są widoczne na stronie.'}
            </p>
          </div>
        </div>

        <form action={setBlogPublishModeAction} className="mt-6">
          <input type="hidden" name="mode" value={nextMode} />
          <Button type="submit" size="lg" variant={isAuto ? 'outline' : 'default'}>
            {isAuto ? 'Wróć do trybu redakcyjnego' : 'Przełącz na automat'}
          </Button>
        </form>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
        Znacznik maszynowy zapisywany jest w obu trybach. Adnotacja pod artykułem mówi
        o weryfikacji tylko wtedy, gdy weryfikacja faktycznie była.
      </p>
    </div>
  )
}
```

- [ ] **Krok 3: Dodaj pozycję w nawigacji**

W `app/admin/_components/admin-sidebar.tsx` zamień import ikon i tablicę `navItems`:

```typescript
import { FileText, Layers, LogOut, Zap, Trophy, Settings } from 'lucide-react'
```

```typescript
const navItems = [
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/case-studies', label: 'Case Study', icon: Trophy },
  { href: '/admin/content', label: 'Treść strony', icon: Layers },
  { href: '/admin/ustawienia', label: 'Ustawienia', icon: Settings },
]
```

- [ ] **Krok 4: Sprawdź typy i lint**

Run: `npm run type-check && npm run lint`
Oczekiwane: brak błędów.

- [ ] **Krok 5: Sprawdź działanie przełącznika**

Otwórz `/admin/ustawienia`. Oczekiwane: „Tryb redakcyjny". Kliknij „Przełącz na automat". Oczekiwane: strona przeładowuje się i pokazuje „Tryb automatyczny" bez wdrożenia i bez restartu serwera. Potwierdź w Supabase:

```sql
SELECT key, value, updated_at FROM app_settings WHERE key = 'blog_publish_mode';
```

Oczekiwane: `auto` ze świeżym `updated_at`. Przełącz z powrotem na tryb redakcyjny.

- [ ] **Krok 6: Commit**

```bash
git add lib/actions/admin.actions.ts app/admin/ustawienia/page.tsx app/admin/_components/admin-sidebar.tsx
git commit -m "feat(ai-act): przelacznik trybu publikacji bloga w panelu"
```

---

## Zadanie 9: Wewnętrzny rejestr systemów AI

Bez tabeli w bazie — pięć pozycji zmienianych raz na kwartał to stała w kodzie, nie schemat.

**Pliki:**
- Utwórz: `lib/ai-registry.ts`
- Utwórz: `app/admin/rejestr-ai/page.tsx`
- Modyfikuj: `app/admin/_components/admin-sidebar.tsx`

- [ ] **Krok 1: Napisz rejestr**

Utwórz `lib/ai-registry.ts`. Nazwy modeli sprawdzone w kodzie: czat w `app/api/chat/route.ts:209`, embeddingi w `app/api/chat/route.ts:40`, generatory w `.github/scripts/`.

```typescript
/**
 * Wewnętrzny rejestr systemów AI używanych przez Zautomatyzujemy.pl.
 *
 * Świadomie w kodzie, a nie w bazie: pięć pozycji zmienianych raz na kwartał
 * nie potrzebuje schematu ani edytora. Rejestr jest wewnętrzny — właściciel nie
 * pokazuje konkurencji, z czego korzysta.
 */

/** Rola w rozumieniu rozporządzenia: budujemy system czy tylko go stosujemy. */
export type AiRole = 'dostawca' | 'podmiot stosujący'

export interface AiSystemEntry {
  name: string
  model: string
  purpose: string
  inputs: string
  role: AiRole
}

export const AI_SYSTEMS: readonly AiSystemEntry[] = [
  {
    name: 'Klara — czat tekstowy',
    model: 'gemini-2.5-flash',
    purpose: 'Odpowiedzi na pytania odwiedzających i zbieranie zgłoszeń kontaktowych',
    inputs: 'Wiadomości użytkownika, baza wiedzy o ofercie',
    role: 'podmiot stosujący',
  },
  {
    name: 'Klara — kanał głosowy',
    model: 'Konfiguracja po stronie Vapi — do uzupełnienia po weryfikacji',
    purpose: 'Rozmowa głosowa z odwiedzającym stronę',
    inputs: 'Mowa użytkownika, kontekst przekazywany ze strony',
    role: 'podmiot stosujący',
  },
  {
    name: 'blog-auto',
    model: 'gemini-2.5-flash oraz gemini-2.5-flash-image',
    purpose: 'Cotygodniowy artykuł na blog wraz z okładką',
    inputs: 'Lista dotychczasowych tematów pobierana ze strony',
    role: 'podmiot stosujący',
  },
  {
    name: 'blog-brief',
    model: 'gemini-2.5-flash oraz gemini-2.5-flash-image',
    purpose: 'Cotygodniowy przegląd nowości AI wraz z okładką',
    inputs: 'Kanały RSS producentów modeli',
    role: 'podmiot stosujący',
  },
  {
    name: 'Baza wiedzy — embeddingi',
    model: 'gemini-embedding-001',
    purpose: 'Wyszukiwanie fragmentów dokumentów do odpowiedzi czatu',
    inputs: 'Treści marketingowe i opisy usług z tego repozytorium',
    role: 'podmiot stosujący',
  },
]
```

- [ ] **Krok 2: Napisz stronę rejestru**

Utwórz `app/admin/rejestr-ai/page.tsx`:

```tsx
import { AI_SYSTEMS } from '@/lib/ai-registry'

export const metadata = { title: 'Rejestr AI — Admin' }

export default function AdminAiRegistryPage() {
  return (
    <div>
      <h1 className="font-headline text-2xl font-bold text-on-surface">Rejestr systemów AI</h1>
      <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
        Wykaz wewnętrzny. Nie jest publikowany na stronie ani dostępny bez zalogowania.
      </p>

      <div className="mt-6 space-y-4">
        {AI_SYSTEMS.map(system => (
          <div
            key={system.name}
            className="rounded-2xl border border-outline-variant bg-surface-container p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-on-surface">{system.name}</h2>
              <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                {system.role}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-outline-color">Model</dt>
                <dd className="mt-1 text-on-surface-variant">{system.model}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-outline-color">Cel</dt>
                <dd className="mt-1 text-on-surface-variant">{system.purpose}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-outline-color">Dane wejściowe</dt>
                <dd className="mt-1 text-on-surface-variant">{system.inputs}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Krok 3: Dodaj pozycję w nawigacji**

W `app/admin/_components/admin-sidebar.tsx` dodaj `Bot` do importu z `lucide-react` i wstaw pozycję przed „Ustawienia":

```typescript
  { href: '/admin/rejestr-ai', label: 'Rejestr AI', icon: Bot },
```

- [ ] **Krok 4: Sprawdź typy i lint**

Run: `npm run type-check && npm run lint`
Oczekiwane: brak błędów.

- [ ] **Krok 5: Potwierdź, że rejestr nie jest publiczny**

Wyloguj się z panelu, następnie otwórz `http://localhost:3000/admin/rejestr-ai`.
Oczekiwane: przekierowanie na `/admin/login`. Ochronę daje istniejące `middleware.ts`, które chroni całe `/admin/*` poza stroną logowania — nie dopisujemy nowej reguły.

- [ ] **Krok 6: Commit**

```bash
git add lib/ai-registry.ts app/admin/rejestr-ai/page.tsx app/admin/_components/admin-sidebar.tsx
git commit -m "feat(ai-act): wewnetrzny rejestr systemow AI"
```

---

## Zadanie 10: Generatory oznaczają swoje artykuły

Bez tego kroku cała reszta jest martwa: żaden artykuł nie przyjdzie z ustawionym znacznikiem.

**Pliki:**
- Modyfikuj: `.github/scripts/blog-auto.mjs`
- Modyfikuj: `.github/scripts/blog-brief.mjs`

- [ ] **Krok 1: Oznacz artykuły z `blog-auto`**

W `.github/scripts/blog-auto.mjs`, w wywołaniu `publishPost` na końcu pliku, dodaj dwa pola po `author`:

```javascript
const result = await publishPost({
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt ?? '',
  content: article.content,
  cover_image: coverUrl,
  tags: article.tags ?? [],
  author: 'Zautomatyzujemy.pl',
  ai_generated: true,
  ai_model: 'gemini-2.5-flash',
})
```

- [ ] **Krok 2: Zmień komunikat końcowy**

W tym samym pliku zamień ostatnią linię:

```javascript
console.log(
  result.published
    ? `✅ Opublikowano: ${SITE_URL}${result.url}`
    : `📝 Zapisano szkic do zatwierdzenia: ${SITE_URL}/admin/blog`
)
```

- [ ] **Krok 3: Powtórz w `blog-brief`**

W `.github/scripts/blog-brief.mjs` dodaj te same dwa pola:

```javascript
const result = await publishPost({
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt ?? '',
  content: article.content,
  cover_image: coverUrl,
  tags: article.tags ?? ['Tygodniowy brief', 'Nowosci AI'],
  author: 'Zautomatyzujemy.pl',
  ai_generated: true,
  ai_model: 'gemini-2.5-flash',
})
```

oraz ten sam komunikat końcowy:

```javascript
console.log(
  result.published
    ? `✅ Opublikowano: ${SITE_URL}${result.url}`
    : `📝 Zapisano szkic do zatwierdzenia: ${SITE_URL}/admin/blog`
)
```

- [ ] **Krok 4: Sprawdź składnię obu skryptów**

Run: `node --check .github/scripts/blog-auto.mjs && node --check .github/scripts/blog-brief.mjs`
Oczekiwane: brak wyjścia, kod wyjścia 0.

- [ ] **Krok 5: Commit**

```bash
git add .github/scripts/blog-auto.mjs .github/scripts/blog-brief.mjs
git commit -m "feat(ai-act): generatory oznaczaja artykuly znacznikiem maszynowym"
```

---

## Zadanie 11: Test całej ścieżki i domknięcie

- [ ] **Krok 1: Przejdź całą ścieżkę w trybie redakcyjnym**

Upewnij się, że `/admin/ustawienia` pokazuje tryb redakcyjny, a `npm run dev` działa. Wyślij żądanie jak z generatora, podstawiając wartość `N8N_WEBHOOK_SECRET` z `.env.local`:

```bash
curl -X POST http://localhost:3000/api/blog/publish -H "Content-Type: application/json" -H "x-webhook-secret: TWOJ_SEKRET" -d '{"slug":"test-znacznika-ai","title":"Test znacznika AI","content":"Tresc testowa artykulu do sprawdzenia znacznika maszynowego.","excerpt":"Test","author":"Zautomatyzujemy.pl","tags":["test"],"ai_generated":true,"ai_model":"gemini-2.5-flash"}'
```

Oczekiwane: `{"success":true,"slug":"test-znacznika-ai","url":"/blog/test-znacznika-ai","published":false}`

- [ ] **Krok 2: Potwierdź, że szkic nie jest publiczny**

Otwórz `http://localhost:3000/blog/test-znacznika-ai`.
Oczekiwane: strona 404. Otwórz `/blog` — artykułu nie ma na liście.

Otwórz `/admin/blog`. Oczekiwane: artykuł widoczny ze statusem „Szkic" i znaczkiem „AI — niesprawdzony".

- [ ] **Krok 3: Zatwierdź i sprawdź adnotację**

Kliknij zielony znaczek zatwierdzenia i potwierdź. Otwórz `/blog/test-znacznika-ai`.

Oczekiwane: artykuł się wyświetla, a pod treścią widnieje „Tekst przygotowany przez redaktora AI Zautomatyzujemy.pl, sprawdzony przed publikacją" z dzisiejszą datą. W źródle strony obecne `<meta name="ai-generated" content="true">` oraz `"digitalSourceType":"https://schema.org/TrainedAlgorithmicMediaDigitalSource"`.

W `/admin/blog` znaczek zmienia się na „AI — sprawdzony".

- [ ] **Krok 4: Sprawdź tryb automatyczny**

Przełącz tryb na automatyczny w `/admin/ustawienia`. Wyślij to samo żądanie co w kroku 1, ale ze slugiem `test-znacznika-auto`.

Oczekiwane: `"published":true`. Artykuł od razu dostępny pod swoim adresem, a pod treścią zdanie „publikowany automatycznie" — **bez** słowa „sprawdzony".

- [ ] **Krok 5: Sprawdź, że ponowienie nie cofa zatwierdzenia**

Przełącz z powrotem na tryb redakcyjny. Wyślij ponownie żądanie ze slugiem `test-znacznika-ai` — tym, który został zatwierdzony w kroku 3.

Oczekiwane: `"published":true`, a artykuł nadal jest widoczny na stronie. Gdyby wrócił do szkiców, oznaczałoby to, że gałąź chroniąca decyzję redaktora nie działa.

- [ ] **Krok 6: Posprzątaj dane testowe**

W Supabase SQL Editor:

```sql
DELETE FROM posts WHERE slug IN ('test-znacznika-ai', 'test-znacznika-auto');
```

Ustaw tryb publikacji na docelowy — redakcyjny, jeśli właściciel nie zdecyduje inaczej.

- [ ] **Krok 7: Pełna weryfikacja**

Run: `npm test && npm run type-check && npm run lint && npm run build`
Oczekiwane: testy `pass 20`, pozostałe trzy komendy bez błędów.

- [ ] **Krok 8: Sprawdź, że nic innego się nie zepsuło**

Otwórz kolejno stronę główną, `/blog`, `/case-studies`, formularz kontaktowy i czat Klary.
Oczekiwane: wszystko działa jak przed zmianą. Kryterium 6 ze specu.

- [ ] **Krok 9: Otwórz PR**

```bash
git push -u origin feat/zgodnosc-ai-act
gh pr create --title "Zgodnosc z AI Act: znacznik tresci AI, tryb redakcyjny, rejestr systemow" --body "Wdrozenie specu docs/superpowers/specs/2026-09-08-zgodnosc-ai-act-design.md."
```

---

## Zadanie poza kodem — dla właściciela

- [ ] **Weryfikacja kanału głosowego Klary.** Sprawdzić w panelu Vapi, czy asystent na początku rozmowy informuje, że jest sztuczną inteligencją. To ten sam obowiązek z art. 50 ust. 1, który czat tekstowy już spełnia. Potwierdzone przy pisaniu planu: w repozytorium nie ma żadnej formuły powitania — `components/voice/use-voice-call.ts` przekazuje wyłącznie kontekst strony, więc ujawnienie musi siedzieć w konfiguracji asystenta. Po weryfikacji uzupełnić nazwę modelu w `lib/ai-registry.ts`.

- [ ] **Decyzja o trybie docelowym.** Po wdrożeniu panel stoi w trybie redakcyjnym. Właściciel decyduje, czy zostaje, czy przełącza na automat.
