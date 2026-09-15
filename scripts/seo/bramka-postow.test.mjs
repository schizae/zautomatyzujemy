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
  assert.ok(sprawdzPost(dlugi, kontekst()).braki.some(b => b.startsWith('Wersja na LinkedIn ma')))

  const bezPytania = { ...dobryPost(), linkedin: 'Producent wydał model.\n\nTo tyle.' }
  assert.ok(sprawdzPost(bezPytania, kontekst()).braki.includes('Wersja na LinkedIn nie kończy się pytaniem'))

  const post = dobryPost()
  const dluzszyFb = { ...post, facebook: `${post.linkedin} Dodatek?` }
  assert.ok(
    sprawdzPost(dluzszyFb, kontekst()).braki.includes('Wersja na Facebooka nie jest krótsza od wersji na LinkedIn')
  )
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
