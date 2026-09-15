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
  assert.ok(sprawdzPost(dlugi, kontekst()).braki.includes('Wersja na LinkedIn ma 1301 znaków, limit 1300'))

  const bezPytania = { ...dobryPost(), linkedin: 'Producent wydał model.\n\nTo tyle.' }
  assert.ok(sprawdzPost(bezPytania, kontekst()).braki.includes('Wersja na LinkedIn nie kończy się pytaniem'))

  const post = dobryPost()
  const dluzszyFb = { ...post, facebook: `${post.linkedin} Dodatek?` }
  assert.ok(
    sprawdzPost(dluzszyFb, kontekst()).braki.includes('Wersja na Facebooka nie jest krótsza od wersji na LinkedIn')
  )
})

test('pytanie zakończone hashtagami w tej samej lub następnej linii przechodzi', () => {
  const jednaLinia = { ...dobryPost(), linkedin: 'Sprawdzaliście już odczyt faktur z AI u siebie? #AI' }
  assert.ok(!sprawdzPost(jednaLinia, kontekst()).braki.includes('Wersja na LinkedIn nie kończy się pytaniem'))

  const nastepnaLinia = { ...dobryPost(), linkedin: 'Sprawdzaliście już odczyt faktur z AI u siebie?\n#AI #faktury' }
  assert.ok(!sprawdzPost(nastepnaLinia, kontekst()).braki.includes('Wersja na LinkedIn nie kończy się pytaniem'))
})

