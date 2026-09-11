# Silnik treści bloga — plan wdrożenia

> **Dla agentów wykonawczych:** WYMAGANY SUB-SKILL: użyj `subagent-driven-development` (zalecane)
> albo `executing-plans` do wykonania tego planu zadanie po zadaniu.
> Kroki mają składnię checkboxów (`- [ ]`) do odhaczania.

**Cel:** Automat przestaje wymyślać tematy i zaczyna pisać pod frazy z realnym popytem,
w jakości, której nie trzeba się wstydzić, z człowiekiem w pętli przed publikacją.

**Architektura:** Temat pochodzi z pliku `docs/seo/plan-tresci.md`, zasady pisania z
`docs/seo/editorial-standard.md`. Wygenerowany szkic przechodzi trzy bramki techniczne w skrypcie,
a wynik wędruje w ładunku do istniejącego punktu publikacji, który traktuje nieprzejście bramki
jak tryb redakcyjny. Cotygodniowy przegląd nowości znika z bloga i idzie mailem do właściciela.

**Stos:** GitHub Actions, Node 24 bez zależności zewnętrznych w skryptach, Next.js App Router,
Supabase, testy `node --test`.

**Źródła:** spec `docs/superpowers/specs/2026-09-10-widocznosc-w-wyszukiwarce-design.md` (Faza 2),
plan treści `docs/seo/plan-tresci.md`, mapa fraz `docs/seo/keyword-map.md`.

**To trzeci z planów projektu widoczności.** Pierwszy (atrybucja i host) jest scalony.
Drugi (strony usługowe i strona o osobie) czeka na wykonanie i **musi wejść przed tym planem**,
bo bramka jakości wymaga istniejących stron usługowych do linkowania.
Poza zakresem: automat propozycji postów do sieci społecznościowych, to plan czwarty.

---

## Stan wyjściowy, zweryfikowany 11 września 2026

| Fakt | Źródło |
|---|---|
| `blog-auto.mjs` wybiera temat, prosząc Gemini o unikanie tematów z listy istniejących | `.github/scripts/blog-auto.mjs`, krok 1 i 2 |
| Publikacja: POST na `/api/blog/publish` z sekretem w nagłówku | tamże, `publishPost` |
| Ładunek zawiera `ai_model: 'gemini-2.5-flash'` wpisane na sztywno | tamże, wywołanie `publishPost` |
| Tryb publikacji czyta serwer przez `getBlogPublishMode()` | `app/api/blog/publish/route.ts` |
| `resolvePublishState` pomija tryb, gdy artykuł ma `reviewed_at` | `lib/ai-disclosure.ts:57` |
| `blog-brief.mjs` czyta 12 kanałów RSS i publikuje przegląd na blogu | `.github/scripts/blog-brief.mjs` |
| Generatory używają `gemini-2.5-flash` i `gemini-2.5-flash-image` | 8 wystąpień w repo |
| `gemini-3.8-flash` i `gemini-3.1-flash-image` odpowiadają na kluczu projektu | sprawdzone wywołaniem, HTTP 200 |
| `lib/ai-registry.ts` wymienia nazwy modeli w rejestrze AI Act | odczyt pliku |
| Sekrety w GitHubie: `GOOGLE_API_KEY`, `IMGBB_API_KEY`, `WEBHOOK_SECRET`, `SITE_URL`, `BRIEF_RECIPIENT_EMAIL`, `BING_WEBMASTER_API_KEY` | `gh secret list` |
| **Brak sekretu `RESEND_API_KEY` w GitHubie** | tamże |
| `lib/email/resend.ts` to moduł TypeScript Next.js, skrypt Actions go nie zaimportuje | odczyt pliku |
| Nadawca maili: `powiadomienia@zautomatyzujemy.pl` | `lib/email/resend.ts:12` |

Numeracja migracji: `016`, `017` i `018` zajmuje plan drugi, więc ten plan używa `019`.

---

## Struktura plików

| Plik | Odpowiedzialność |
|---|---|
| `supabase/migrations/019_blog_seo.sql` | Dwie kolumny w `posts`: fraza docelowa i wyłączenie z indeksu. |
| `docs/seo/editorial-standard.md` | Zasady pisania, czytane przez generator i przez człowieka. |
| `scripts/seo/quality-gate.mjs` | Trzy bramki techniczne, czysta logika, bez sieci. |
| `scripts/seo/quality-gate.test.mjs` | Testy bramek. |
| `.github/scripts/blog-auto.mjs` | Temat z planu treści, standard w prompcie, bramka przed wysyłką. |
| `.github/scripts/blog-brief.mjs` | Przegląd RSS wysyłany mailem zamiast publikowany. |
| `.github/workflows/blog-brief.yml` | Nowe sekrety, harmonogram miesięczny. |
| `app/api/blog/publish/route.ts` | Pole `quality_gate_passed` w schemacie i gałąź w logice. |
| `app/blog/[slug]/page.tsx` | `robots` w metadanych, warunkowane kolumną `noindex`. |
| `app/sitemap.ts` | Filtr `noindex = false`. |
| `lib/ai-registry.ts` | Aktualizacja nazw modeli. |

