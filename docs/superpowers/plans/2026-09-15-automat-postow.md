# Automat propozycji postów na LinkedIn i Facebooka — plan wdrożenia

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Co tydzień w poniedziałek właściciel dostaje mailem pięć propozycji postów (wersja na LinkedIn i krótsza na Facebooka) opartych na świeżych materiałach z RSS, sprawdzonych bramką, do ręcznej redakcji i publikacji.

**Architecture:** Nowy skrypt GitHub Actions `social-posts.mjs` korzysta z tego samego silnika co miesięczny przegląd nowości: pobieranie RSS, wywołanie Gemini i wysyłka przez Resend trafiają do wspólnego modułu `.github/scripts/wspolne.mjs`. Zasady tematów i formatu leżą w `docs/seo/social-topics.md`, a czysta funkcja `sprawdzPost` w `scripts/seo/bramka-postow.mjs` sprawdza każdą propozycję. Nic nie łączy się z LinkedInem ani Facebookiem, wyjściem jest mail.

**Tech Stack:** Node 24 bez zależności, GitHub Actions, Gemini API (`gemini-3.8-flash`), Resend API, `node:test`.

**Specyfikacja:** `docs/superpowers/specs/2026-09-10-widocznosc-w-wyszukiwarce-design.md`, sekcja „FAZA 2B”.

---

## Decyzje przed startem

**Duplikaty między tygodniami bez rejestru.** Automat bierze materiały z ostatnich 7 dni i uruchamia się raz w tygodniu, więc to samo źródło nie trafi do dwóch kolejnych maili. Nie ma tabeli w bazie ani pliku commitowanego z workflow. Znany sufit: ręczne uruchomienie w tym samym tygodniu powtórzy źródła. W kodzie jest to oznaczone komentarzem `ponytail:`.

**Materiał bez daty nie dostaje dzisiejszej daty.** Dziś `blog-brief.mjs` przypisuje materiałowi bez daty `Date.now()`, czyli udaje, że jest świeży. Wspólny moduł zostawia pustą datę. Przegląd pokazuje wtedy „brak daty”, a automat postów takich materiałów nie bierze, bo bramka wymaga daty.

**Posty bez adresu w treści.** LinkedIn obcina zasięg postom z linkiem, więc adres źródła jest w mailu osobno, do wklejenia w pierwszy komentarz.

**Znacznik obserwacji autora.** Tam, gdzie post potrzebuje osobistego doświadczenia, model zostawia `[TWOJA OBSERWACJA]`. To odpowiednik wstawki z bloga. Bramka go nie blokuje, bo nic nie publikuje się samo.

## Czego świadomie nie robimy

- Harmonogramu publikacji, kolejki postów w bazie, panelu — mail i kopiuj-wklej wystarczą (specyfikacja 2b.5).
- Rejestru wysłanych źródeł — okno 7 dni pokrywa duplikaty między tygodniami.
- Postów o artykułach z własnego bloga — strona nie ma kanału RSS. Dołożyć, gdy właściciel zechce promować artykuły tą drogą.

## Mapa plików

| Plik | Zmiana | Odpowiada za |
|---|---|---|
| `.github/scripts/wspolne.mjs` | nowy | kanały RSS, pobieranie materiałów, wywołanie Gemini, HTML maila, wysyłka przez Resend |
| `.github/scripts/blog-brief.mjs` | przepięty | przegląd nowości korzysta ze wspólnego modułu |
| `scripts/seo/quality-gate.mjs` | eksport | `CZARNA_LISTA` dostępna dla bramki postów |
| `scripts/seo/bramka-postow.mjs` | nowy | czysta funkcja sprawdzająca propozycję posta |
| `scripts/seo/bramka-postow.test.mjs` | nowy | testy bramki |
| `docs/seo/social-topics.md` | nowy | tematy, głos i format postów, czyta automat i człowiek |
| `.github/scripts/social-posts.mjs` | nowy | zebranie, prompt, bramka, mail |
| `.github/workflows/social-posts.yml` | nowy | cotygodniowe uruchomienie |
| `lib/ai-registry.ts` | wpis | rejestr systemów AI pod AI Act |
| `docs/seo/STAN-PROJEKTU.md` | aktualizacja | stan planu czwartego |

Pracuj na gałęzi od aktualnego `main`:

```bash
git checkout main && git pull && git checkout -b feat/automat-postow
```

---

## Zadanie 1: Wspólny moduł i przepięcie przeglądu nowości

**Files:**
- Create: `.github/scripts/wspolne.mjs`
- Modify: `.github/scripts/blog-brief.mjs` (cały plik)

- [ ] **Krok 1: Utwórz `.github/scripts/wspolne.mjs`**

