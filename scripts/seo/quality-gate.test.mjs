import assert from 'node:assert/strict'
import test from 'node:test'
import { sprawdzArtykul } from './quality-gate.mjs'

const POPRAWNY = {
  title: 'Jak stworzyć agenta AI dla firmy',
  slug: 'jak-stworzyc-agenta-ai',
  targetKeyword: 'jak stworzyć agenta ai',
  content: [
    'Jak stworzyć agenta ai? Potrzebujesz modelu, narzędzia do przepływów i jednego procesu.',
    'Poniżej pokazuję, jak zrobić to w n8n w cztery kroki.',
    '',
    '## Krok pierwszy',
    'Zobacz [automatyzację procesów](/uslugi/automatyzacja-procesow-biznesowych).',
    'Więcej w [szkoleniach z AI](/uslugi/szkolenia-z-ai-dla-zespolow).',
    'Opisywałem to w [artykule o n8n](/blog/n8n-jak-zaczac).',
    'Dokumentacja: [n8n docs](https://docs.n8n.io) oraz [OpenAI](https://platform.openai.com).',
  ].join('\n'),
}

const ISTNIEJACE = [{ slug: 'n8n-jak-zaczac', title: 'n8n od czego zacząć' }]
const USLUGI = ['automatyzacja-procesow-biznesowych', 'szkolenia-z-ai-dla-zespolow']
const KONTEKST = { istniejace: ISTNIEJACE, uslugi: USLUGI }

test('poprawny artykuł przechodzi wszystkie bramki', () => {
  const wynik = sprawdzArtykul(POPRAWNY, KONTEKST)
  assert.equal(wynik.przechodzi, true)
  assert.deepEqual(wynik.braki, [])
})

test('powtórzony slug jest odrzucany', () => {
  const wynik = sprawdzArtykul({ ...POPRAWNY, slug: 'n8n-jak-zaczac' }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('slug')))
})

test('powtórzony tytuł jest odrzucany', () => {
  const wynik = sprawdzArtykul({ ...POPRAWNY, title: 'n8n od czego zacząć' }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('tytuł')))
})

test('brak frazy docelowej w tytule jest odrzucany', () => {
  const wynik = sprawdzArtykul({ ...POPRAWNY, title: 'Coś zupełnie innego' }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('tytule')))
})

test('brak frazy docelowej w pierwszym akapicie jest odrzucany', () => {
  const bezFrazy = POPRAWNY.content.replace(
    'Jak stworzyć agenta ai? Potrzebujesz modelu, narzędzia do przepływów i jednego procesu.',
    'Potrzebujesz modelu, narzędzia do przepływów i jednego procesu.'
  )
  const wynik = sprawdzArtykul({ ...POPRAWNY, content: bezFrazy }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('pierwszym akapicie')))
})

test('mniej niż dwa źródła zewnętrzne są odrzucane', () => {
  const bezZrodel = POPRAWNY.content.replace(
    'Dokumentacja: [n8n docs](https://docs.n8n.io) oraz [OpenAI](https://platform.openai.com).',
    ''
  )
  const wynik = sprawdzArtykul({ ...POPRAWNY, content: bezZrodel }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('źródeł')))
})

test('link do nieistniejącej usługi jest odrzucany', () => {
  const zlyLink = POPRAWNY.content.replace(
    '/uslugi/szkolenia-z-ai-dla-zespolow',
    '/uslugi/usluga-ktora-nie-istnieje'
  )
  const wynik = sprawdzArtykul({ ...POPRAWNY, content: zlyLink }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('nie istnieje')))
})

test('link do nieistniejącego artykułu jest odrzucany', () => {
  const zlyLink = POPRAWNY.content.replace('/blog/n8n-jak-zaczac', '/blog/nie-ma-takiego')
  const wynik = sprawdzArtykul({ ...POPRAWNY, content: zlyLink }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('nie istnieje')))
})

test('brak linku do innego artykułu jest odrzucany', () => {
  const bezLinku = POPRAWNY.content.replace(
    'Opisywałem to w [artykule o n8n](/blog/n8n-jak-zaczac).',
    ''
  )
  const wynik = sprawdzArtykul({ ...POPRAWNY, content: bezLinku }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('artykuł')))
})

test('jeden link usługowy zamiast dwóch daje uwagę, nie odrzucenie', () => {
  const jedenLink = POPRAWNY.content.replace(
    'Więcej w [szkoleniach z AI](/uslugi/szkolenia-z-ai-dla-zespolow).',
    ''
  )
  const wynik = sprawdzArtykul({ ...POPRAWNY, content: jedenLink }, KONTEKST)
  assert.equal(wynik.przechodzi, true)
  assert.ok(wynik.uwagi.some(u => u.includes('usług')))
})

test('zwrot z czarnej listy jest odrzucany', () => {
  const zWytrychem = POPRAWNY.content.replace(
    'Poniżej pokazuję',
    'W dzisiejszym dynamicznym świecie pokazuję'
  )
  const wynik = sprawdzArtykul({ ...POPRAWNY, content: zWytrychem }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('czarnej listy')))
})

test('czarna lista działa niezależnie od wielkości liter', () => {
  const zWytrychem = POPRAWNY.content.replace('Poniżej', 'Game Changer. Poniżej')
  const wynik = sprawdzArtykul({ ...POPRAWNY, content: zWytrychem }, KONTEKST)
  assert.equal(wynik.przechodzi, false)
})

test('pozostawiony znacznik wstawki jest odrzucany', () => {
  const wynik = sprawdzArtykul(
    { ...POPRAWNY, content: `${POPRAWNY.content}\n<!-- WSTAWKA -->` },
    KONTEKST
  )
  assert.equal(wynik.przechodzi, false)
  assert.ok(wynik.braki.some(b => b.includes('wstawk')))
})

test('brak frazy docelowej nie wywraca sprawdzenia', () => {
  const wynik = sprawdzArtykul({ ...POPRAWNY, targetKeyword: '' }, KONTEKST)
  assert.equal(typeof wynik.przechodzi, 'boolean')
})