---

## Zadanie 1: Podniesienie modelu

Zadanie osobne i pierwsze, bo jest niezależne od reszty i daje natychmiastową poprawę jakości
bez zmiany logiki.

**Pliki:**
- Modyfikuj: `.github/scripts/blog-auto.mjs`, `.github/scripts/blog-brief.mjs`, `lib/ai-registry.ts`

- [ ] **Krok 1: Podmień modele w obu skryptach**

Tekst: `gemini-2.5-flash` na `gemini-3.8-flash`.
Obrazy: `gemini-2.5-flash-image` na `gemini-3.1-flash-image`.

Sprawdź wszystkie wystąpienia:

```bash
grep -rn "gemini-2.5-flash" .github/scripts/
```

Oczekiwane po zmianie: brak wyników w tym katalogu.

**Nie ruszaj** `app/api/chat/route.ts`, `lib/actions/chat.actions.ts` ani
`lib/actions/admin.actions.ts`. Czat Klary to gorący ruch produkcyjny z własnym promptem
systemowym i zmienia się osobno, po oddzielnym teście.

- [ ] **Krok 2: Popraw nazwę modelu w ładunku publikacji**

W `blog-auto.mjs`, w wywołaniu `publishPost`, pole `ai_model` ma wartość wpisaną na sztywno.
Wprowadź stałą na górze pliku i użyj jej w obu miejscach, żeby nie rozjechały się nigdy więcej:

```js
const MODEL_TEKSTU = 'gemini-3.8-flash'
const MODEL_OBRAZU = 'gemini-3.1-flash-image'
```

To samo w `blog-brief.mjs`.

- [ ] **Krok 3: Zaktualizuj rejestr AI Act**

W `lib/ai-registry.ts` wpisy `blog-auto` i `blog-brief` podają nazwy modeli w polu `model`.
Zmień je na nowe. **To nie jest kosmetyka.** Rejestr jest dokumentacją zgodności z rozporządzeniem,
a rozjazd między nim a rzeczywistością to dokładnie ten rodzaj błędu, który wychodzi przy kontroli.

- [ ] **Krok 4: Sprawdź**

```bash
npm run type-check && npm test
```

- [ ] **Krok 5: Uruchom generator ręcznie i obejrzyj wynik**

W zakładce Actions na GitHubie uruchom `Blog Auto — Artykuł AI` przyciskiem `Run workflow`.
Tryb publikacji jest ustawiony na redakcyjny, więc artykuł trafi do szkiców, nie na stronę.
Przeczytaj wynik w panelu i oceń, czy nowy model pisze lepiej. Jeśli nie, wróć do poprzedniego
i zgłoś to — zmiana ma sens tylko wtedy, gdy widać różnicę.

- [ ] **Krok 6: Commit**

```bash
git add .github/scripts lib/ai-registry.ts
git commit -m "feat(blog): podniesienie modelu na gemini-3.8-flash"
```

---

## Zadanie 2: Migracja bazy

**Pliki:**
- Utwórz: `supabase/migrations/019_blog_seo.sql`

- [ ] **Krok 1: Napisz migrację**

```sql
-- 019_blog_seo.sql
-- Dwie kolumny, obie z konsumentem od pierwszego dnia.
-- target_keyword: fraza, pod którą artykuł powstał, potrzebna przy przeglądzie i przy raportach.
-- noindex: wyłączenie archiwalnych przeglądów z indeksu bez usuwania ich ze strony.

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS target_keyword TEXT,
  ADD COLUMN IF NOT EXISTS noindex        BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN posts.noindex IS
  'TRUE wyłącza artykuł z mapy strony i dodaje robots: noindex w metadanych.';
```

Świadomie nie dokładamy kolumn `meta_description`, `pillar_slug`, `content_type`
ani `search_intent`. Żadna nie ma konsumenta w tym planie, a kolumna bez konsumenta
to dług, nie funkcja.

- [ ] **Krok 2: Zadanie właściciela — uruchomić migrację**

