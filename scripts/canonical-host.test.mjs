import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Produkcja żyje na www, a wersja bez www tylko przekierowuje. Wartość domyślna
// bez www oznacza, że build bez NEXT_PUBLIC_SITE_URL wypuści adresy kanoniczne
// na hoście, który sam siebie przekierowuje.
const FILES = [
  '../app/layout.tsx',
  '../app/sitemap.ts',
  '../app/robots.ts',
  '../app/blog/[slug]/page.tsx',
  '../app/case-studies/[slug]/page.tsx',
  '../app/page.tsx',
  '../lib/actions/account.actions.ts',
  '../lib/email/resend.ts',
]

for (const relativePath of FILES) {
  test(`${relativePath} nie zawiera fallbacku bez www`, () => {
    const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')
    assert.equal(
      source.includes("'https://zautomatyzujemy.pl'"),
      false,
      'Wartość domyślna hosta musi wskazywać https://www.zautomatyzujemy.pl'
    )
  })
}