```js
/**
 * Części wspólne automatów, które wysyłają maile do właściciela: przeglądu nowości
 * i propozycji postów. Zbieranie z RSS, wywołanie Gemini, HTML maila i wysyłka przez Resend.
 *
 * Resend wołamy przez API, bo lib/email/resend.ts to moduł TypeScript aplikacji Next.js,
 * którego skrypt GitHub Actions nie zaimportuje.
 */

export const FEEDS = [
  { url: 'https://openai.com/blog/rss/', source: 'OpenAI' },
  { url: 'https://www.anthropic.com/rss.xml', source: 'Anthropic' },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI' },
  { url: 'https://huggingface.co/blog/feed.xml', source: 'Hugging Face' },
  { url: 'https://blogs.microsoft.com/ai/feed/', source: 'Microsoft AI' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge' },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss', source: 'Wired' },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review' },
  { url: 'https://artificialintelligence-news.com/feed/', source: 'AI News' },
  { url: 'https://www.superhuman.ai/rss', source: 'Superhuman AI' },
]

const NADAWCA = 'powiadomienia@zautomatyzujemy.pl'

function extractField(xml, tag) {
  const open = `<${tag}`
  const si = xml.indexOf(open)
  if (si === -1) return ''
  const gt = xml.indexOf('>', si)
  if (gt === -1) return ''
  const close = `</${tag}>`
  const ci = xml.indexOf(close, gt)
  if (ci === -1) return ''
  let val = xml.slice(gt + 1, ci).trim()
  if (val.startsWith('<![CDATA[') && val.endsWith(']]>')) val = val.slice(9, -3).trim()
  return val
}

function parseJsonFromGemini(text) {
  try {
    return JSON.parse(text)
  } catch {
    const m = text.match(/\{[\s\S]+\}/)
    if (!m) throw new Error(`Gemini nie zwrócił JSON. Fragment: ${text.slice(0, 300)}`)
    return JSON.parse(m[0])
  }
}

/** Materiały z ostatnich `oknoDni` dni, od najnowszych. `pubDate` to ISO albo pusty napis. */
export async function pobierzArtykulyRss(oknoDni) {
  const odKiedy = Date.now() - oknoDni * 24 * 60 * 60 * 1000
  const articles = []

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(12000) })
      if (!res.ok) {
        console.log(`  ⚠ ${feed.source}: HTTP ${res.status}`)
        continue
      }
      const xml = await res.text()
      const items = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) ?? []

      for (const item of items.slice(0, 12)) {
        const pubDateStr =
          extractField(item, 'pubDate') ||
          extractField(item, 'published') ||
          extractField(item, 'updated')
        // Materiał bez daty zostaje, ale bez udawanej daty. NaN < liczba daje false, więc nie odpada.
        const pubDate = pubDateStr ? Date.parse(pubDateStr) : NaN
        if (pubDate < odKiedy) continue

        const title = extractField(item, 'title')
        if (!title) continue

        const rawDesc =
          extractField(item, 'description') ||
          extractField(item, 'summary') ||
          extractField(item, 'content')
        const desc = rawDesc
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 500)

        const hrefMatch = item.match(/href="([^"]+)"/)
        const link = hrefMatch ? hrefMatch[1] : extractField(item, 'link')

        articles.push({
          title,
          description: desc,
          link,
          pubDate: Number.isNaN(pubDate) ? '' : new Date(pubDate).toISOString(),
          source: feed.source,
        })
      }
      console.log(`  ✓ ${feed.source}: ${articles.filter(a => a.source === feed.source).length} artykułów`)
    } catch (e) {
      console.log(`  ⚠ ${feed.source}: ${e.message}`)
    }
  }

  if (articles.length === 0) throw new Error(`Brak artykułów z ostatnich ${oknoDni} dni — przerywam.`)
  // Daty ISO porównują się jak napisy; pusta data ląduje na końcu.
  articles.sort((a, b) => b.pubDate.localeCompare(a.pubDate))
  return articles
}

/** Wysyła prompt do Gemini z odpowiedzią w JSON i zwraca sparsowany obiekt. */
export async function zapytajGemini({ prompt, model, klucz, limitMs = 60000 }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${klucz}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(limitMs),
    }
  )

  if (!res.ok) throw new Error(`Gemini text API: HTTP ${res.status}`)
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return parseJsonFromGemini(text)
}

function escapeHtml(tekst) {
  return tekst
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Zamiana Markdown na prosty HTML. Świadomie bez biblioteki: skrypty nie mają zależności,
 * a maile czyta jedna osoba w kliencie pocztowym, gdzie i tak połowa stylów odpada.
 */
function markdownNaHtml(markdown) {
  return escapeHtml(markdown)
    .split(/\n{2,}/)
    .map(blok => {
      const linia = blok.trim()
      if (linia.startsWith('## ')) {
        return `<h2 style="margin:32px 0 12px;font-size:17px;font-weight:700;color:#111827">${linia.slice(3)}</h2>`
      }
      if (linia.startsWith('### ')) {
        return `<h3 style="margin:24px 0 8px;font-size:15px;font-weight:600;color:#111827">${linia.slice(4)}</h3>`
      }
      const zLinkami = linia
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:#c93820">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" style="color:#c93820">$2</a>')
        .replace(/\n/g, '<br>')
      return `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#374151">${zLinkami}</p>`
    })
    .join('\n')
}

export function zbudujHtml({ temat, markdown, stopka }) {
  return `<!DOCTYPE html>
<html lang="pl"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:32px 16px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
    <div style="background:#151719;padding:24px 28px">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#ffb49f">zautomatyzujemy.pl</p>
      <h1 style="margin:8px 0 0;font-size:19px;font-weight:700;color:#f5f2ed">${escapeHtml(temat)}</h1>
    </div>
    <div style="padding:28px">
      ${markdownNaHtml(markdown)}
      <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
        ${escapeHtml(stopka)}
      </p>
    </div>
  </div>
</body></html>`
}

/** Zwraca id wiadomości z Resend. */
export async function wyslijMaila({ klucz, odbiorca, temat, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${klucz}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: NADAWCA, to: odbiorca, subject: temat, html }),
    signal: AbortSignal.timeout(20000),
  })

  if (!res.ok) {
    throw new Error(`Resend: HTTP ${res.status} ${await res.text()}`)
  }

  const dane = await res.json()
  return dane.id ?? 'brak id'
}
```

- [ ] **Krok 2: Zastąp całą zawartość `.github/scripts/blog-brief.mjs`**

Prompt przeglądu zostaje bez zmian. Zmienia się tylko pochodzenie funkcji i wyświetlanie braku daty.

```js
/**
 * blog-brief.mjs
 * Miesięczny przegląd nowości AI — wysyłany mailem do właściciela, nie publikowany na blogu.
 *
 * Przepływ: RSS feeds → Gemini (tekst) → Resend → prywatna skrzynka
 *
 * Dlaczego mailem: przeglądy newsów nie mają popytu w wyszukiwarce (nikt nie wpisuje
 * „nowości AI 2026-08-24"), a zajmowały połowę bloga. Zbieranie materiałów zostaje,
 * bo jest użyteczne — zmienia się tylko odbiorca.
 */