Panel Supabase, edytor SQL. Weryfikacja:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name IN ('target_keyword', 'noindex');
```

Oczekiwane: dwa wiersze, `noindex` z `is_nullable = NO`.

- [ ] **Krok 3: Commit**

```bash
git add supabase/migrations/019_blog_seo.sql
git commit -m "feat(blog): kolumny frazy docelowej i wylaczenia z indeksu"
```

---

## Zadanie 3: Standard pisarski

**Pliki:**
- Utwórz: `docs/seo/editorial-standard.md`

Ten plik czyta generator i czyta go człowiek przy zatwierdzaniu. Ma być na tyle konkretny,
żeby dało się nim prowadzić model bez nadzoru, i na tyle krótki, żeby zmieścił się w prompcie.

- [ ] **Krok 1: Napisz plik**

Zawartość, sekcja po sekcji:

**Struktura artykułu.** Pierwszy akapit odpowiada na pytanie zawarte we frazie docelowej
w dwóch zdaniach, przed jakimkolwiek wstępem. Potem od trzech do pięciu sekcji merytorycznych
z nagłówkami drugiego poziomu. Na końcu sekcja pytań i odpowiedzi, od trzech do pięciu pozycji.
Domknięcie wiąże temat z konkretną usługą, bez ogólnego zaproszenia do kontaktu.

**Fraza docelowa.** Pada w tytule, w nagłówku pierwszego poziomu, w adresie i w pierwszym akapicie.
Nigdzie więcej w formie dosłownej. Odmiana i synonimy są w porządku, powtarzanie nie.

**Czarna lista zwrotów.** „w dzisiejszym dynamicznym świecie", „w erze cyfrowej", „rewolucja",
„game changer", „nie od dziś wiadomo", „w dobie sztucznej inteligencji", „przełomowy",
„kluczowy element sukcesu", „warto pamiętać, że", „podsumowując". Wystąpienie któregokolwiek
oznacza przepisanie akapitu.

**Konkret zamiast ogólnika.** Nazwy narzędzi, liczby kroków, czasy wykonania, rzędy kosztów.
Zdanie, które po usunięciu nazwy branży pasowałoby do dowolnej innej, jest zdaniem do wyrzucenia.

**Źródła.** Minimum dwa odnośniki do źródeł zewnętrznych. Statystyki bez źródła nie wchodzą.

**Linkowanie.** Minimum dwa odnośniki do stron usługowych i jeden do innego artykułu,
wszystkie z opisowym tekstem odnośnika, nigdy „tutaj" ani „czytaj więcej".

**Język.** Zdania krótkie. Strona czynna. Druga osoba liczby pojedynczej.
Bez wykrzykników. Bez pytań retorycznych w roli nagłówków.

**Wstawka autorska.** Jeden akapit z własnym doświadczeniem, dopisywany ręcznie przy
zatwierdzaniu. Generator zostawia w tym miejscu znacznik `<!-- WSTAWKA -->`, żeby nie dało się
o niej zapomnieć. Artykuł ze znacznikiem nie może zostać opublikowany.

- [ ] **Krok 2: Dopisz odsyłacz w `CLAUDE.md`**

W sekcji o koordynacji, jedno zdanie: przed pisaniem lub przeglądem treści na blog przeczytaj
`docs/seo/editorial-standard.md`. Dzięki temu każda sesja wczyta zasady bez pytania.

- [ ] **Krok 3: Commit**

```bash
git add docs/seo/editorial-standard.md CLAUDE.md
git commit -m "docs(blog): standard pisarski dla generatora i redaktora"
```

---

## Zadanie 4: Bramka jakości

**Pliki:**
- Utwórz: `scripts/seo/quality-gate.mjs`
- Test: `scripts/seo/quality-gate.test.mjs`

Bramka sprawdza wyłącznie rzeczy sprawdzalne maszynowo. Prawdziwość i użyteczność ocenia człowiek.
Moduł nie wykonuje zapytań sieciowych, żeby dało się go testować bez atrap.

- [ ] **Krok 1: Napisz testy, które nie przechodzą**

Utwórz `scripts/seo/quality-gate.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { sprawdzArtykul } from './quality-gate.mjs'

const POPRAWNY = {
  title: 'Jak stworzyć agenta AI dla firmy',
  slug: 'jak-stworzyc-agenta-ai',
  targetKeyword: 'jak stworzyć agenta ai',
  content: [
    '# Jak stworzyć agenta AI',
    '',
    'Jak stworzyć agenta ai? Potrzebujesz modelu, narzędzia do przepływów i jednego procesu.',
    'Poniżej pokazuję, jak zrobić to w n8n w cztery kroki.',
    '',
    '## Krok pierwszy',
    'Zobacz [automatyzację procesów](/uslugi/automatyzacja-procesow-biznesowych).',
    'Więcej w [szkoleniach z AI](/uslugi/szkolenia-z-ai-dla-zespolow).',
    'Opisywałem to w [artykule o n8n](/blog/n8n-jak-zaczac).',
    'Dokumentacja: [n8n docs](https://docs.n8n.io) oraz [OpenAI](https://platform.openai.com).',
  ].join('\n'),
}

const ISTNIEJACE = [{ slug: 'n8n-jak-zaczac', title: 'n8n od czego zacząć' }]
const USLUGI = ['automatyzacja-procesow-biznesowych', 'szkolenia-z-ai-dla-zespolow']

test('poprawny artykuł przechodzi wszystkie bramki', () => {
  const wynik = sprawdzArtykul(POPRAWNY, { istniejace: ISTNIEJACE, uslugi: USLUGI })
  assert.equal(wynik.przechodzi, true)
  assert.deepEqual(wynik.braki, [])
})

