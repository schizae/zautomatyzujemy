import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

// Moduł jest czysty — bez Reacta, bez bazy, bez sieci — więc wystarczy
// stranspilować go do CommonJS i wykonać.
const source = readFileSync(new URL('../lib/ai-disclosure.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

// Świadomie `new Function`, a nie `vm.runInNewContext` jak w sąsiednim
// `voice-context.test.mjs`: nowy kontekst ma własny `Object.prototype`, więc
// `assert.deepEqual` ze `node:assert/strict` odrzucałby obiekty zwracane przez
// moduł mimo identycznej zawartości.
const moduleExports = {}
const load = new Function('exports', 'module', compiled)
load(moduleExports, { exports: moduleExports })

const { buildDisclosureText, resolvePublishState, TRAINED_ALGORITHMIC_MEDIA } = moduleExports

// ─── Adnotacja ────────────────────────────────────────────────────────────────

test('wpis napisany przez człowieka nie dostaje adnotacji', () => {
  assert.equal(buildDisclosureText(false, null), null)
})

test('wpis zatwierdzony redakcyjnie deklaruje sprawdzenie wraz z datą', () => {
  const text = buildDisclosureText(true, '2026-09-08T10:15:00.000Z')
  assert.equal(
    text,
    'Tekst przygotowany przez redaktora AI Zautomatyzujemy.pl, sprawdzony przed publikacją 8 września 2026.'
  )
})

test('wpis opublikowany automatycznie nie deklaruje sprawdzenia', () => {
  const text = buildDisclosureText(true, null)
  assert.equal(
    text,
    'Tekst przygotowany przez redaktora AI Zautomatyzujemy.pl, publikowany automatycznie.'
  )
  // Sedno całego mechanizmu: zdanie o weryfikacji pod tekstem, którego nikt
  // nie czytał, podważa zwolnienie, na którym opieramy zgodność.
  assert.ok(!text.includes('sprawdzony'))
})

test('data zatwierdzenia nie zdradza godziny ani strefy', () => {
  const text = buildDisclosureText(true, '2026-01-03T23:45:00.000Z')
  assert.ok(text.includes('stycznia 2026'))
  assert.ok(!text.includes(':'))
})

// ─── Stan publikacji ──────────────────────────────────────────────────────────

const NOW = '2026-09-09T12:00:00.000Z'

test('tryb automatyczny publikuje od razu, tak jak dzisiaj', () => {
  assert.deepEqual(resolvePublishState('auto', NOW, null, null), {
    is_published: true,
    published_at: NOW,
    reviewed_at: null,
  })
})

test('tryb automatyczny szanuje datę publikacji z payloadu', () => {
  const state = resolvePublishState('auto', NOW, '2026-09-01T08:00:00.000Z', null)
  assert.equal(state.published_at, '2026-09-01T08:00:00.000Z')
})

test('tryb redakcyjny zatrzymuje wpis jako szkic', () => {
  assert.deepEqual(resolvePublishState('review', NOW, null, null), {
    is_published: false,
    published_at: null,
    reviewed_at: null,
  })
})

test('tryb redakcyjny ignoruje datę publikacji z payloadu', () => {
  const state = resolvePublishState('review', NOW, '2026-09-01T08:00:00.000Z', null)
  assert.equal(state.is_published, false)
  assert.equal(state.published_at, null)
})

test('ponowienie żądania nie cofa decyzji redaktora', () => {
  const zatwierdzony = {
    is_published: true,
    published_at: '2026-09-05T09:00:00.000Z',
    reviewed_at: '2026-09-05T08:55:00.000Z',
  }
  // Generator ponawia żądanie, panel stoi w trybie redakcyjnym. Bez tej gałęzi
  // zatwierdzony artykuł zniknąłby ze strony.
  assert.deepEqual(resolvePublishState('review', NOW, null, zatwierdzony), zatwierdzony)
})

test('ponowienie żądania na niezatwierdzonym szkicu zostawia go szkicem', () => {
  const szkic = { is_published: false, published_at: null, reviewed_at: null }
  assert.deepEqual(resolvePublishState('review', NOW, null, szkic), {
    is_published: false,
    published_at: null,
    reviewed_at: null,
  })
})

// ─── Znacznik schema.org ──────────────────────────────────────────────────────

test('stała wskazuje człon wyliczenia schema.org, nie surowy URI IPTC', () => {
  assert.equal(
    TRAINED_ALGORITHMIC_MEDIA,
    'https://schema.org/TrainedAlgorithmicMediaDigitalSource'
  )
})
