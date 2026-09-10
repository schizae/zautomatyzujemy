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
