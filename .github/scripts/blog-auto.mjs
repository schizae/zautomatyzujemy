/**
 * blog-auto.mjs
 * Automatyczny artykuł blogowy — co tydzień nowy temat z AI/automatyzacji dla polskich MSP
 *
 * Przepływ: /api/blog/existing-topics → Gemini (temat + artykuł) → Gemini (obraz) → ImgBB → /api/blog/publish
 */

import { readFileSync } from 'node:fs'
import { sprawdzArtykul } from '../../scripts/seo/quality-gate.mjs'

const { GOOGLE_API_KEY, IMGBB_API_KEY, WEBHOOK_SECRET, SITE_URL } = process.env

// Nazwy modeli w jednym miejscu, bo rozjeżdżały się między wywołaniem a polem
// ai_model w ładunku publikacji, a to pole trafia do rejestru systemów AI.
const MODEL_TEKSTU = 'gemini-3.8-flash'
const MODEL_OBRAZU = 'gemini-3.1-flash-image'

// Plan treści i standard pisarski leżą w repozytorium, bo czyta je też bramka jakości
// i człowiek. Workflow robi checkout, więc oba pliki są na dysku.
const PLAN_TRESCI = readFileSync('docs/seo/plan-tresci.md', 'utf8')
const STANDARD = readFileSync('docs/seo/editorial-standard.md', 'utf8')