import { pobierzArtykulyRss, zapytajGemini, zbudujHtml, wyslijMaila } from './wspolne.mjs'

const { GOOGLE_API_KEY, RESEND_API_KEY, BRIEF_RECIPIENT_EMAIL } = process.env

const MODEL_TEKSTU = 'gemini-3.8-flash'

if (!GOOGLE_API_KEY || !RESEND_API_KEY || !BRIEF_RECIPIENT_EMAIL) {
  console.error(
    '❌ Brak wymaganych zmiennych środowiskowych: GOOGLE_API_KEY, RESEND_API_KEY, BRIEF_RECIPIENT_EMAIL'
  )
  process.exit(1)
}

// Okno czasowe równe kadencji: przegląd jest miesięczny, więc bierzemy 30 dni.
// Przy tygodniowym oknie połowa miesiąca wypadałaby poza zasięg.
const OKNO_DNI = 30

function generateBrief(articles) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - OKNO_DNI)
  const weekStartStr = weekStart.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })

  const bySource = {}
  for (const a of articles) {
    if (!bySource[a.source]) bySource[a.source] = []
    bySource[a.source].push(a)
  }

  let articlesContext = ''
  for (const [source, arts] of Object.entries(bySource)) {
    articlesContext += `\n### ${source}\n`
    for (const a of arts.slice(0, 6)) {
      const date = a.pubDate
        ? new Date(a.pubDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
        : 'brak daty'
      // Adres źródła musi trafić do promptu, inaczej model wymyśli go sam,
      // a przegląd ma służyć do podejmowania decyzji, nie do zgadywania.
      articlesContext += `- **${a.title}** [${date}] — ${a.link || 'brak adresu'}\n`
      if (a.description) articlesContext += `  ${a.description}\n`
    }
  }

  const prompt = `Przygotowujesz prywatny przeglad nowosci dla Norberta, ktory prowadzi jednoosobowa firme wdrazajaca AI i automatyzacje w polskich MSP. To nie jest tekst do publikacji. To material roboczy, ktory ma mu pomoc zdecydowac, o czym warto napisac i co warto wdrozyc u klientow.

Zakres czasowy: ${weekStartStr} - ${dateStr}
Zebrane artykuly (${articles.length} szt.):
${articlesContext}

ZADANIE: Wybierz od 6 do 10 pozycji, ktore maja realne znaczenie dla kogos, kto wdraza automatyzacje u malych firm. Pomijaj newsy o wycenach spolek, personaliach i wewnetrznych sporach korporacji.

WYMAGANIA:
1. Dla kazdej pozycji podaj: tytul, adres zrodla, date publikacji, dwa zdania streszczenia oraz JEDNO zdanie o tym, ktorej uslugi albo problemu klienta to dotyczy.
2. Uslugi do odniesienia: automatyzacja procesow biznesowych, agenci AI i chatboty, obieg dokumentow, szkolenia z AI, zgodnosc z AI Act.
3. ROZROZNIAJ WPROST streszczenie od wlasnej interpretacji. Streszczenie opisuje to, co bylo w materiale. Interpretacje oznaczaj slowami "Moja interpretacja:". Nigdy nie przedstawiaj wlasnego wniosku jako faktu z artykulu.
4. Jesli material nie ma adresu zrodla, pomin go w calosci.
5. Na koncu sekcja "## Co z tego moze byc tematem artykulu" z maksymalnie trzema propozycjami, kazda z jednym zdaniem uzasadnienia.
6. Ton rzeczowy, bez marketingu. To notatka dla jednej osoby, nie newsletter.
7. Format: Markdown.

Odpowiedz WYLACZNIE w formacie JSON (bez markdown code blocks, bez komentarzy):
{
  "title": "Przeglad nowosci AI — ${dateStr}",
  "content": "[pelny przeglad w Markdown]"
}`

  return zapytajGemini({ prompt, model: MODEL_TEKSTU, klucz: GOOGLE_API_KEY })
}

console.log(`📰 Krok 1/3: Pobieranie artykułów z RSS (ostatnie ${OKNO_DNI} dni)...`)
const articles = await pobierzArtykulyRss(OKNO_DNI)
console.log(`✅ Pobrano ${articles.length} artykułów\n`)

console.log('🤖 Krok 2/3: Opracowanie przeglądu (Gemini)...')
const przeglad = await generateBrief(articles)
console.log(`✅ Przegląd: "${przeglad.title}"\n`)

