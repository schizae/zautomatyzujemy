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

/** Kanały RSS podają encje HTML w tekście (&#8217;, &amp;), a mail escapuje je drugi raz. */
function dekodujEncje(tekst) {
  return tekst
    .replace(/&#(\d+);/g, (_, kod) => String.fromCodePoint(Number(kod)))
    .replace(/&#x([0-9a-f]+);/gi, (_, kod) => String.fromCodePoint(parseInt(kod, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
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
        // Materiał bez daty albo z datą nie do odczytania zostaje, ale bez udawanej daty.
        // NaN < liczba daje false, więc nie odpada. Dawniej nieczytelna data wywracała cały kanał.
        const pubDate = pubDateStr ? Date.parse(pubDateStr) : NaN
        if (pubDate < odKiedy) continue

        const title = dekodujEncje(extractField(item, 'title'))
        if (!title) continue

        const rawDesc =
          extractField(item, 'description') ||
          extractField(item, 'summary') ||
          extractField(item, 'content')
        // Najpierw znaczniki, potem encje — inaczej &lt;b&gt; z tekstu zniknąłby jak znacznik.
        const desc = dekodujEncje(rawDesc.replace(/<[^>]+>/g, ''))
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
