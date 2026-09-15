import test from 'node:test'
import assert from 'node:assert/strict'
import { promptArtykulu } from './prompt-artykulu.mjs'
import { ZNACZNIK_WSTAWKI } from './quality-gate.mjs'

test('prompt niesie standard, frazę, znacznik wstawki i dozwolone adresy', () => {
  const prompt = promptArtykulu({
    temat: 'OCR faktur po KSeF',
    fraza: 'ocr faktury',
    intencja: 'poradnikowa',
    standard: 'TREŚĆ STANDARDU',
    istniejace: [{ slug: 'baza-wiedzy', title: 'Baza wiedzy' }],
    uslugi: ['agenci-ai-i-chatboty'],
    data: '15 września 2026',
  })

  assert.ok(prompt.includes('TREŚĆ STANDARDU'))
  assert.ok(prompt.includes('Fraza "ocr faktury" musi wystapic'))
  assert.ok(prompt.includes(ZNACZNIK_WSTAWKI))
  assert.ok(prompt.includes('- /blog/baza-wiedzy — Baza wiedzy'))
  assert.ok(prompt.includes('- /uslugi/agenci-ai-i-chatboty'))
})
