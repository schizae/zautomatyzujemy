/**
 * blog-brief.mjs
 * Tygodniowy Brief AI — migracja z n8n na GitHub Actions
 *
 * Przepływ: RSS feeds → Gemini (tekst) → Gemini (obraz) → ImgBB → /api/blog/publish
 */

const { GOOGLE_API_KEY, IMGBB_API_KEY, WEBHOOK_SECRET, SITE_URL } = process.env

if (!GOOGLE_API_KEY || !IMGBB_API_KEY || !WEBHOOK_SECRET || !SITE_URL) {
  console.error('❌ Brak wymaganych zmiennych środowiskowych: GOOGLE_API_KEY, IMGBB_API_KEY, WEBHOOK_SECRET, SITE_URL')
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

async function fetchRssArticles() {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
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
        if (pubDate < sevenDaysAgo) continue

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

  if (articles.length === 0) throw new Error('Brak artykułów z ostatnich 7 dni — przerywam.')
  articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  return articles
}

// ─── Krok 2: Generowanie briefu (Gemini) ─────────────────────────────────────

async function generateBrief(articles) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
  const isoDate = today.toISOString().split('T')[0]
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 7)
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
      articlesContext += `- **${a.title}** [${date}]\n`
      if (a.description) articlesContext += `  ${a.description}\n`
    }
  }

  const prompt = `Jestes redaktorem newslettera "Zautomatyzujemy.pl Brief" skierowanego do polskich wlascicieli firm i menedzerow. Tworzysz cotygodniowy przeglad najwazniejszych wydarzen ze swiata AI i automatyzacji.

Zakres czasowy: ${weekStartStr} - ${dateStr}
Zebrane artykuly (${articles.length} szt.):
${articlesContext}

ZADANIE: Na podstawie powyzszych artykulow napisz tygodniowy brief w jezyku polskim.

WYMAGANIA:
1. Wybierz 6-8 NAJWAZNIEJSZYCH wydarzen (priorytet: premiery produktow, przelomowe badania, zmiany strategiczne duzych firm, trendy wplywajace na biznes)
2. Dla kazdego wydarzenia: chwytliwy srodtytul + 2-3 zdania opisu co sie stalo i dlaczego jest wazne
3. Sekcja koncowa "## Co to oznacza dla Twojego biznesu?" z 3 praktycznymi wnioskami dla MSP
4. Ton: profesjonalny, przystepny, bez zargonu technicznego
5. Format: Markdown (## dla glownych sekcji, **bold** dla kluczowych pojec)
6. Nie zaczynaj od tytulu — od razu pierwsza sekcja tematyczna

Odpowiedz WYLACZNIE w formacie JSON (bez markdown code blocks, bez komentarzy):
{
  "title": "Nowosci ze swiata AI — ${dateStr}",
  "slug": "nowosci-ai-${isoDate}",
  "excerpt": "Cotygodniowy przeglad: [2-3 zdania streszczajace najwazniejsze wydarzenia tygodnia]",
  "content": "[pelny artykul w Markdown]",
  "tags": ["Tygodniowy brief", "Nowosci AI", "Automatyzacja"],
  "image_prompt": "[prompt do okladki po angielsku: profesjonalna ilustracja bez tekstu, nawiazujaca do tematyki AI w biznesie, styl editorial magazine]"
}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
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

// ─── Krok 3: Generowanie okładki (Gemini) ────────────────────────────────────

async function generateCoverImage(imagePrompt) {
  const prompt = `${imagePrompt}. High quality editorial illustration, modern minimalist style, no text, no letters, no words anywhere in the image. Professional AI business newsletter cover.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
      signal: AbortSignal.timeout(60000),
    }
  )

  if (!res.ok) throw new Error(`Gemini image API: HTTP ${res.status}`)
  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'))
  if (!imagePart) throw new Error('Gemini nie zwrócił obrazu')
  return imagePart.inlineData.data
}

// ─── Krok 4: Upload do ImgBB ─────────────────────────────────────────────────

async function uploadToImgBB(base64Image) {
  const body = new URLSearchParams()
  body.append('image', base64Image)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) throw new Error(`ImgBB upload: HTTP ${res.status}`)
  const data = await res.json()
  const url = data?.data?.url
  if (!url) throw new Error('ImgBB nie zwróciło URL obrazu')
  return url
}

// ─── Krok 5: Publikacja ───────────────────────────────────────────────────────

async function publishPost(post) {
  const res = await fetch(`${SITE_URL}/api/blog/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': WEBHOOK_SECRET,
    },
    body: JSON.stringify(post),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Błąd publikacji (${res.status}): ${text}`)
  }

  return res.json()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('📰 Krok 1/5: Pobieranie artykułów z RSS...')
const articles = await fetchRssArticles()
console.log(`✅ Pobrano ${articles.length} artykułów z ostatnich 7 dni\n`)

console.log('🤖 Krok 2/5: Generowanie briefu (Gemini)...')
const article = await generateBrief(articles)
console.log(`✅ Brief: "${article.title}"\n`)

console.log('🎨 Krok 3/5: Generowanie okładki (Gemini)...')
const base64Image = await generateCoverImage(article.image_prompt)
console.log('✅ Okładka wygenerowana\n')

console.log('📤 Krok 4/5: Upload okładki do ImgBB...')
const coverUrl = await uploadToImgBB(base64Image)
console.log(`✅ Okładka: ${coverUrl}\n`)

console.log('🚀 Krok 5/5: Publikacja na blogu...')
const result = await publishPost({
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt ?? '',
  content: article.content,
  cover_image: coverUrl,
  tags: article.tags ?? ['Tygodniowy brief', 'Nowosci AI'],
  author: 'Zautomatyzujemy.pl',
})
console.log(`✅ Opublikowano: ${SITE_URL}${result.url}`)
