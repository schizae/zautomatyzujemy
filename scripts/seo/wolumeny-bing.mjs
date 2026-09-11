/**
 * Pobiera miesięczne wyświetlenia fraz z Bing Webmaster Tools.
 *
 * Uwaga o interpretacji: to są wyświetlenia w Bingu, a nie wolumen wyszukiwań w Google.
 * Bing ma w Polsce kilkuprocentowy udział, więc liczby traktujemy jako wskaźnik skali
 * i kolejności, a nie jako prognozę ruchu. Do porównań między frazami wystarczy,
 * do obiecywania komukolwiek liczby wejść już nie.
 *
 * Klucz czytamy ze zmiennej środowiskowej. Repozytorium jest publiczne.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const API_KEY = process.env['BING_WEBMASTER_API_KEY']

if (!API_KEY) {
  console.error('Brak zmiennej BING_WEBMASTER_API_KEY.')
  process.exit(1)
}

const WEJSCIE = 'data/seo/suggest-raw.json'
const WYJSCIE = 'data/seo/bing-volumes.json'
const PRZERWA_MS = 400

function spij(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function wyswietlenia(fraza) {
  const url =
    'https://ssl.bing.com/webmaster/api.svc/json/GetKeywordStats' +
    `?q=${encodeURIComponent(fraza)}&country=pl&language=pl-PL&apikey=${API_KEY}`

  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) return null

  const dane = await res.json()
  const miesiace = Array.isArray(dane.d) ? dane.d : []
  if (miesiace.length === 0) return null

  const suma = miesiace.reduce((acc, m) => acc + (m.Impressions ?? 0), 0)
  return {
    miesiecy: miesiace.length,
    sredniaMiesieczna: Math.round(suma / miesiace.length),
    ostatnieTrzy: miesiace.slice(-3).map(m => m.Impressions ?? 0),
  }
}

const frazy = JSON.parse(readFileSync(WEJSCIE, 'utf8')).map(wpis => wpis.fraza)
const wynik = []
let zDanymi = 0

for (const [index, fraza] of frazy.entries()) {
  const dane = await wyswietlenia(fraza).catch(() => null)
  if (dane !== null) {
    wynik.push({ fraza, ...dane })
    zDanymi += 1
  }
  if ((index + 1) % 20 === 0) {
    process.stdout.write(`${index + 1}/${frazy.length}, z danymi: ${zDanymi}\n`)
  }
  await spij(PRZERWA_MS)
}

wynik.sort((a, b) => b.sredniaMiesieczna - a.sredniaMiesieczna)
writeFileSync(WYJSCIE, JSON.stringify(wynik, null, 2), 'utf8')

process.stdout.write(
  `\nSprawdzono ${frazy.length} fraz, dane ma ${zDanymi}. Zapisano do ${WYJSCIE}\n`
)