test('powtórzony slug jest odrzucany', () => {
  const wynik = sprawdzArtykul(
    { ...POPRAWNY, slug: 'n8n-jak-zaczac' },
    { istniejace: ISTNIEJACE, uslugi: USLUGI }
  )
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('slug')))
})

test('brak frazy docelowej w tytule jest odrzucany', () => {
  const wynik = sprawdzArtykul(
    { ...POPRAWNY, title: 'Coś zupełnie innego' },
    { istniejace: ISTNIEJACE, uslugi: USLUGI }
  )
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('tytule')))
})

test('mniej niż dwa źródła zewnętrzne są odrzucane', () => {
  const bezZrodel = POPRAWNY.content.replace(
    'Dokumentacja: [n8n docs](https://docs.n8n.io) oraz [OpenAI](https://platform.openai.com).',
    ''
  )
  const wynik = sprawdzArtykul(
    { ...POPRAWNY, content: bezZrodel },
    { istniejace: ISTNIEJACE, uslugi: USLUGI }
  )
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('źródł')))
})

test('link do nieistniejącej usługi jest odrzucany', () => {
  const zlyLink = POPRAWNY.content.replace(
    '/uslugi/szkolenia-z-ai-dla-zespolow',
    '/uslugi/usluga-ktora-nie-istnieje'
  )
  const wynik = sprawdzArtykul(
    { ...POPRAWNY, content: zlyLink },
    { istniejace: ISTNIEJACE, uslugi: USLUGI }
  )
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('nie istnieje')))
})

test('brak linku do innego artykułu jest odrzucany', () => {
  const bezLinku = POPRAWNY.content.replace(
    'Opisywałem to w [artykule o n8n](/blog/n8n-jak-zaczac).',
    ''
  )
  const wynik = sprawdzArtykul(
    { ...POPRAWNY, content: bezLinku },
    { istniejace: ISTNIEJACE, uslugi: USLUGI }
  )
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('artykuł')))
})

test('zwrot z czarnej listy jest odrzucany', () => {
  const zWytrychem = POPRAWNY.content.replace(
    'Poniżej pokazuję',
    'W dzisiejszym dynamicznym świecie pokazuję'
  )
  const wynik = sprawdzArtykul(
    { ...POPRAWNY, content: zWytrychem },
    { istniejace: ISTNIEJACE, uslugi: USLUGI }
  )
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('czarnej listy')))
})

test('pozostawiony znacznik wstawki jest odrzucany', () => {
  const wynik = sprawdzArtykul(
    { ...POPRAWNY, content: POPRAWNY.content + '\n<!-- WSTAWKA -->' },
    { istniejace: ISTNIEJACE, uslugi: USLUGI }
  )
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('wstawk')))
})
```

- [ ] **Krok 2: Uruchom testy i potwierdź, że nie przechodzą**

```bash
node --test scripts/seo/quality-gate.test.mjs
```

Oczekiwane: błąd importu, moduł nie istnieje.

- [ ] **Krok 3: Napisz moduł**

Utwórz `scripts/seo/quality-gate.mjs`:

```js
/**
 * Trzy bramki techniczne dla szkicu artykułu.
 *
 * Bramka sprawdza wyłącznie to, co da się sprawdzić maszynowo: duplikaty, obecność
 * i poprawność odnośników, obecność frazy w wymaganych miejscach. Prawdziwość twierdzeń
 * i użyteczność tekstu ocenia człowiek przy zatwierdzaniu — i to jest świadomy podział ról,
 * a nie luka do załatania kolejnym sprawdzeniem.
 */

const CZARNA_LISTA = [
  'w dzisiejszym dynamicznym świecie',
  'w erze cyfrowej',
  'w dobie sztucznej inteligencji',
  'nie od dziś wiadomo',
  'game changer',
  'kluczowy element sukcesu',
  'warto pamiętać, że',
  'przełomow',
]

const ZNACZNIK_WSTAWKI = '<!-- WSTAWKA -->'
const MIN_ZRODEL = 2
const MIN_LINKOW_USLUGOWYCH = 2