console.log('📧 Krok 3/3: Wysyłka na prywatną skrzynkę...')
const html = zbudujHtml({
  temat: przeglad.title,
  markdown: przeglad.content,
  stopka: `Przegląd zebrany automatycznie z kanałów RSS i opracowany modelem ${MODEL_TEKSTU}. Materiał roboczy, nie publikacja. Tematy do artykułów wybierasz sam.`,
})
const idWiadomosci = await wyslijMaila({
  klucz: RESEND_API_KEY,
  odbiorca: BRIEF_RECIPIENT_EMAIL,
  temat: przeglad.title,
  html,
})
console.log(`✅ Wysłano, id wiadomości: ${idWiadomosci}`)
console.log('   Na blogu nic nie przybyło — tak ma być.')
```

- [ ] **Krok 3: Sprawdź składnię i pobieranie RSS**

```bash
node --check .github/scripts/wspolne.mjs && node --check .github/scripts/blog-brief.mjs
node --input-type=module -e "import('./.github/scripts/wspolne.mjs').then(async m => { const a = await m.pobierzArtykulyRss(7); console.log('materiałów:', a.length, '| bez daty:', a.filter(x => !x.pubDate).length); console.log(a[0]) })"
```

Oczekiwane: brak błędów składni, liczba materiałów większa od zera, pierwszy materiał z niepustym `pubDate`.

- [ ] **Krok 4: Commit**

```bash
git add .github/scripts/wspolne.mjs .github/scripts/blog-brief.mjs
git commit -m "refactor(brief): wspolny modul RSS, Gemini i maila dla automatow"
```

---

## Zadanie 2: Bramka postów

**Files:**
- Modify: `scripts/seo/quality-gate.mjs` (eksport `CZARNA_LISTA`)
- Create: `scripts/seo/bramka-postow.mjs`
- Test: `scripts/seo/bramka-postow.test.mjs`

- [ ] **Krok 1: Wyeksportuj czarną listę z bramki bloga**

W `scripts/seo/quality-gate.mjs` zamień:

```js
const CZARNA_LISTA = [
```

na:

```js
export const CZARNA_LISTA = [
```

- [ ] **Krok 2: Napisz test `scripts/seo/bramka-postow.test.mjs`**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { sprawdzPost, normalizujAdres, znajdzZrodlo, LIMIT_LINKEDIN } from './bramka-postow.mjs'

const zrodla = [
  {
    title: 'Nowy model czyta dłuższe dokumenty',
    link: 'https://www.example.com/news/model/',
    pubDate: '2026-09-14T08:00:00.000Z',
    source: 'Example',
  },
  { title: 'Materiał bez daty', link: 'https://example.com/bez-daty', pubDate: '', source: 'Example' },
]

function dobryPost() {
  return {
    temat: 'Dłuższe dokumenty w jednym zapytaniu',
    zrodlo_url: 'https://example.com/news/model?utm_source=rss',
    streszczenie_zrodla: 'Producent wydał model. Obsługuje dłuższe dokumenty.',
    linkedin:
      'Producent wydał model, który czyta dłuższe dokumenty.\n\n' +
      'Dla małej firmy to mniej dzielenia faktur na strony.\n\n' +
      'Sprawdzaliście już odczyt faktur z AI u siebie?\n\n#AI #faktury',
    facebook: 'Nowy model czyta dłuższe dokumenty. Sprawdzaliście odczyt faktur z AI?',
    format: 'tekst',
  }
}

const kontekst = () => ({ zrodla, wykorzystane: new Set() })

test('poprawna propozycja przechodzi, hashtagi po pytaniu nie przeszkadzają', () => {
  assert.deepEqual(sprawdzPost(dobryPost(), kontekst()), { przechodzi: true, braki: [] })
})

test('adres normalizuje się bez www, parametrów i ukośnika na końcu', () => {
  assert.equal(normalizujAdres('https://www.example.com/news/model/?a=1#x'), 'example.com/news/model')
  assert.equal(normalizujAdres('to nie adres'), '')
  assert.equal(znajdzZrodlo('https://example.com/news/model', zrodla), zrodla[0])
})

test('źródło spoza zebranych materiałów i bez daty', () => {
  const obce = { ...dobryPost(), zrodlo_url: 'https://inna.pl/wymyslone' }
  assert.ok(sprawdzPost(obce, kontekst()).braki.includes('Źródło spoza zebranych materiałów'))

  const bezDaty = { ...dobryPost(), zrodlo_url: 'https://example.com/bez-daty' }
  assert.ok(sprawdzPost(bezDaty, kontekst()).braki.includes('Źródło bez tytułu albo daty publikacji'))
})

test('to samo źródło w dwóch propozycjach', () => {
  const ctx = { zrodla, wykorzystane: new Set(['example.com/news/model']) }
  assert.ok(sprawdzPost(dobryPost(), ctx).braki.includes('To samo źródło co w innej propozycji'))
})

test('limit znaków, pytanie na końcu i krótsza wersja na Facebooka', () => {
  const dlugi = { ...dobryPost(), linkedin: `${'a'.repeat(LIMIT_LINKEDIN)}?` }
  assert.ok(sprawdzPost(dlugi, kontekst()).braki.some(b => b.startsWith('Wersja na LinkedIn ma')))

  const bezPytania = { ...dobryPost(), linkedin: 'Producent wydał model.\n\nTo tyle.' }
  assert.ok(sprawdzPost(bezPytania, kontekst()).braki.includes('Wersja na LinkedIn nie kończy się pytaniem'))

  const post = dobryPost()
  const dluzszyFb = { ...post, facebook: `${post.linkedin} Dodatek?` }
  assert.ok(
    sprawdzPost(dluzszyFb, kontekst()).braki.includes('Wersja na Facebooka nie jest krótsza od wersji na LinkedIn')
  )
})

test('emoji, adres w treści, nadmiar hashtagów, czarna lista i nieznany format', () => {
  const post = dobryPost()
  const zly = {
    ...post,
    linkedin: `${post.linkedin} #a #b #c 🚀`,
    facebook: 'Ta rewolucja jest tu: https://example.com?',
    format: 'podcast',
  }
  const { braki } = sprawdzPost(zly, kontekst())
  assert.ok(braki.includes('Emoji w wersji na LinkedIn'))
  assert.ok(braki.includes('Wersja na LinkedIn ma więcej niż 3 hashtagi'))
  assert.ok(braki.includes('Adres URL w treści wersji na Facebooka'))
  assert.ok(braki.some(b => b.startsWith('Zwrot z czarnej listy w wersji na Facebooka')))
  assert.ok(braki.includes('Nieznany format: podcast'))
})
```

- [ ] **Krok 3: Uruchom test, żeby zobaczyć błąd**

```bash
node --test scripts/seo/bramka-postow.test.mjs
```

Oczekiwane: FAIL z `ERR_MODULE_NOT_FOUND` dla `bramka-postow.mjs`.

- [ ] **Krok 4: Utwórz `scripts/seo/bramka-postow.mjs`**

```js
/**
 * Bramka propozycji postów na LinkedIn i Facebooka.
 *
 * Sprawdza to, co da się sprawdzić maszynowo: pochodzenie źródła, powtórzenia, długość,
 * strukturę i higienę tekstu. Osiągalność adresu sprawdza skrypt, bo wymaga sieci.
 * Propozycja z brakami nie znika — trafia do maila oznaczona jako wymagająca uwagi.
 */
