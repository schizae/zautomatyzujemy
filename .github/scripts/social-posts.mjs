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

STANDARD PISARSKI BLOGA — obowiazuje tylko w zakresie wskazanym w pliku tematow powyzej:

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
    ...(zrodlo ? [`**Opis z RSS (tekst źródła):** ${zrodlo.description || 'brak opisu w kanale'}`] : []),
    `**Streszczenie według modelu — sprawdź ze źródłem:** ${propozycja.streszczenie_zrodla ?? 'brak'}`,
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
const { propozycje } = await zapytajGemini({
  prompt: zbudujPrompt(kandydaci, liczba),
  model: MODEL_TEKSTU,
  klucz: GOOGLE_API_KEY,
  limitMs: 90000,
})
// Pusty mail „0 z 0” przy zielonym workflow ukryłby awarię — lepiej, żeby bieg padł.
if (!Array.isArray(propozycje) || propozycje.length === 0) {
  throw new Error('Model nie zwrócił propozycji — przerywam.')
}
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