function linki(tresc) {
  return [...tresc.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(m => m[1])
}

function normalizuj(tekst) {
  return tekst.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function sprawdzArtykul(artykul, kontekst) {
  const braki = []
  const { title, slug, targetKeyword, content } = artykul
  const { istniejace = [], uslugi = [] } = kontekst

  const trescNorm = normalizuj(content)
  const frazaNorm = normalizuj(targetKeyword ?? '')
  const wszystkieLinki = linki(content)

  // Bramka 1: duplikaty
  if (istniejace.some(a => a.slug === slug)) {
    braki.push(`Powtórzony slug: ${slug}`)
  }
  if (istniejace.some(a => normalizuj(a.title) === normalizuj(title))) {
    braki.push(`Powtórzony tytuł: ${title}`)
  }
  if (frazaNorm !== '' && !normalizuj(title).includes(frazaNorm)) {
    braki.push(`Brak frazy docelowej w tytule: ${targetKeyword}`)
  }

  // Bramka 2: źródła
  const zewnetrzne = wszystkieLinki.filter(l => l.startsWith('http'))
  if (zewnetrzne.length < MIN_ZRODEL) {
    braki.push(`Za mało źródeł zewnętrznych: ${zewnetrzne.length}, wymagane ${MIN_ZRODEL}`)
  }

  // Bramka 3: linkowanie wewnętrzne
  const uslugowe = wszystkieLinki.filter(l => l.startsWith('/uslugi/'))
  const artykulowe = wszystkieLinki.filter(l => l.startsWith('/blog/'))

  if (uslugowe.length < MIN_LINKOW_USLUGOWYCH) {
    braki.push(
      `Za mało odnośników do usług: ${uslugowe.length}, wymagane ${MIN_LINKOW_USLUGOWYCH}`
    )
  }
  if (artykulowe.length < 1) {
    braki.push('Brak odnośnika do innego artykułu')
  }

  for (const link of uslugowe) {
    const slugUslugi = link.replace('/uslugi/', '').split(/[#?]/)[0]
    if (!uslugi.includes(slugUslugi)) {
      braki.push(`Usługa nie istnieje: ${link}`)
    }
  }
  for (const link of artykulowe) {
    const slugArtykulu = link.replace('/blog/', '').split(/[#?]/)[0]
    if (!istniejace.some(a => a.slug === slugArtykulu)) {
      braki.push(`Artykuł nie istnieje: ${link}`)
    }
  }

  // Poza bramkami: higiena tekstu
  for (const zwrot of CZARNA_LISTA) {
    if (trescNorm.includes(zwrot)) {
      braki.push(`Zwrot z czarnej listy: „${zwrot}"`)
    }
  }
  if (content.includes(ZNACZNIK_WSTAWKI)) {
    braki.push('Pozostawiony znacznik wstawki autorskiej')
  }

  return { przechodzi: braki.length === 0, braki }
}
```

- [ ] **Krok 4: Uruchom testy**

```bash
node --test scripts/seo/quality-gate.test.mjs
```

Oczekiwane: osiem testów zielonych.

- [ ] **Krok 5: Uruchom cały zestaw**

```bash
npm test
```

Oczekiwane: wszystkie testy przechodzą. Wzorzec `scripts/**/*.test.mjs` obejmuje nowy podkatalog.

- [ ] **Krok 6: Commit**

```bash
git add scripts/seo/quality-gate.mjs scripts/seo/quality-gate.test.mjs
git commit -m "feat(blog): bramka jakosci szkicu artykulu"
```

---

## Zadanie 5: Egzekwowanie bramki po stronie serwera

**Pliki:**
- Modyfikuj: `app/api/blog/publish/route.ts`

Bez tego zadania bramka byłaby ozdobą: skrypt mógłby ją zignorować i opublikować mimo braków.

- [ ] **Krok 1: Dodaj pole do schematu**

W `BlogPublishSchema` dopisz:

```typescript
  quality_gate_passed: z.boolean().optional(),
  target_keyword: z.string().max(200).nullish(),
```

- [ ] **Krok 2: Potraktuj nieprzejście bramki jak tryb redakcyjny**

W handlerze, w miejscu gdzie odczytywany jest tryb publikacji, zamień samo wywołanie
`getBlogPublishMode()` na wynik uwzględniający bramkę:

```typescript
  const tryb = await getBlogPublishMode()
  // Szkic, który nie przeszedł bramki, nie publikuje się nawet w trybie automatycznym.
  // Wynik bramki nie jest zatwierdzeniem merytorycznym — to tylko stwierdzenie,
  // że tekst ma źródła i działające odnośniki.
  const trybEfektywny = payload.quality_gate_passed === false ? 'review' : tryb
```

i przekaż `trybEfektywny` do `resolvePublishState`.

Istniejąca gałąź `if (existing?.reviewed_at) return existing` zostaje bez zmian.
Artykuł raz zatwierdzony przez człowieka nie wraca do szkiców.

- [ ] **Krok 3: Zapisz frazę docelową**

W obiekcie zapisywanym do bazy dodaj `target_keyword: payload.target_keyword ?? null`.

- [ ] **Krok 4: Sprawdź**

```bash
npm run type-check && npm run build
```

- [ ] **Krok 5: Commit**

```bash
git add app/api/blog/publish/route.ts
git commit -m "feat(blog): nieprzejscie bramki wymusza szkic"
```

---

## Zadanie 6: Generator bierze temat z planu treści

**Pliki:**
- Modyfikuj: `.github/scripts/blog-auto.mjs`

- [ ] **Krok 1: Wczytaj plan treści i standard pisarski**

Na początku skryptu dodaj odczyt obu plików z repozytorium:

```js
import { readFileSync } from 'node:fs'

const PLAN_TRESCI = readFileSync('docs/seo/plan-tresci.md', 'utf8')
const STANDARD = readFileSync('docs/seo/editorial-standard.md', 'utf8')
```

Workflow wykonuje `actions/checkout`, więc oba pliki są na dysku.

- [ ] **Krok 2: Rozszerz źródło listy artykułów**

`app/api/blog/existing-topics/route.ts` zwraca dziś `title`, `slug` i `tags`.
Dołóż `target_keyword` do zapytania i do mapowania:

```typescript
    .select('title, tags, slug, target_keyword')
```

```typescript
  const topics = (data ?? []).map((post) => ({
    title: post.title as string,
    slug: post.slug as string,
    targetKeyword: (post.target_keyword as string | null) ?? null,
```

Zostaw resztę mapowania bez zmian.

- [ ] **Krok 3: Wybierz temat bez przypisanego artykułu**

W `blog-auto.mjs` dodaj parser tabel z planu treści i wybór pierwszego wolnego tematu:

```js
/**
 * Tematy siedzą w tabelach Markdown w docs/seo/plan-tresci.md.
 * Kolumny: numer, temat, fraza główna, wolumen, intencja.
 * Parsujemy plik, a nie osobną bazę, bo dwanaście pozycji na kwartał nie potrzebuje tabeli.
 */
function tematyZPlanu(markdown) {
  const tematy = []

  for (const linia of markdown.split('\n')) {
    if (!linia.startsWith('|')) continue

    const kolumny = linia.split('|').map(k => k.trim())
    // kolumny[0] jest puste, bo linia zaczyna się od separatora
    const [, numer, temat, fraza, wolumen, intencja] = kolumny
    if (!/^\d+$/.test(numer ?? '')) continue

    tematy.push({
      numer: Number(numer),
      temat,
      fraza,
      wolumen: Number(wolumen) || 0,
      intencja,
    })
  }

  return tematy.sort((a, b) => a.numer - b.numer)
}

function pierwszyWolnyTemat(tematy, istniejace) {
  const uzyte = new Set(
    istniejace.map(a => (a.targetKeyword ?? '').toLowerCase().trim()).filter(Boolean)
  )
  return tematy.find(t => !uzyte.has(t.fraza.toLowerCase().trim())) ?? null
}
```

W głównej części skryptu:

```js
const temat = pierwszyWolnyTemat(tematyZPlanu(PLAN_TRESCI), existingTopics)

if (temat === null) {
  console.log('📋 Wszystkie tematy z planu treści są wykorzystane. Dopisz kolejne i uruchom ponownie.')
  process.exit(0)
}

console.log(`📌 Temat ${temat.numer}: ${temat.temat} (fraza: ${temat.fraza}, ${temat.wolumen}/mies.)`)
```

**Skrypt nie wymyśla tematu sam.** Wyczerpanie listy to sygnał dla właściciela,
że pora dopisać kolejne, a nie powód do improwizacji.

Gdy wszystkie dwanaście tematów jest wykorzystanych, skrypt kończy się komunikatem
i kodem wyjścia zero. **Nie wymyśla tematu sam.** Wyczerpanie listy to sygnał dla właściciela,
że pora dopisać kolejne, a nie powód do improwizacji.

- [ ] **Krok 4: Przebuduj prompt**

Prompt dostaje: frazę docelową, intencję, stronę usługową do linkowania, treść standardu
pisarskiego oraz listę slugów istniejących artykułów i usług do linkowania.
Usuń z promptu dotychczasową instrukcję „wybierz unikalny temat", bo temat jest już wybrany.

W prompcie zażądaj wprost, żeby model wstawił `<!-- WSTAWKA -->` w miejscu na akapit autorski,
w drugiej połowie tekstu, po sekcji merytorycznej.

- [ ] **Krok 5: Uruchom bramkę przed wysyłką**

Po wygenerowaniu artykułu, przed `publishPost`:

```js
import { sprawdzArtykul } from '../../scripts/seo/quality-gate.mjs'

const wynikBramki = sprawdzArtykul(
  { title: article.title, slug: article.slug, targetKeyword: temat.fraza, content: article.content },
  { istniejace: existingTopics, uslugi: slugiUslug }
)

if (!wynikBramki.przechodzi) {
  console.log('⚠ Bramka jakości nie przeszła:')
  wynikBramki.braki.forEach(b => console.log('   -', b))
}
```

Wynik wędruje w ładunku: `quality_gate_passed: wynikBramki.przechodzi`
oraz `target_keyword: temat.fraza`.

Skrypt **nie przerywa się** przy nieprzejściu bramki. Artykuł ma trafić do szkiców z listą braków,
bo szkic z usterką jest wart więcej niż brak szkicu.

- [ ] **Krok 6: Dołóż braki do powiadomienia mailowego**

`sendDraftAwaitingReview` w `lib/email/resend.ts` wysyła powiadomienie o szkicu.
Rozszerz je o opcjonalną listę braków z bramki, przekazywaną z route'u.
Redaktor ma wiedzieć, co poprawić, zanim otworzy panel.

- [ ] **Krok 7: Uruchom ręcznie i sprawdź**

Uruchom workflow przyciskiem `Run workflow`. Sprawdź w logu, czy temat pochodzi z planu treści,
a w panelu, czy szkic ma wypełnioną frazę docelową i znacznik wstawki.

- [ ] **Krok 8: Commit**

```bash
git add .github/scripts/blog-auto.mjs app/api/blog/existing-topics/route.ts lib/email/resend.ts
git commit -m "feat(blog): temat z planu tresci i bramka przed wysylka"
```

---

## Zadanie 7: Przegląd nowości znika z bloga

**Pliki:**
- Modyfikuj: `.github/scripts/blog-brief.mjs`, `.github/workflows/blog-brief.yml`

Zbieranie materiałów z dwunastu kanałów RSS zostaje bez zmian, bo to działający automat
researchowy. Zmienia się wyłącznie odbiorca: zamiast bloga, prywatna skrzynka właściciela.

- [ ] **Krok 1: Zadanie właściciela — dodać sekret**

Skrypt będzie wołał Resend bezpośrednio, bo `lib/email/resend.ts` to moduł TypeScript Next.js,
którego skrypt Actions nie zaimportuje.

W ustawieniach repozytorium, Secrets and variables, Actions, dodaj `RESEND_API_KEY`
z tą samą wartością, która jest w Vercelu. Sekret `BRIEF_RECIPIENT_EMAIL` już istnieje.

- [ ] **Krok 2: Zamień publikację na wysyłkę maila**

Usuń ze skryptu generowanie okładki, upload do ImgBB i wywołanie `publishPost`.
W ich miejsce wstaw wysyłkę przez API Resend:

```js
async function wyslijPrzeglad(temat, trescHtml) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'powiadomienia@zautomatyzujemy.pl',
      to: process.env.BRIEF_RECIPIENT_EMAIL,
      subject: temat,
      html: trescHtml,
    }),
    signal: AbortSignal.timeout(20000),
  })

  if (!res.ok) throw new Error(`Resend: HTTP ${res.status} ${await res.text()}`)
}
```

Adres nadawcy jest ten sam, którego używa reszta aplikacji, więc domena jest już zweryfikowana.

- [ ] **Krok 3: Zmień format treści**

Prompt do modelu zmienia się z artykułu na przegląd: od sześciu do dziesięciu pozycji,
każda z tytułem, adresem źródła, datą publikacji, dwuzdaniowym streszczeniem i jednym zdaniem
o tym, której usługi albo problemu klienta dotyczy.

Zażądaj wprost rozróżnienia: co jest streszczeniem pobranego materiału, a co propozycją modelu.
To nie jest ozdobnik. Przegląd ma służyć do podejmowania decyzji, a decyzja podjęta na podstawie
zmyślonego faktu jest gorsza niż brak przeglądu.

- [ ] **Krok 4: Zmień harmonogram na miesięczny**

W `blog-brief.yml` zmień `cron` z cotygodniowego na pierwszy dzień miesiąca:

```yaml
    - cron: '0 7 1 * *'
```

Dodaj do sekcji `env` sekrety `RESEND_API_KEY` i `BRIEF_RECIPIENT_EMAIL`.
Usuń `IMGBB_API_KEY` i `WEBHOOK_SECRET`, bo skrypt przestaje ich używać.

- [ ] **Krok 5: Zaktualizuj rejestr AI Act**

Wpis `blog-brief` w `lib/ai-registry.ts` opisuje dziś cel jako „cotygodniowy przegląd nowości AI
wraz z okładką". Zmień na miesięczny przegląd wysyłany mailem, bez generowania obrazu.

- [ ] **Krok 6: Uruchom ręcznie i sprawdź skrzynkę**

Oczekiwane: mail dociera, pozycje mają adresy źródeł, na blogu nic nie przybywa.

- [ ] **Krok 7: Commit**

```bash
git add .github/scripts/blog-brief.mjs .github/workflows/blog-brief.yml lib/ai-registry.ts
git commit -m "feat(blog): przeglad nowosci mailem zamiast na blogu"
```

---

## Zadanie 8: Mechanizm wyłączania z indeksu

**Pliki:**
- Modyfikuj: `app/blog/[slug]/page.tsx`, `app/sitemap.ts`

W repozytorium nie ma dziś słowa `noindex`, a `generateMetadata` nie zwraca pola `robots`.
Sama kolumna z zadania drugiego niczego nie wyłączy.

- [ ] **Krok 1: Dodaj `robots` do metadanych artykułu**

W `generateMetadata` dołóż `noindex` do listy pobieranych kolumn, a do zwracanego obiektu:

```typescript
    ...(data.noindex === true && { robots: { index: false, follow: true } }),
```

`follow: true` jest celowe. Strona wypada z indeksu, ale jej odnośniki nadal przekazują sygnał
do stron, na które prowadzi.

- [ ] **Krok 2: Odfiltruj wyłączone z mapy strony**

W `app/sitemap.ts`, w zapytaniu o posty, dodaj `.eq('noindex', false)`.

Kolejność ma znaczenie: usunięcie z mapy strony samo w sobie niczego nie deindeksuje.
Mapa to podpowiedź, a `robots` to polecenie.

- [ ] **Krok 3: Sprawdź**

```bash
npm run type-check && npm run build
```

Ustaw ręcznie `noindex = true` na jednym artykule w bazie, uruchom `npm run dev`
i sprawdź źródło strony tego artykułu:

```bash
curl -s http://localhost:3000/blog/<slug> | grep -i "robots"
```

Oczekiwane: znacznik `noindex`. Sprawdź też, że artykuł zniknął z `/sitemap.xml`.
Przywróć wartość na `false` po teście.

- [ ] **Krok 4: Commit**

```bash
git add "app/blog/[slug]/page.tsx" app/sitemap.ts
git commit -m "feat(blog): wylaczanie artykulu z indeksu"
```

---

## Zadanie 9: Przegląd trzydziestu istniejących artykułów

**Pliki:** dane w bazie, bez zmian w kodzie.

Zadanie wspólne: agent przygotowuje zestawienie, decyzje podejmuje właściciel.

- [ ] **Krok 1: Przygotuj zestawienie**

Dla każdego z trzydziestu artykułów zbierz: slug, tytuł, datę publikacji, liczbę wyświetleń
z eksportu Search Console w `data/seo/gsc-strony-2026-09-11.csv` oraz informację,
czy tytuł pasuje do którejkolwiek frazy z `data/seo/wolumeny.csv` z wolumenem co najmniej 50.
Zapisz jako `docs/seo/przeglad-artykulow.md`.

- [ ] **Krok 2: Zaproponuj decyzję dla każdego**

Cztery możliwe: zostawić bez zmian, odświeżyć pod frazę, połączyć z innym, wyłączyć z indeksu.
Domyślna propozycja dla osiemnastu przeglądów `nowosci-ai-*` to wyłączenie z indeksu,
bo powtarzają newsy sprzed miesięcy i nie mają przypisanej frazy.
**To propozycja, nie reguła.** Brak wyświetleń nie dowodzi braku wartości,
a decyzję podejmuje właściciel po przejrzeniu listy.

- [ ] **Krok 3: Zastosuj decyzje**

Po akceptacji ustaw `noindex` i `target_keyword` w bazie zgodnie z listą.

- [ ] **Krok 4: Commit zestawienia**

```bash
git add docs/seo/przeglad-artykulow.md
git commit -m "docs(blog): przeglad trzydziestu istniejacych artykulow"
```

---

## Zadanie 10: Doszycie odnośników do stron usługowych

**Pliki:** treść artykułów w bazie.

Artykuły zostawione w indeksie to jedyne strony, które dziś mogą dostać wyświetlenie.
Żaden z nich nie prowadzi do oferty.

- [ ] **Krok 1: Dla każdego artykułu zostawionego w indeksie dodaj dwa odnośniki**

Jeden do strony usługowej najbliższej tematowi, jeden do innego artykułu.
Tekst odnośnika ma opisywać cel, nigdy „tutaj".
Odnośnik wstaw w miejscu, gdzie jest merytorycznie uzasadniony, nie na końcu tekstu.

- [ ] **Krok 2: Sprawdź, że wszystkie adresy istnieją**

```bash
npm run dev
```

Następnie dla każdego zmodyfikowanego artykułu otwórz stronę i kliknij dodane odnośniki.
Alternatywnie sprawdź skryptem, czy każdy adres `/uslugi/...` z treści artykułów
odpowiada slugowi w tabeli `services`.

- [ ] **Krok 3: Odśwież bazę wiedzy chatbota**

Uruchom ręcznie workflow `kb-refresh.yml`, bo treść artykułów zasila embeddingi.

---

## Domknięcie

- [ ] **Krok 1: Pełna weryfikacja**

```bash
npm ci && npm test && npm run type-check && npm run lint && npm run build
```

- [ ] **Krok 2: Trzy kolejne artykuły przez bramkę**

Kryterium ukończenia planu: trzy kolejne uruchomienia generatora kończą się szkicem,
który przechodzi bramkę bez ręcznych poprawek, każdy z frazą docelową z planu treści
i ze znacznikiem wstawki w treści.

- [ ] **Krok 3: Pull request**

```bash
git push -u origin feat/silnik-tresci
gh pr create --base main --head feat/silnik-tresci --title "Silnik tresci bloga" --body "Temat z planu tresci zamiast wymyslania, standard pisarski, trzy bramki techniczne, przeglad nowosci mailem zamiast na blogu, podniesienie modelu na gemini-3.8-flash. Trzeci z planow projektu widocznosci."
```

- [ ] **Krok 4: Ustaw tryb publikacji**

Tryb redakcyjny jest domyślny i ma nim pozostać. Tryb automatyczny publikuje wyłącznie
przy przejściu bramki, ale nadal bez przeglądu człowieka, więc włączaj go świadomie
i tylko wtedy, gdy przez kilka tygodni szkice będą wychodziły dobre.
