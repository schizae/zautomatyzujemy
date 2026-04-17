/**
 * blog-auto.mjs
 * Automatyczny artykuł blogowy — co tydzień nowy temat z AI/automatyzacji dla polskich MSP
 *
 * Przepływ: /api/blog/existing-topics → Gemini (temat + artykuł) → Gemini (obraz) → ImgBB → /api/blog/publish
 */

const { GOOGLE_API_KEY, IMGBB_API_KEY, WEBHOOK_SECRET, SITE_URL } = process.env

if (!GOOGLE_API_KEY || !IMGBB_API_KEY || !WEBHOOK_SECRET || !SITE_URL) {
  console.error('❌ Brak wymaganych zmiennych środowiskowych: GOOGLE_API_KEY, IMGBB_API_KEY, WEBHOOK_SECRET, SITE_URL')
  process.exit(1)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJsonFromGemini(text) {
  try {
    return JSON.parse(text)
  } catch {
    const m = text.match(/\{[\s\S]+\}/)
    if (!m) throw new Error(`Gemini nie zwrócił JSON. Fragment: ${text.slice(0, 300)}`)
    return JSON.parse(m[0])
  }
}

function sanitizeSlug(slug) {
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // usuń znaki diakrytyczne
    .replace(/[^a-z0-9-]/g, '-')       // tylko litery, cyfry, myślniki
    .replace(/-+/g, '-')               // usuń podwójne myślniki
    .replace(/^-|-$/g, '')             // usuń myślniki na początku/końcu
}

// ─── Krok 1: Pobierz istniejące tematy ───────────────────────────────────────

async function getExistingTopics() {
  const res = await fetch(`${SITE_URL}/api/blog/existing-topics`, {
    headers: { 'x-webhook-secret': WEBHOOK_SECRET },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    console.log(`  ⚠ Nie udało się pobrać tematów (${res.status}), kontynuuję bez historii`)
    return []
  }

  const data = await res.json()
  return data.topics ?? []
}

// ─── Krok 2: Generowanie artykułu (Gemini) ───────────────────────────────────

async function generateArticle(existingTopics) {
  const today = new Date()
  const isoDate = today.toISOString().split('T')[0]
  const dateStr = today.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })

  const existingList = existingTopics
    .slice(0, 40)
    .map(t => `- ${t.title}${t.tags.length ? ` [${t.tags.join(', ')}]` : ''}`)
    .join('\n')

  const prompt = `Jestes autorem bloga "Zautomatyzujemy.pl" — specjalistycznego portalu o AI i automatyzacji dla polskich MSP (firmy 5-100 pracownikow).

Aktualna data: ${dateStr}

ISTNIEJACE ARTYKULY (unikaj powielania tematyki):
${existingList || '(brak dotychczasowych artykulow — wybierz dowolny temat)'}

ZADANIE: Wygeneruj kompletny, unikalny artykul blogowy o AI lub automatyzacji procesow biznesowych.

WYMAGANIA TEMATYCZNE:
- Praktyczny i konkretny — wlasciciel firmy moze wdrozyc to samodzielnie lub zlecic
- Moze dotyczyc: automatyzacja obslugi klienta, AI w sprzedazy/marketingu, chatboty, integracje API/n8n, oszczednosci kosztow dzieki AI, RAG i bazy wiedzy, automatyzacja dokumentow i faktur, AI w rekrutacji, konkretne narzedzia (Make, Zapier, n8n, ChatGPT API)
- UNIKALNY — nie powtarzaj tematow z listy powyzej

WYMAGANIA DOTYCZACE ARTYKULU:
1. Dlugosc: 900-1300 slow
2. Struktura: wstep z hakiem (problem lub statystyka), 3-5 sekcji merytorycznych, zakonczenie z CTA
3. Format: Markdown z naglowkami ##, pogrubieniami **tekst**, listami punktowymi i numerowanymi
4. Jezyk: polski, ekspercki ale przystepny, zero zbednego zargonu
5. Zawrzyj przynajmniej 1 konkretny przyklad lub case study (moze byc hipotetyczny)
6. Zakonczenie: CTA zachecajace do bezplatnej konsultacji na zautomatyzujemy.pl

WYMAGANIA DOTYCZACE SLUGA:
- Tylko male litery a-z (bez polskich znakow!), cyfry 0-9, myslniki
- Przyklad poprawnego: "automatyzacja-obslugi-klienta-ai", "chatbot-dla-sklepu-online"

Odpowiedz WYLACZNIE w formacie JSON (bez markdown code blocks, bez komentarzy):
{
  "title": "[tytul artykulu po polsku — chwytliwy, SEO-friendly, 50-70 znakow]",
  "slug": "[slug: tylko a-z, 0-9, myslniki, bez polskich znakow]",
  "excerpt": "[2-3 zdania: co czytelnik sie dowie i jaka ma korzysc — dla Google i social media]",
  "content": "[pelny artykul w Markdown, min 900 slow]",
  "tags": ["[tag1]", "[tag2]", "[tag3]", "[tag4]"],
  "image_prompt": "[prompt do okladki po angielsku: konkretna, profesjonalna ilustracja bez tekstu, styl editorial magazine, nawiazuje do tematu artykulu, nowoczesny minimalizm]"
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
      signal: AbortSignal.timeout(90000),
    }
  )

  if (!res.ok) throw new Error(`Gemini text API: HTTP ${res.status}`)
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const article = parseJsonFromGemini(text)

  // Sanityzacja sluga — zabezpieczenie przed polskimi znakami z Gemini
  article.slug = sanitizeSlug(article.slug)
  if (!article.slug) article.slug = `artykul-ai-${isoDate}`

  return article
}

// ─── Krok 3: Generowanie okładki (Gemini) ────────────────────────────────────

async function generateCoverImage(imagePrompt) {
  const prompt = `${imagePrompt}. High quality editorial illustration, modern minimalist style, absolutely no text, no letters, no words anywhere in the image. Professional business magazine cover image.`

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

console.log('📚 Krok 1/5: Pobieranie istniejących tematów...')
const existingTopics = await getExistingTopics()
console.log(`✅ Znaleziono ${existingTopics.length} istniejących artykułów\n`)

console.log('🤖 Krok 2/5: Generowanie artykułu (Gemini)...')
const article = await generateArticle(existingTopics)
console.log(`✅ Artykuł: "${article.title}"`)
console.log(`   Slug: ${article.slug}\n`)

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
  tags: article.tags ?? [],
  author: 'Zautomatyzujemy.pl',
})
console.log(`✅ Opublikowano: ${SITE_URL}${result.url}`)
