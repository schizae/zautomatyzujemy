import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

// Moduł jest czysty — bez importów, bez sieci — więc wystarczy stranspilować
// go do CommonJS i wykonać, tak samo jak w ai-disclosure.test.mjs.
const source = readFileSync(new URL('../lib/attribution.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

const moduleExports = {}
const load = new Function('exports', 'module', compiled)
load(moduleExports, { exports: moduleExports })

const { classifySource, normalizeAttribution } = moduleExports

// ─── Klasyfikacja źródła ──────────────────────────────────────────────────────

test('brak referrera i kampanii to wejście bezpośrednie', () => {
  assert.equal(classifySource(null, null), 'direct')
})

test('pusty referrer jest traktowany jak jego brak', () => {
  assert.equal(classifySource('   ', null), 'direct')
})

test('wyszukiwarka daje źródło organiczne', () => {
  assert.equal(classifySource('https://www.google.com/', null), 'organic')
  assert.equal(classifySource('https://duckduckgo.com/?q=automatyzacja', null), 'organic')
})

test('serwisy społecznościowe dają źródło społecznościowe', () => {
  assert.equal(classifySource('https://www.linkedin.com/feed/', null), 'social')
  assert.equal(classifySource('https://lnkd.in/abc', null), 'social')
  assert.equal(classifySource('https://m.facebook.com/', null), 'social')
})

test('obca witryna to odesłanie', () => {
  assert.equal(classifySource('https://n8n.io/creators/', null), 'referral')
})

test('domena zawierająca podciąg skrótowca nie jest myląco klasyfikowana', () => {
  // `t.co` i `x.com` są na tyle krótkie, że dopasowanie po fragmencie trafiało
  // w pospolite domeny biznesowe. Klasyfikacja idzie po etykietach hosta.
  assert.equal(classifySource('https://kontakt.com/oferta', null), 'referral')
  assert.equal(classifySource('https://start.com/', null), 'referral')
  assert.equal(classifySource('https://box.com/share', null), 'referral')
  assert.equal(classifySource('https://netflix.com/', null), 'referral')
})

test('domena zawierająca nazwę wyszukiwarki jako fragment nie jest organiczna', () => {
  assert.equal(classifySource('https://notgoogle.com/', null), 'referral')
  assert.equal(classifySource('https://bingo.pl/', null), 'referral')
})

test('krajowe warianty wyszukiwarek są rozpoznawane', () => {
  assert.equal(classifySource('https://www.google.pl/search?q=n8n', null), 'organic')
  assert.equal(classifySource('https://www.google.co.uk/', null), 'organic')
})

test('poddomeny usług Google nie są wynikiem wyszukiwania', () => {
  // Tak wygląda referrer po kliknięciu linku w Gmailu — to odesłanie z poczty,
  // nie wejście z wyników wyszukiwania.
  assert.equal(classifySource('https://mail.google.com/mail/u/0/', null), 'referral')
  assert.equal(classifySource('https://drive.google.com/file/d/1', null), 'referral')
})

test('wyszukiwarka pod poddomeną search jest rozpoznawana', () => {
  assert.equal(classifySource('https://search.brave.com/search?q=n8n', null), 'organic')
})

test('skrótowce serwisów społecznościowych nadal działają', () => {
  assert.equal(classifySource('https://lnkd.in/abc', null), 'social')
  assert.equal(classifySource('https://x.com/ktos/status/1', null), 'social')
  assert.equal(classifySource('https://t.co/abc123', null), 'social')
})

test('wejście z własnej domeny jest oznaczone jako wewnętrzne', () => {
  assert.equal(classifySource('https://www.zautomatyzujemy.pl/blog', null), 'internal')
  assert.equal(classifySource('http://localhost:3000/blog', null), 'internal')
})

test('utm_source wygrywa z referrerem', () => {
  assert.equal(classifySource('https://www.google.com/', 'newsletter'), 'campaign')
})

test('nieparsowalny referrer nie wywraca klasyfikacji', () => {
  assert.equal(classifySource('to nie jest adres', null), 'direct')
})

// ─── Normalizacja ─────────────────────────────────────────────────────────────

test('normalizacja przycina wartości do 500 znaków', () => {
  const result = normalizeAttribution({
    referrer: `https://example.com/${'a'.repeat(600)}`,
    landingPath: '/blog',
    utmSource: null,
  })
  assert.equal(result.referrer.length, 500)
})

test('ścieżka wejścia bez ukośnika jest odrzucana', () => {
  const result = normalizeAttribution({
    referrer: null,
    landingPath: 'blog/artykul',
    utmSource: null,
  })
  assert.equal(result.landingPath, null)
})

test('normalizacja zwraca komplet pól także dla pustego wejścia', () => {
  const result = normalizeAttribution({ referrer: null, landingPath: null, utmSource: null })
  assert.deepEqual(result, {
    referrer: null,
    landingPath: null,
    utmSource: null,
    sourceKind: 'direct',
  })
})

test('normalizacja przyjmuje wejście niepełne i nie rzuca', () => {
  const result = normalizeAttribution({})
  assert.equal(result.sourceKind, 'direct')
  assert.equal(result.landingPath, null)
})
