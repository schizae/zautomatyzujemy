/**
 * Trzy bramki techniczne dla szkicu artykułu.
 *
 * Bramka sprawdza wyłącznie to, co da się sprawdzić maszynowo: duplikaty, obecność frazy
 * w wymaganych miejscach, obecność i poprawność odnośników. Prawdziwość twierdzeń
 * i użyteczność tekstu ocenia człowiek przy zatwierdzaniu — to świadomy podział ról,
 * a nie luka do załatania kolejnym sprawdzeniem.
 *
 * Rozróżnienie braków od uwag jest celowe. Brak zatrzymuje publikację, uwaga tylko
 * zwraca uwagę redaktora. Wciskanie odnośnika do usługi, która nie pasuje do tematu,
 * zaszkodziłoby bardziej niż jego brak.
 *
 * Zasady, które ta bramka egzekwuje, opisuje docs/seo/editorial-standard.md.
 */

const CZARNA_LISTA = [
  'w dzisiejszym dynamicznym świecie',
  'w erze cyfrowej',
  'w dobie sztucznej inteligencji',
  'nie od dziś wiadomo',
  'game changer',
  'kluczowy element sukcesu',
  'warto pamiętać, że',
  'przełomow',
  'rewolucj',
]

const ZNACZNIK_WSTAWKI = '<!-- WSTAWKA -->'
const MIN_ZRODEL = 2
const ZALECANE_LINKI_USLUGOWE = 2

function linki(tresc) {
  return [...tresc.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(dopasowanie => dopasowanie[1])
}

function normalizuj(tekst) {
  return String(tekst ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Pierwszy akapit to wszystko do pierwszej pustej linii, z pominięciem nagłówków. */
function pierwszyAkapit(tresc) {
  const bezNaglowkow = tresc
    .split('\n')
    .filter(linia => !linia.trimStart().startsWith('#'))
    .join('\n')

  return bezNaglowkow.trim().split(/\n\s*\n/)[0] ?? ''
}

function slugZeSciezki(sciezka, przedrostek) {
  return sciezka.replace(przedrostek, '').split(/[#?]/)[0]
}

export function sprawdzArtykul(artykul, kontekst) {
  const braki = []
  const uwagi = []

  const { title, slug, targetKeyword, content } = artykul
  const { istniejace = [], uslugi = [] } = kontekst

  const trescNorm = normalizuj(content)
  const frazaNorm = normalizuj(targetKeyword)
  const wszystkieLinki = linki(content)

  // ─── Bramka 1: duplikaty i fraza docelowa ──────────────────────────────────

  if (istniejace.some(artykulIstniejacy => artykulIstniejacy.slug === slug)) {
    braki.push(`Powtórzony slug: ${slug}`)
  }

  if (istniejace.some(artykulIstniejacy => normalizuj(artykulIstniejacy.title) === normalizuj(title))) {
    braki.push(`Powtórzony tytuł: ${title}`)
  }

  if (frazaNorm !== '') {
    if (!normalizuj(title).includes(frazaNorm)) {
      braki.push(`Brak frazy docelowej w tytule: ${targetKeyword}`)
    }
    if (!normalizuj(pierwszyAkapit(content)).includes(frazaNorm)) {
      braki.push(`Brak frazy docelowej w pierwszym akapicie: ${targetKeyword}`)
    }
  }

  // ─── Bramka 2: źródła zewnętrzne ───────────────────────────────────────────

  const zewnetrzne = wszystkieLinki.filter(link => link.startsWith('http'))
  if (zewnetrzne.length < MIN_ZRODEL) {
    braki.push(`Za mało źródeł zewnętrznych: ${zewnetrzne.length}, wymagane ${MIN_ZRODEL}`)
  }

  // ─── Bramka 3: linkowanie wewnętrzne ───────────────────────────────────────

  const uslugowe = wszystkieLinki.filter(link => link.startsWith('/uslugi/'))
  const artykulowe = wszystkieLinki.filter(link => link.startsWith('/blog/'))

  if (artykulowe.length < 1) {
    braki.push('Brak odnośnika do innego artykułu')
  }

  if (uslugowe.length < ZALECANE_LINKI_USLUGOWE) {
    uwagi.push(
      `Mało odnośników do usług: ${uslugowe.length}, zalecane ${ZALECANE_LINKI_USLUGOWE}. ` +
        'Jeśli żadna usługa nie pasuje do tematu, zostaw tak jak jest.'
    )
  }

  for (const link of uslugowe) {
    if (!uslugi.includes(slugZeSciezki(link, '/uslugi/'))) {
      braki.push(`Usługa nie istnieje: ${link}`)
    }
  }

  for (const link of artykulowe) {
    const slugArtykulu = slugZeSciezki(link, '/blog/')
    if (!istniejace.some(artykulIstniejacy => artykulIstniejacy.slug === slugArtykulu)) {
      braki.push(`Artykuł nie istnieje: ${link}`)
    }
  }

  // ─── Higiena tekstu ────────────────────────────────────────────────────────

  for (const zwrot of CZARNA_LISTA) {
    if (trescNorm.includes(zwrot)) {
      braki.push(`Zwrot z czarnej listy: „${zwrot}"`)
    }
  }

  if (content.includes(ZNACZNIK_WSTAWKI)) {
    braki.push('Pozostawiony znacznik wstawki autorskiej — artykuł czeka na akapit od autora')
  }

  return { przechodzi: braki.length === 0, braki, uwagi }
}
