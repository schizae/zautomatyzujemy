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