import { CZARNA_LISTA } from './quality-gate.mjs'

export const LIMIT_LINKEDIN = 1300
export const LIMIT_FACEBOOK = 600
export const MAX_HASHTAGOW = 3
export const FORMATY = ['tekst', 'karuzela', 'krótkie wideo']

const HASHTAG = /#[\p{L}\p{N}_]+/gu

/** Klucz porównania adresów: bez protokołu, www, parametrów, kotwicy i ukośnika na końcu. */
export function normalizujAdres(url) {
  try {
    const adres = new URL(url)
    return `${adres.hostname.replace(/^www\./, '')}${adres.pathname.replace(/\/$/, '')}`
  } catch {
    return ''
  }
}

export function znajdzZrodlo(url, zrodla) {
  const klucz = normalizujAdres(url)
  return klucz === '' ? undefined : zrodla.find(zrodlo => normalizujAdres(zrodlo.link) === klucz)
}

function sprawdzWersje(nazwa, tekst, limit, braki) {
  if (!tekst?.trim()) {
    braki.push(`Pusta wersja na ${nazwa}`)
    return
  }
  if (tekst.length > limit) braki.push(`Wersja na ${nazwa} ma ${tekst.length} znaków, limit ${limit}`)
  if ((tekst.match(HASHTAG) ?? []).length > MAX_HASHTAGOW) {
    braki.push(`Wersja na ${nazwa} ma więcej niż ${MAX_HASHTAGOW} hashtagi`)
  }
  if (/\p{Extended_Pictographic}/u.test(tekst)) braki.push(`Emoji w wersji na ${nazwa}`)
  if (/https?:\/\//.test(tekst)) braki.push(`Adres URL w treści wersji na ${nazwa}`)

  const znormalizowany = tekst.toLowerCase()
  for (const zwrot of CZARNA_LISTA) {
    if (znormalizowany.includes(zwrot)) braki.push(`Zwrot z czarnej listy w wersji na ${nazwa}: „${zwrot}”`)
  }
}

/** Ostatni akapit, który nie jest samą listą hashtagów. */
function ostatniAkapitTresci(tekst) {
  return (tekst ?? '')
    .trim()
    .split(/\n\s*\n/)
    .filter(akapit => akapit.replace(HASHTAG, '').trim() !== '')
    .at(-1)
    ?.trim()
}

export function sprawdzPost(post, { zrodla, wykorzystane }) {
  const braki = []

  const zrodlo = znajdzZrodlo(post.zrodlo_url, zrodla)
  if (!zrodlo) braki.push('Źródło spoza zebranych materiałów')
  else if (!zrodlo.title || !zrodlo.pubDate) braki.push('Źródło bez tytułu albo daty publikacji')

  if (wykorzystane.has(normalizujAdres(post.zrodlo_url))) braki.push('To samo źródło co w innej propozycji')
  if (!post.streszczenie_zrodla?.trim()) braki.push('Brak streszczenia źródła')

  sprawdzWersje('LinkedIn', post.linkedin, LIMIT_LINKEDIN, braki)
  sprawdzWersje('Facebooka', post.facebook, LIMIT_FACEBOOK, braki)

  if (post.linkedin?.trim() && !ostatniAkapitTresci(post.linkedin)?.endsWith('?')) {
    braki.push('Wersja na LinkedIn nie kończy się pytaniem')
  }
  if (post.linkedin && post.facebook && post.facebook.length >= post.linkedin.length) {
    braki.push('Wersja na Facebooka nie jest krótsza od wersji na LinkedIn')
  }
  if (!FORMATY.includes(post.format)) braki.push(`Nieznany format: ${post.format}`)

  return { przechodzi: braki.length === 0, braki }
}
```

- [ ] **Krok 5: Uruchom testy**

```bash
node --test "scripts/**/*.test.mjs"
```

Oczekiwane: wszystkie przechodzą, w tym sześć nowych z `bramka-postow.test.mjs`.

- [ ] **Krok 6: Commit**

```bash
git add scripts/seo/quality-gate.mjs scripts/seo/bramka-postow.mjs scripts/seo/bramka-postow.test.mjs
git commit -m "feat(posty): bramka propozycji postow"
```

---

## Zadanie 3: Zasady tematów i formatu

**Files:**
- Create: `docs/seo/social-topics.md`

- [ ] **Krok 1: Utwórz `docs/seo/social-topics.md`**

Liczby limitów celowo nie są tu powtórzone. Pilnuje ich bramka, a prompt bierze je z jej stałych.

```markdown
# Tematy i format postów na LinkedIn i Facebooka

Czyta ten plik automat `.github/scripts/social-posts.mjs` i czyta go człowiek przed redakcją.
Zmiana tematów nie wymaga ruszania kodu. Limity znaków i hashtagów pilnuje bramka
`scripts/seo/bramka-postow.mjs`. Standard pisarski bloga (`docs/seo/editorial-standard.md`)
obowiązuje także w postach.

## Tematy

Zakres wskazany przez właściciela. Każdy post dotyczy jednego z nich.

1. **Nowości w AI** — premiery i zmiany, które coś zmieniają dla małej firmy, nie dla inwestora.
2. **Automatyzacje w MŚP** — procesy, które da się przejąć przepływem, z nazwą narzędzia.
3. **Modele językowe** — co potrafią, gdzie się mylą, ile kosztują w realnym użyciu.
4. **Praktyczne rozwiązania** — jeden problem i jeden sposób na niego.
5. **Chatboty** — obsługa klienta, bazy wiedzy, przekazanie do człowieka.
6. **Voiceboty** — rozmowy telefoniczne i głosowe, ich granice.
7. **Ciekawostki dla MŚP** — rzeczy, o których właściciel małej firmy chętnie opowie dalej.

## Czego nie bierzemy

Wyceny spółek, zmiany personalne, spory między korporacjami, plotki o premierach bez materiału.
Post ma coś dać czytelnikowi, który prowadzi firmę, a nie informować o giełdzie.

## Głos

Pierwsza osoba, autor to Norbert Chojnacki, inżynier informatyki wdrażający AI i automatyzacje
w polskich MŚP. Bez wymyślonych wdrożeń, klientów i doświadczeń. Gdzie post potrzebuje osobistej
obserwacji, zostaje znacznik `[TWOJA OBSERWACJA]` do uzupełnienia przy redakcji.

## Format

**LinkedIn.** Pierwszy akapit jest hakiem, który zatrzymuje przewijanie. Potem konkret:
narzędzie, liczba, krok. Ostatni akapit kończy się pytaniem do czytelników.

**Facebook.** Krótsza wersja tej samej myśli, bardziej bezpośrednia.

**Obie wersje.** Bez emoji jako ozdobników. Hashtagi na końcu, nie w środku zdań.
Bez adresu źródła w treści: LinkedIn obcina zasięg postom z linkiem, więc adres idzie
w pierwszym komentarzu.

**Sugerowany format:** tekst, karuzela albo krótkie wideo.
```

- [ ] **Krok 2: Commit**

```bash
git add docs/seo/social-topics.md
git commit -m "docs(posty): tematy, glos i format postow"
```

---

## Zadanie 4: Skrypt propozycji postów

**Files:**
- Create: `.github/scripts/social-posts.mjs`

- [ ] **Krok 1: Utwórz `.github/scripts/social-posts.mjs`**

```js
/**
 * social-posts.mjs
 * Cotygodniowe propozycje postów na LinkedIn i Facebooka — wysyłane mailem do właściciela.
 *
 * Przepływ: RSS → Gemini → bramka postów → Resend → prywatna skrzynka
 *
 * Nic nie publikuje się samo i nic nie łączy się z LinkedInem ani Facebookiem.
 * Podgląd bez wysyłki: PODGLAD=1 zapisuje HTML maila do pliku podglad-posty.html.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { pobierzArtykulyRss, zapytajGemini, zbudujHtml, wyslijMaila } from './wspolne.mjs'
import {
  sprawdzPost,
  znajdzZrodlo,
  normalizujAdres,
  LIMIT_LINKEDIN,
  LIMIT_FACEBOOK,
  MAX_HASHTAGOW,
  FORMATY,
} from '../../scripts/seo/bramka-postow.mjs'

const { GOOGLE_API_KEY, RESEND_API_KEY, BRIEF_RECIPIENT_EMAIL, PODGLAD } = process.env

const MODEL_TEKSTU = 'gemini-3.8-flash'
const LICZBA_PROPOZYCJI = 5
// ponytail: okno równe kadencji zastępuje rejestr wysłanych źródeł. Ręczne uruchomienie
// w tym samym tygodniu powtórzy źródła; plik z wysłanymi adresami, gdy zacznie to przeszkadzać.
const OKNO_DNI = 7
const podglad = PODGLAD === '1'

if (!GOOGLE_API_KEY || (!podglad && (!RESEND_API_KEY || !BRIEF_RECIPIENT_EMAIL))) {
  console.error(
    '❌ Brak wymaganych zmiennych środowiskowych: GOOGLE_API_KEY, RESEND_API_KEY, BRIEF_RECIPIENT_EMAIL'
  )
  process.exit(1)
}

// Workflow robi checkout, więc oba pliki są na dysku, tak jak w blog-auto.
const STANDARD = readFileSync('docs/seo/editorial-standard.md', 'utf8')
const TEMATY = readFileSync('docs/seo/social-topics.md', 'utf8')

function zbudujPrompt(kandydaci, liczba) {
  const lista = kandydaci
    .slice(0, 60)
    .map((a, i) => `${i + 1}. ${a.title} | ${a.source} | ${a.pubDate.slice(0, 10)} | ${a.link}\n   ${a.description}`)
    .join('\n')

  return `Przygotowujesz propozycje postow na prywatny profil LinkedIn i Facebook Norberta Chojnackiego, inzyniera informatyki, ktory jako freelancer wdraza AI i automatyzacje w polskich MSP. Posty publikuje on sam, recznie, po redakcji.

TEMATY, GLOS I FORMAT — obowiazuja w calosci:

${TEMATY}

STANDARD PISARSKI BLOGA — obowiazuje tez w postach:

${STANDARD}

ZEBRANE MATERIALY z ostatnich ${OKNO_DNI} dni. Zrodla wolno brac wylacznie z tej listy:
${lista}

ZADANIE: Wybierz ${liczba} materialow o roznych adresach, ktore najlepiej pasuja do tematow, i do kazdego napisz propozycje posta po polsku.

WYMAGANIA:
1. zrodlo_url przepisz dokladnie z listy.
2. streszczenie_zrodla: dwa zdania wylacznie o tym, co jest w opisie materialu. Bez wlasnych wnioskow.
3. linkedin: najwyzej ${LIMIT_LINKEDIN} znakow, pierwszy akapit z hakiem, konkret, ostatni akapit konczy sie pytaniem do czytelnikow.
4. facebook: krotsza wersja tej samej mysli, najwyzej ${LIMIT_FACEBOOK} znakow.
5. Bez adresow URL w tresci postow.
6. Najwyzej ${MAX_HASHTAGOW} hashtagi na wersje, na koncu. Zero emoji.
7. Nie wymyslaj wdrozen, klientow ani doswiadczen autora. Gdzie post potrzebuje osobistej obserwacji, wstaw dokladnie: [TWOJA OBSERWACJA]
8. format: dokladnie jedno z: ${FORMATY.join(', ')}.

Odpowiedz WYLACZNIE w formacie JSON (bez markdown code blocks, bez komentarzy):
{"propozycje":[{"temat":"...","zrodlo_url":"...","streszczenie_zrodla":"...","linkedin":"...","facebook":"...","format":"tekst"}]}`
}

/** Zwraca opis problemu albo null, gdy adres odpowiada. */
async function problemZAdresem(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; zautomatyzujemy.pl social-posts)' },
    })
    return res.ok ? null : `Źródło odpowiada HTTP ${res.status}`
  } catch (e) {
    return `Źródło nie odpowiada: ${e.message}`
  }
}