if (!GOOGLE_API_KEY || !IMGBB_API_KEY || !WEBHOOK_SECRET || !SITE_URL) {
  console.error('❌ Brak wymaganych zmiennych środowiskowych: GOOGLE_API_KEY, IMGBB_API_KEY, WEBHOOK_SECRET, SITE_URL')
  process.exit(1)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Gemini mimo responseMimeType: application/json potrafi wstawić surowy znak
 * nowej linii w środku stringa. JSON zabrania znaków sterujących w literałach,
 * więc escapujemy je, nie ruszając struktury dokumentu.
 */
function escapeControlCharsInStrings(json) {
  const ESCAPES = { '\n': '\\n', '\r': '\\r', '\t': '\\t', '\b': '\\b', '\f': '\\f' }
  let out = ''
  let inString = false
  let escaped = false

  for (const char of json) {
    if (escaped) {
      out += char
      escaped = false
      continue
    }

    if (inString && char === '\\') {
      out += char
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      out += char
      continue
    }

    if (inString && char.charCodeAt(0) < 0x20) {
      out += ESCAPES[char] ?? `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
      continue
    }

    out += char
  }

  return out
}

function parseJsonFromGemini(text) {
  const extracted = text.match(/\{[\s\S]+\}/)
  const candidates = extracted ? [text, extracted[0]] : [text]

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {
      try {
        return JSON.parse(escapeControlCharsInStrings(candidate))
      } catch {
        // następny kandydat
      }
    }
  }

  throw new Error(`Gemini nie zwrócił poprawnego JSON. Fragment: ${text.slice(0, 300)}`)
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
  return { topics: data.topics ?? [], services: data.services ?? [] }
}

// ─── Wybór tematu z planu treści ─────────────────────────────────────────────

/**
 * Tematy siedzą w tabelach Markdown w docs/seo/plan-tresci.md.
 * Kolumny: numer, temat, fraza główna, wolumen, intencja.
 * Parsujemy plik, a nie osobną tabelę w bazie, bo dwanaście pozycji na kwartał
 * nie potrzebuje schematu ani edytora.
 */
function tematyZPlanu(markdown) {
  const tematy = []

  for (const linia of markdown.split('\n')) {
    if (!linia.startsWith('|')) continue

    const kolumny = linia.split('|').map(k => k.trim())
    const [, numer, temat, fraza, wolumen, intencja] = kolumny
    if (!/^\d+[a-z]?$/.test(numer ?? '')) continue

    tematy.push({ numer, temat, fraza, wolumen: Number(wolumen) || 0, intencja })
  }

  return tematy
}

function pierwszyWolnyTemat(tematy, istniejace) {
  const uzyte = new Set(
    istniejace.map(a => (a.targetKeyword ?? '').toLowerCase().trim()).filter(Boolean)
  )
  return tematy.find(t => !uzyte.has(t.fraza.toLowerCase().trim())) ?? null
}

// ─── Krok 2: Generowanie artykułu (Gemini) ───────────────────────────────────

async function generateArticle(temat, existingTopics, serviceSlugs) {
  const today = new Date()
  const isoDate = today.toISOString().split('T')[0]
  const dateStr = today.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })

  const istniejaceArtykuly = existingTopics
    .slice(0, 40)
    .map(t => `- /blog/${t.slug} — ${t.title}`)
    .join('\n')

  const dostepneUslugi = serviceSlugs.map(s => `- /uslugi/${s}`).join('\n')

  const prompt = `Jestes autorem bloga "Zautomatyzujemy.pl" — portalu o AI i automatyzacji dla polskich firm (5-100 pracownikow). Autorem jest Norbert Chojnacki, inzynier informatyki, ktory te wdrozenia robi osobiscie.

Aktualna data: ${dateStr}

TEMAT JEST JUZ WYBRANY. Nie zmieniaj go i nie proponuj innego.
- Temat: ${temat.temat}
- Fraza docelowa: ${temat.fraza}
- Intencja czytelnika: ${temat.intencja}

STANDARD PISARSKI — obowiazuje w calosci, to nie sa sugestie:

${STANDARD}

ISTNIEJACE ARTYKULY (linkuj wylacznie do tych adresow):
${istniejaceArtykuly || '(brak)'}

DOSTEPNE STRONY USLUGOWE (linkuj wylacznie do tych adresow):
${dostepneUslugi || '(brak)'}

WYMAGANIA TWARDE, ktorych naruszenie odrzuca artykul automatycznie:
1. Fraza "${temat.fraza}" musi wystapic doslownie w tytule oraz w pierwszym akapicie tresci.
2. Pierwszy akapit odpowiada na pytanie zawarte we frazie w dwoch zdaniach, przed jakimkolwiek wstepem.
3. Co najmniej dwa odnosniki do zrodel zewnetrznych w formacie Markdown, do stron, ktore naprawde istnieja.
4. Co najmniej jeden odnosnik do istniejacego artykulu z listy powyzej.
5. Co najmniej dwa odnosniki do stron uslugowych z listy powyzej, o ile pasuja do tematu.
6. W drugiej polowie tekstu, po sekcji merytorycznej, wstaw dokladnie ten znacznik w osobnej linii:
<!-- WSTAWKA -->
   To miejsce na akapit wlasnego doswiadczenia, ktory dopisze autor. Nie wymyslaj tego akapitu.
7. Zadnego zwrotu z czarnej listy ze standardu pisarskiego.
8. Zadnej statystyki bez odnosnika do zrodla.

WYMAGANIA DOTYCZACE SLUGA:
- Tylko male litery a-z (bez polskich znakow), cyfry 0-9, myslniki
- Slug ma zawierac fraze docelowa w formie bez polskich znakow

Odpowiedz WYLACZNIE w formacie JSON (bez markdown code blocks, bez komentarzy):
{
  "title": "[tytul po polsku zawierajacy fraze docelowa, 50-70 znakow]",
  "slug": "[slug: tylko a-z, 0-9, myslniki]",
  "excerpt": "[2-3 zdania: co czytelnik sie dowie i jaka ma korzysc]",
  "content": "[pelny artykul w Markdown]",
  "tags": ["[tag1]", "[tag2]", "[tag3]", "[tag4]"],
  "image_prompt": "[prompt do okladki po angielsku: konkretna ilustracja bez tekstu, styl editorial magazine, nowoczesny minimalizm]"
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
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_OBRAZU}:generateContent?key=${GOOGLE_API_KEY}`,
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

console.log('📚 Krok 1/6: Pobieranie istniejących artykułów i usług...')
const { topics: existingTopics, services: serviceSlugs } = await getExistingTopics()
console.log(`✅ Artykułów: ${existingTopics.length}, usług: ${serviceSlugs.length}\n`)

console.log('📋 Krok 2/6: Wybór tematu z planu treści...')
const temat = pierwszyWolnyTemat(tematyZPlanu(PLAN_TRESCI), existingTopics)

if (temat === null) {
  // Świadomie nie wymyślamy tematu. Wyczerpanie listy to sygnał dla właściciela,
  // że pora dopisać kolejne, a nie powód do improwizacji.
  console.log('📋 Wszystkie tematy z planu treści są wykorzystane.')
  console.log('   Dopisz kolejne w docs/seo/plan-tresci.md i uruchom ponownie.')
  process.exit(0)
}

console.log(`✅ Temat ${temat.numer}: ${temat.temat}`)
console.log(`   Fraza: "${temat.fraza}" (${temat.wolumen}/mies., intencja: ${temat.intencja})\n`)

console.log('🤖 Krok 3/6: Generowanie artykułu (Gemini)...')
const article = await generateArticle(temat, existingTopics, serviceSlugs)
console.log(`✅ Artykuł: "${article.title}"`)
console.log(`   Slug: ${article.slug}\n`)

console.log('🔍 Krok 4/6: Bramka jakości...')
const wynikBramki = sprawdzArtykul(
  {
    title: article.title,
    slug: article.slug,
    targetKeyword: temat.fraza,
    content: article.content,
  },
  { istniejace: existingTopics, uslugi: serviceSlugs }
)

if (wynikBramki.przechodzi) {
  console.log('✅ Bramka przeszła')
} else {
  console.log(`⚠ Bramka odrzuciła artykuł (${wynikBramki.braki.length}):`)
  wynikBramki.braki.forEach(brak => console.log(`   - ${brak}`))
}
wynikBramki.uwagi.forEach(uwaga => console.log(`   ℹ ${uwaga}`))
console.log('')

console.log('🎨 Krok 5/6: Generowanie okładki (Gemini)...')
const base64Image = await generateCoverImage(article.image_prompt)
console.log('✅ Okładka wygenerowana\n')

const coverUrl = await uploadToImgBB(base64Image)
console.log(`✅ Okładka: ${coverUrl}\n`)

console.log('🚀 Krok 6/6: Wysyłka do publikacji...')
const result = await publishPost({
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt ?? '',
  content: article.content,
  cover_image: coverUrl,
  tags: article.tags ?? [],
  author: 'Zautomatyzujemy.pl',
  ai_generated: true,
  ai_model: MODEL_TEKSTU,
  target_keyword: temat.fraza,
  quality_gate_passed: wynikBramki.przechodzi,
  quality_gate_issues: wynikBramki.braki,
})
console.log(
  result.published
    ? `✅ Opublikowano: ${SITE_URL}${result.url}`
    : `📝 Zapisano szkic do zatwierdzenia: ${SITE_URL}/admin/blog`
)
