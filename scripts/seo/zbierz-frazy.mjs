/**
 * Zbiera podpowiedzi wyszukiwania z publicznego endpointu Google Suggest.
 * Darmowe źródło fraz, bez wolumenu — wolumen dołoży właściciel z Bing WMT.
 * Tempo: jedno zapytanie na sekundę, żeby nie dostać blokady.
 */
import { writeFileSync } from 'node:fs'

const ZIARNA = [
  'automatyzacja procesów',
  'automatyzacja procesów biznesowych',
  'wdrożenie AI w firmie',
  'sztuczna inteligencja w firmie',
  'chatbot dla firmy',
  'chatbot AI',
  'asystent AI dla firmy',
  'voicebot',
  'automatyzacja n8n',
  'n8n',
  'integracja systemów firmy',
  'automatyzacja faktur',
  'OCR faktur',
  'automatyzacja dokumentów',
  'audyt AI w firmie',
  'szkolenie AI dla firm',
  'zgodność z AI Act',
  'automatyzacja obsługi klienta',
  'baza wiedzy AI',
  'agent AI dla firmy',
]

const MODYFIKATORY = ['', ' cena', ' ile kosztuje', ' jak', ' dla firm', ' chojnice', ' pomorskie']

function spij(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function podpowiedzi(fraza) {
  const url =
    'https://suggestqueries.google.com/complete/search' +
    `?client=firefox&hl=pl&gl=pl&ie=utf-8&oe=utf-8&q=${encodeURIComponent(fraza)}`

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) return []

  const tekst = await res.text()
  const dane = JSON.parse(tekst)
  return Array.isArray(dane[1]) ? dane[1] : []
}

const wynik = new Map()
let zapytan = 0

for (const ziarno of ZIARNA) {
  for (const modyfikator of MODYFIKATORY) {
    const fraza = `${ziarno}${modyfikator}`
    try {
      const lista = await podpowiedzi(fraza)
      zapytan += 1
      for (const podpowiedz of lista) {
        const klucz = podpowiedz.toLowerCase().trim()
        if (!wynik.has(klucz)) wynik.set(klucz, { fraza: klucz, ziarna: [] })
        const wpis = wynik.get(klucz)
        if (!wpis.ziarna.includes(ziarno)) wpis.ziarna.push(ziarno)
      }
      process.stdout.write(`${zapytan} ${fraza} -> ${lista.length}\n`)
    } catch (err) {
      process.stdout.write(`${zapytan} ${fraza} -> BLAD ${err.message}\n`)
    }
    await spij(1000)
  }
}

const posortowane = [...wynik.values()].sort((a, b) => a.fraza.localeCompare(b.fraza, 'pl'))
writeFileSync('data/seo/suggest-raw.json', JSON.stringify(posortowane, null, 2), 'utf8')
process.stdout.write(`\nZebrano ${posortowane.length} unikalnych fraz z ${zapytan} zapytan\n`)