function sekcjaPropozycji(propozycja, indeks) {
  const { zrodlo, braki } = propozycja
  const status = braki.length === 0 ? 'gotowa do redakcji' : 'WYMAGA UWAGI'
  const opisZrodla = zrodlo
    ? `[${zrodlo.title}](${zrodlo.link}) — ${zrodlo.source}, ${zrodlo.pubDate.slice(0, 10)}`
    : `${propozycja.zrodlo_url} (spoza zebranych materiałów)`

  return [
    `## ${indeks + 1}. ${propozycja.temat} — ${status}`,
    `**Źródło do pierwszego komentarza:** ${opisZrodla}`,
    `**Co mówi źródło (streszczenie materiału, nie opinia):** ${propozycja.streszczenie_zrodla}`,
    `**Sugerowany format:** ${propozycja.format}`,
    ...(braki.length > 0 ? [`**Do poprawy:** ${braki.join('; ')}`] : []),
    '### LinkedIn',
    propozycja.linkedin,
    '### Facebook',
    propozycja.facebook,
  ].join('\n\n')
}

console.log(`📰 Krok 1/4: Pobieranie materiałów z RSS (ostatnie ${OKNO_DNI} dni)...`)
const kandydaci = (await pobierzArtykulyRss(OKNO_DNI)).filter(a => a.link && a.pubDate)
if (kandydaci.length === 0) throw new Error('Brak materiałów z adresem i datą — przerywam.')
console.log(`✅ Materiałów z adresem i datą: ${kandydaci.length}\n`)