test('limit hashtagów: dokładnie 3 przechodzi, 4 daje brak', () => {
  const trzy = { ...dobryPost(), linkedin: 'Pytanie testowe, prawda?\n\n#a #b #c' }
  assert.ok(!sprawdzPost(trzy, kontekst()).braki.includes('Wersja na LinkedIn ma więcej niż 3 hashtagi'))

  const cztery = { ...dobryPost(), linkedin: 'Pytanie testowe, prawda?\n\n#a #b #c #d' }
  assert.ok(sprawdzPost(cztery, kontekst()).braki.includes('Wersja na LinkedIn ma więcej niż 3 hashtagi'))
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

test('cyfry w ramce i flagi liczą się jako emoji, polskie cudzysłowy i myślnik nie', () => {
  const post = dobryPost()

  const cyfraWRamce = { ...post, linkedin: `${post.linkedin} 1️⃣` }
  assert.ok(sprawdzPost(cyfraWRamce, kontekst()).braki.includes('Emoji w wersji na LinkedIn'))

  const flaga = { ...post, linkedin: `${post.linkedin} 🇵🇱` }
  assert.ok(sprawdzPost(flaga, kontekst()).braki.includes('Emoji w wersji na LinkedIn'))

  const cudzyslowyIMyslnik = { ...post, linkedin: `${post.linkedin} „ważne” — naprawdę?` }
  assert.ok(!sprawdzPost(cudzyslowyIMyslnik, kontekst()).braki.includes('Emoji w wersji na LinkedIn'))
})

test('czarna lista łapie zwrot rozdzielony twardą spacją', () => {
  const post = dobryPost()
  const zTwardaSpacja = { ...post, linkedin: `${post.linkedin} To jest w\u00A0erze cyfrowej.` }
  assert.ok(
    sprawdzPost(zTwardaSpacja, kontekst()).braki.some(b => b.startsWith('Zwrot z czarnej listy w wersji na LinkedIn'))
  )
})

test('pusty klucz w wykorzystane nie daje fałszywego trafienia dla błędnego adresu', () => {
  const ctx = { zrodla, wykorzystane: new Set(['']) }
  const post = { ...dobryPost(), zrodlo_url: 'to nie adres' }
  assert.ok(!sprawdzPost(post, ctx).braki.includes('To samo źródło co w innej propozycji'))
})

test('liczby obecne w opisie źródła nie dają braku liczb spoza źródła', () => {
  const zrodloZOpisem = {
    ...zrodla[0],
    description: 'Badanie: 89 procent pilotaży kończy się porażką w 2025 roku.',
  }
  const ctx = { zrodla: [zrodloZOpisem, zrodla[1]], wykorzystane: new Set() }
  const post = {
    ...dobryPost(),
    linkedin: 'Badanie pokazuje: 89 procent pilotaży kończy się porażką w 2025 roku. Sprawdzaliście już to u siebie?',
  }
  assert.ok(!sprawdzPost(post, ctx).braki.some(b => b.startsWith('Liczby spoza źródła')))
})

test('liczby spoza źródła w wersji na LinkedIn dają brak z listą liczb', () => {
  const post = {
    ...dobryPost(),
    linkedin: 'Oszczędzasz od 15 do 30 minut na każdej rozmowie. Sprawdzaliście już to u siebie?',
  }
  assert.ok(
    sprawdzPost(post, kontekst()).braki.includes('Liczby spoza źródła w wersji na LinkedIn: 15, 30 — potwierdź albo usuń')
  )
})

test('ta sama liczba powtórzona w poście pojawia się w komunikacie raz', () => {
  const post = {
    ...dobryPost(),
    linkedin: 'Zaoszczędzisz 15 minut, może nawet więcej niż 15 minut. Sprawdzaliście już to u siebie?',
  }
  assert.ok(
    sprawdzPost(post, kontekst()).braki.includes('Liczby spoza źródła w wersji na LinkedIn: 15 — potwierdź albo usuń')
  )
})

test('liczba z tytułu źródła (nie z opisu) nie daje braku', () => {
  const zrodloZLiczbaWTytule = { ...zrodla[0], title: 'Model radzi sobie z 128 tysiącami tokenów' }
  const ctx = { zrodla: [zrodloZLiczbaWTytule, zrodla[1]], wykorzystane: new Set() }
  const post = {
    ...dobryPost(),
    linkedin: 'Nowy model obsługuje 128 tysięcy tokenów w jednym zapytaniu. Sprawdzaliście już to u siebie?',
  }
  assert.ok(!sprawdzPost(post, ctx).braki.some(b => b.startsWith('Liczby spoza źródła')))
})

test('post bez znalezionego źródła nie dostaje braku liczb, tylko braku źródła', () => {
  const post = {
    ...dobryPost(),
    zrodlo_url: 'https://inna.pl/wymyslone',
    linkedin: 'Zaoszczędzisz 99 procent czasu. Sprawdzaliście już to u siebie?',
  }
  const { braki } = sprawdzPost(post, kontekst())
  assert.ok(braki.includes('Źródło spoza zebranych materiałów'))
  assert.ok(!braki.some(b => b.startsWith('Liczby spoza źródła')))
})

test('cyfry wewnątrz słów (n8n, gpt4) nie liczą się jako liczby', () => {
  const post = {
    ...dobryPost(),
    linkedin: 'Prosty przepływ w n8n obsłuży to lepiej niż gpt4 w tym zadaniu. Sprawdzaliście już to u siebie?',
  }
  assert.ok(!sprawdzPost(post, kontekst()).braki.some(b => b.startsWith('Liczby spoza źródła')))
})

test('"model 8B": liczba po literze jest liczbą — brak gdy źródło jej nie ma', () => {
  const post = {
    ...dobryPost(),
    linkedin: 'Ten model 8B poradzi sobie z tym zadaniem lepiej. Sprawdzaliście już to u siebie?',
  }
  assert.ok(
    sprawdzPost(post, kontekst()).braki.includes('Liczby spoza źródła w wersji na LinkedIn: 8 — potwierdź albo usuń')
  )
})

test('"model 8B": brak znika, gdy źródło ma ten sam rozmiar modelu', () => {
  const zrodloZOpisem = { ...zrodla[0], description: 'Model dostępny w wariancie 8B parameters.' }
  const ctx = { zrodla: [zrodloZOpisem, zrodla[1]], wykorzystane: new Set() }
  const post = {
    ...dobryPost(),
    linkedin: 'Ten model 8B poradzi sobie z tym zadaniem lepiej. Sprawdzaliście już to u siebie?',
  }
  assert.ok(!sprawdzPost(post, ctx).braki.some(b => b.startsWith('Liczby spoza źródła')))
})

test('skróty z jednostką po liczbie ("4h", "15min") dają brak, gdy źródło ich nie ma', () => {
  const post = {
    ...dobryPost(),
    linkedin: 'Proces skrócił się z 4h do 15min dzięki automatyzacji. Sprawdzaliście już to u siebie?',
  }
  assert.ok(
    sprawdzPost(post, kontekst()).braki.includes('Liczby spoza źródła w wersji na LinkedIn: 4, 15 — potwierdź albo usuń')
  )
})

test('skrót z jednostką ("128K") w źródle pokrywa zwykły zapis liczby w poście', () => {
  const zrodloZOpisem = { ...zrodla[0], description: 'Nowy model obsługuje kontekst 128K tokens.' }
  const ctx = { zrodla: [zrodloZOpisem, zrodla[1]], wykorzystane: new Set() }
  const post = {
    ...dobryPost(),
    linkedin: 'Nowy model obsługuje 128 tysięcy tokenów naraz. Sprawdzaliście już to u siebie?',
  }
  assert.ok(!sprawdzPost(post, ctx).braki.some(b => b.startsWith('Liczby spoza źródła')))
})

test('procent zapisany znakiem ("89%") pokrywa procent zapisany słownie w źródle', () => {
  const zrodloZOpisem = { ...zrodla[0], description: 'Badanie pokazuje, że 89 percent firm testuje agentów.' }
  const ctx = { zrodla: [zrodloZOpisem, zrodla[1]], wykorzystane: new Set() }
  const post = {
    ...dobryPost(),
    linkedin: 'Aż 89% firm testuje dziś agentów AI. Sprawdzaliście już to u siebie?',
  }
  assert.ok(!sprawdzPost(post, ctx).braki.some(b => b.startsWith('Liczby spoza źródła')))
})

test('procent zapisany znakiem ("89%") daje brak, gdy źródło go nie ma', () => {
  const post = {
    ...dobryPost(),
    linkedin: 'Aż 89% firm testuje dziś agentów AI. Sprawdzaliście już to u siebie?',
  }
  assert.ok(
    sprawdzPost(post, kontekst()).braki.includes('Liczby spoza źródła w wersji na LinkedIn: 89 — potwierdź albo usuń')
  )
})

test('zakres z półpauzą ("15–30 minut") daje brak z obiema liczbami', () => {
  const post = {
    ...dobryPost(),
    linkedin: 'Oszczędzasz 15–30 minut na każdej rozmowie. Sprawdzaliście już to u siebie?',
  }
  assert.ok(
    sprawdzPost(post, kontekst()).braki.includes('Liczby spoza źródła w wersji na LinkedIn: 15, 30 — potwierdź albo usuń')
  )
})

test('liczba spoza źródła tylko w wersji na Facebooka daje brak tylko dla tej wersji', () => {
  const post = { ...dobryPost(), facebook: 'Nowy model czyta dłuższe dokumenty. Zaoszczędzisz 45 minut na pracy.' }
  const { braki } = sprawdzPost(post, kontekst())
  assert.ok(braki.includes('Liczby spoza źródła w wersji na Facebooka: 45 — potwierdź albo usuń'))
  assert.ok(!braki.some(b => b.startsWith('Liczby spoza źródła w wersji na LinkedIn')))
})

test('pusty temat daje brak', () => {
  const post = { ...dobryPost(), temat: '   ' }
  assert.ok(sprawdzPost(post, kontekst()).braki.includes('Brak tematu'))
})

test('separatory tysięcy: zwykła spacja, twarda spacja i przecinek to ta sama liczba', () => {
  const zrodloZOpisem = { ...zrodla[0], description: 'Aplikacja ma 400,000 users miesięcznie.' }
  const ctx = { zrodla: [zrodloZOpisem, zrodla[1]], wykorzystane: new Set() }

  const zwyklaSpacja = {
    ...dobryPost(),
    linkedin: 'Aplikacja ma 400 000 użytkowników miesięcznie. Sprawdzaliście już to u siebie?',
  }
  assert.ok(!sprawdzPost(zwyklaSpacja, ctx).braki.some(b => b.startsWith('Liczby spoza źródła')))

  const twardaSpacja = {
    ...dobryPost(),
    linkedin: `Aplikacja ma 400\u00A0000 użytkowników miesięcznie. Sprawdzaliście już to u siebie?`,
  }
  assert.ok(!sprawdzPost(twardaSpacja, ctx).braki.some(b => b.startsWith('Liczby spoza źródła')))
})

test('liczba z częścią dziesiętną spoza źródła daje brak', () => {
  const post = {
    ...dobryPost(),
    linkedin: 'Proces trwa 2,5 godziny zamiast całego dnia. Sprawdzaliście już to u siebie?',
  }
  assert.ok(
    sprawdzPost(post, kontekst()).braki.includes('Liczby spoza źródła w wersji na LinkedIn: 2,5 — potwierdź albo usuń')
  )
})
