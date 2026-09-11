/**
 * blog-brief.mjs
 * Miesięczny przegląd nowości AI — wysyłany mailem do właściciela, nie publikowany na blogu.
 *
 * Przepływ: RSS feeds → Gemini (tekst) → Resend → prywatna skrzynka
 *
 * Dlaczego mailem: przeglądy newsów nie mają popytu w wyszukiwarce (nikt nie wpisuje
 * „nowości AI 2026-08-24"), a zajmowały połowę bloga. Zbieranie materiałów zostaje,
 * bo jest użyteczne — zmienia się tylko odbiorca.
 *
 * Resend wołamy przez API, bo lib/email/resend.ts to moduł TypeScript aplikacji Next.js,
 * którego skrypt GitHub Actions nie zaimportuje.
 */

const { GOOGLE_API_KEY, RESEND_API_KEY, BRIEF_RECIPIENT_EMAIL } = process.env

const MODEL_TEKSTU = 'gemini-3.8-flash'
const FROM_EMAIL = 'powiadomienia@zautomatyzujemy.pl'

if (!GOOGLE_API_KEY || !RESEND_API_KEY || !BRIEF_RECIPIENT_EMAIL) {
  console.error(
    '❌ Brak wymaganych zmiennych środowiskowych: GOOGLE_API_KEY, RESEND_API_KEY, BRIEF_RECIPIENT_EMAIL'
  )
  process.exit(1)
}

// ─── RSS Feeds ────────────────────────────────────────────────────────────────

const FEEDS = [
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Krok 1: Pobieranie RSS ───────────────────────────────────────────────────

// Okno czasowe równe kadencji: przegląd jest miesięczny, więc bierzemy 30 dni.
// Przy tygodniowym oknie połowa miesiąca wypadałaby poza zasięg.
const OKNO_DNI = 30

async function fetchRssArticles() {
  const odKiedy = Date.now() - OKNO_DNI * 24 * 60 * 60 * 1000
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
        const pubDate = pubDateStr ? new Date(pubDateStr).getTime() : Date.now()
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
          pubDate: new Date(pubDate).toISOString(),
          source: feed.source,
        })
      }
      console.log(`  ✓ ${feed.source}: ${articles.filter(a => a.source === feed.source).length} artykułów`)
    } catch (e) {
      console.log(`  ⚠ ${feed.source}: ${e.message}`)
    }
  }

  if (articles.length === 0) throw new Error(`Brak artykułów z ostatnich ${OKNO_DNI} dni — przerywam.`)
  articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  return articles
}

// ─── Krok 2: Generowanie briefu (Gemini) ─────────────────────────────────────

async function generateBrief(articles) {
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
      const date = new Date(a.pubDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEKSTU}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(60000),
    }
  )

  if (!res.ok) throw new Error(`Gemini text API: HTTP ${res.status}`)
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return parseJsonFromGemini(text)
}

// ─── Krok 3: Wysyłka mailem ──────────────────────────────────────────────────

function escapeHtml(tekst) {
  return tekst
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Zamiana Markdown na prosty HTML. Świadomie bez biblioteki: skrypt nie ma zależności,
 * a przegląd czyta jedna osoba w kliencie pocztowym, gdzie i tak połowa stylów odpada.
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

async function wyslijPrzeglad(temat, markdown) {
  const html = `<!DOCTYPE html>
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
        Przegląd zebrany automatycznie z kanałów RSS i opracowany modelem ${escapeHtml(MODEL_TEKSTU)}.
        Materiał roboczy, nie publikacja. Tematy do artykułów wybierasz sam.
      </p>
    </div>
  </div>
</body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: BRIEF_RECIPIENT_EMAIL,
      subject: temat,
      html,
    }),
    signal: AbortSignal.timeout(20000),
  })

  if (!res.ok) {
    throw new Error(`Resend: HTTP ${res.status} ${await res.text()}`)
  }

  const dane = await res.json()
  return dane.id ?? 'brak id'
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`📰 Krok 1/3: Pobieranie artykułów z RSS (ostatnie ${OKNO_DNI} dni)...`)
const articles = await fetchRssArticles()
console.log(`✅ Pobrano ${articles.length} artykułów\n`)

console.log('🤖 Krok 2/3: Opracowanie przeglądu (Gemini)...')
const przeglad = await generateBrief(articles)
console.log(`✅ Przegląd: "${przeglad.title}"\n`)

console.log('📧 Krok 3/3: Wysyłka na prywatną skrzynkę...')
const idWiadomosci = await wyslijPrzeglad(przeglad.title, przeglad.content)
console.log(`✅ Wysłano, id wiadomości: ${idWiadomosci}`)
console.log('   Na blogu nic nie przybyło — tak ma być.')