console.log('🤖 Krok 2/4: Propozycje postów (Gemini)...')
const liczba = Math.min(LICZBA_PROPOZYCJI, kandydaci.length)
const { propozycje = [] } = await zapytajGemini({
  prompt: zbudujPrompt(kandydaci, liczba),
  model: MODEL_TEKSTU,
  klucz: GOOGLE_API_KEY,
  limitMs: 90000,
})
console.log(`✅ Propozycji: ${propozycje.length}\n`)

console.log('🔍 Krok 3/4: Bramka...')
const wykorzystane = new Set()
for (const propozycja of propozycje) {
  const { braki } = sprawdzPost(propozycja, { zrodla: kandydaci, wykorzystane })
  wykorzystane.add(normalizujAdres(propozycja.zrodlo_url))
  propozycja.zrodlo = znajdzZrodlo(propozycja.zrodlo_url, kandydaci)
  const problem = propozycja.zrodlo ? await problemZAdresem(propozycja.zrodlo.link) : null
  propozycja.braki = problem ? [...braki, problem] : braki
  console.log(`  ${propozycja.braki.length === 0 ? '✓' : '⚠'} ${propozycja.temat}`)
}

const dataStr = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
const temat = `Propozycje postów — ${dataStr}`
const gotowe = propozycje.filter(p => p.braki.length === 0).length
const html = zbudujHtml({
  temat,
  markdown: [
    `${gotowe} z ${propozycje.length} propozycji przeszło bramkę. Źródło każdej wklej w pierwszy komentarz, nie w treść posta. Znacznik [TWOJA OBSERWACJA] zastąp własnym zdaniem albo usuń.`,
    ...propozycje.map(sekcjaPropozycji),
  ].join('\n\n'),
  stopka: `Propozycje przygotowane automatycznie z kanałów RSS modelem ${MODEL_TEKSTU}. Materiał roboczy: publikujesz sam, po redakcji.`,
})

console.log('\n📧 Krok 4/4: Wysyłka...')
if (podglad) {
  writeFileSync('podglad-posty.html', html)
  console.log('✅ Podgląd zapisany w podglad-posty.html — nic nie wysłano.')
} else {
  const id = await wyslijMaila({ klucz: RESEND_API_KEY, odbiorca: BRIEF_RECIPIENT_EMAIL, temat, html })
  console.log(`✅ Wysłano, id wiadomości: ${id}`)
}
```

- [ ] **Krok 2: Sprawdź składnię**

```bash
node --check .github/scripts/social-posts.mjs
```

Oczekiwane: brak wyjścia.

- [ ] **Krok 3: Uruchom podgląd lokalnie**

Lokalny klucz Gemini nazywa się inaczej niż sekret w GitHubie, dlatego mapowanie w poleceniu.

```bash
PODGLAD=1 GOOGLE_API_KEY=$(grep '^GOOGLE_GENERATIVE_AI_API_KEY=' .env.local | cut -d= -f2-) node .github/scripts/social-posts.mjs
```

Oczekiwane: cztery kroki w logu, pięć propozycji w kroku 3, plik `podglad-posty.html`.

- [ ] **Krok 4: Przeczytaj podgląd**

Otwórz `podglad-posty.html` w przeglądarce. Sprawdź dla każdej propozycji:
- źródło to prawdziwy materiał z listy, z datą i działającym adresem,
- streszczenie opisuje materiał, a nie opinię modelu,
- wersja na LinkedIn kończy się pytaniem, wersja na Facebooka jest krótsza,
- żadnego wymyślonego wdrożenia ani klienta.

Jeśli propozycje łamią zasady powtarzalnie, popraw `docs/seo/social-topics.md`, nie kod.
Plik podglądu nie idzie do repozytorium:

```bash
rm podglad-posty.html
```

- [ ] **Krok 5: Commit**

```bash
git add .github/scripts/social-posts.mjs
git commit -m "feat(posty): skrypt propozycji postow z bramka i podgladem"
```

---

## Zadanie 5: Workflow i rejestr systemów AI

**Files:**
- Create: `.github/workflows/social-posts.yml`
- Modify: `lib/ai-registry.ts` (nowy wpis po `blog-brief`)

- [ ] **Krok 1: Utwórz `.github/workflows/social-posts.yml`**

```yaml
name: Propozycje postów — mailem

on:
  schedule:
    - cron: '30 6 * * 1' # Poniedziałek, ~08:30 czasu polskiego latem
  workflow_dispatch: # Możliwość ręcznego uruchomienia z GitHub UI

jobs:
  social-posts:
    name: Zbierz materiały i wyślij propozycje postów
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24

      # Skrypt nie ma zależności, więc bez npm ci. Nic nie publikuje, tylko wysyła maila.
      - name: Przygotuj propozycje i wyślij mailem
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          BRIEF_RECIPIENT_EMAIL: ${{ secrets.BRIEF_RECIPIENT_EMAIL }}
        run: node .github/scripts/social-posts.mjs
```

- [ ] **Krok 2: Dopisz wpis w `lib/ai-registry.ts`**

Po wpisie `blog-brief`, przed wpisem `Baza wiedzy — embeddingi`, wstaw:

```ts
  {
    name: 'social-posts',
    model: 'gemini-3.8-flash',
    purpose:
      'Cotygodniowe propozycje postów na LinkedIn i Facebooka wysyłane mailem do właściciela — publikuje człowiek, po redakcji',
    inputs: 'Kanały RSS producentów modeli i mediów branżowych',
    role: 'podmiot stosujący',
  },
```

- [ ] **Krok 3: Sprawdź typy i lint**

```bash
npx tsc --noEmit -p .
npx eslint lib/ai-registry.ts .github/scripts/wspolne.mjs .github/scripts/blog-brief.mjs .github/scripts/social-posts.mjs scripts/seo/bramka-postow.mjs scripts/seo/bramka-postow.test.mjs
```

Oczekiwane: brak błędów.

- [ ] **Krok 4: Commit**

```bash
git add .github/workflows/social-posts.yml lib/ai-registry.ts
git commit -m "feat(posty): cotygodniowy workflow i wpis w rejestrze systemow AI"
```

---

## Zadanie 6: Wdrożenie i pierwszy mail

- [ ] **Krok 1: Pełna weryfikacja**

```bash
node --test "scripts/**/*.test.mjs" && npx tsc --noEmit -p .
```

Oczekiwane: wszystkie testy przechodzą, typy bez błędów.

- [ ] **Krok 2: Pull request**

```bash
git push -u origin feat/automat-postow
gh pr create --base main --head feat/automat-postow --title "Automat propozycji postow na LinkedIn i Facebooka" --body "Plan czwarty projektu widocznosci. Piec propozycji tygodniowo mailem, bramka postow, wspolny modul RSS i maila z przegladem nowosci. Nic nie laczy sie z LinkedInem ani Facebookiem."
```

- [ ] **Krok 3: Po scaleniu przez właściciela uruchom workflow ręcznie**

```bash
gh workflow run social-posts.yml
gh run watch $(gh run list --workflow social-posts.yml --limit 1 --json databaseId -q '.[0].databaseId') --exit-status
```

Oczekiwane: bieg kończy się sukcesem, w logu jest `Wysłano, id wiadomości`. Właściciel potwierdza, że mail doszedł.

- [ ] **Krok 4: Zaktualizuj `docs/seo/STAN-PROJEKTU.md`**

W tabeli planów zamień wiersz planu czwartego na:

```markdown
| 4. Automat propozycji postów na LinkedIn i Facebooka | scalony, workflow `social-posts.yml`, poniedziałki | **zrobiony** |
```

W sekcji „Gdzie co leży” dopisz wiersz:

```markdown
| `docs/seo/social-topics.md` | tematy, głos i format postów, czyta automat postów |
```

- [ ] **Krok 5: Commit**

```bash
git add docs/seo/STAN-PROJEKTU.md
git commit -m "docs(posty): plan czwarty wdrozony"
```

---

## Kryterium ukończenia

Przez dwa kolejne poniedziałki mail dochodzi, a co najmniej trzy z pięciu propozycji w każdym
przechodzą bramkę bez uwag. Jeśli nie, poprawiamy `docs/seo/social-topics.md` i prompt,
nie limity bramki.

## Ryzyka

| Ryzyko | Co z nim robimy |
|---|---|
| GitHub usypia harmonogramy po 60 dniach bez commita | Znane z projektu. Przy dłuższej przerwie `gh workflow list --all` i `gh workflow enable` |
| Kanał RSS padnie albo zmieni format | Skrypt pomija kanał z ostrzeżeniem w logu, reszta działa |
| Model wymyśli źródło | Bramka odrzuca adres spoza zebranych materiałów, propozycja idzie oznaczona |
| Strona źródła blokuje roboty i zwraca 403 | Propozycja idzie oznaczona „wymaga uwagi”, właściciel otwiera adres ręcznie |
