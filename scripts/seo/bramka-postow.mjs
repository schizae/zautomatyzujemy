/**
 * Bramka propozycji postów na LinkedIn i Facebooka.
 *
 * Sprawdza to, co da się sprawdzić maszynowo: pochodzenie źródła, powtórzenia, długość,
 * strukturę i higienę tekstu. Osiągalność adresu sprawdza skrypt, bo wymaga sieci.
 * Propozycja z brakami nie znika — trafia do maila oznaczona jako wymagająca uwagi.
 */
import { CZARNA_LISTA } from './quality-gate.mjs'

export const LIMIT_LINKEDIN = 1300
export const LIMIT_FACEBOOK = 600
export const MAX_HASHTAGOW = 3
export const FORMATY = ['tekst', 'karuzela', 'krótkie wideo']

const HASHTAG = /#[\p{L}\p{N}_]+/gu
const EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20E3/u

/** Klucz porównania adresów: bez protokołu, www, parametrów, kotwicy i ukośnika na końcu. */
export function normalizujAdres(url) {
  try {
    const adres = new URL(url)
    return `${adres.hostname.replace(/^www\./, '')}${adres.pathname.replace(/\/$/, '')}`
  } catch {
    return ''
  }
}

export function znajdzZrodlo(url, zrodla) {
  const klucz = normalizujAdres(url)
  return klucz === '' ? undefined : zrodla.find(zrodlo => normalizujAdres(zrodlo.link) === klucz)
}

function sprawdzWersje(nazwa, tekst, limit, braki) {
  if (!tekst?.trim()) {
    braki.push(`Pusta wersja na ${nazwa}`)
    return
  }
  if (tekst.length > limit) braki.push(`Wersja na ${nazwa} ma ${tekst.length} znaków, limit ${limit}`)
  if ((tekst.match(HASHTAG) ?? []).length > MAX_HASHTAGOW) {
    braki.push(`Wersja na ${nazwa} ma więcej niż ${MAX_HASHTAGOW} hashtagi`)
  }
  if (EMOJI.test(tekst)) braki.push(`Emoji w wersji na ${nazwa}`)
  if (/https?:\/\//.test(tekst)) braki.push(`Adres URL w treści wersji na ${nazwa}`)

  const znormalizowany = tekst.toLowerCase().replace(/\s+/g, ' ')
  for (const zwrot of CZARNA_LISTA) {
    if (znormalizowany.includes(zwrot)) braki.push(`Zwrot z czarnej listy w wersji na ${nazwa}: „${zwrot}”`)
  }
}

export function sprawdzPost(post, { zrodla, wykorzystane }) {
  const braki = []

  const zrodlo = znajdzZrodlo(post.zrodlo_url, zrodla)
  if (!zrodlo) braki.push('Źródło spoza zebranych materiałów')
  else if (!zrodlo.title || !zrodlo.pubDate) braki.push('Źródło bez tytułu albo daty publikacji')

  const kluczZrodla = normalizujAdres(post.zrodlo_url)
  if (kluczZrodla && wykorzystane.has(kluczZrodla)) braki.push('To samo źródło co w innej propozycji')
  if (!post.streszczenie_zrodla?.trim()) braki.push('Brak streszczenia źródła')

  sprawdzWersje('LinkedIn', post.linkedin, LIMIT_LINKEDIN, braki)
  sprawdzWersje('Facebooka', post.facebook, LIMIT_FACEBOOK, braki)

  if (post.linkedin?.trim() && !post.linkedin.replace(HASHTAG, '').trimEnd().endsWith('?')) {
    braki.push('Wersja na LinkedIn nie kończy się pytaniem')
  }
  if (post.linkedin && post.facebook && post.facebook.length >= post.linkedin.length) {
    braki.push('Wersja na Facebooka nie jest krótsza od wersji na LinkedIn')
  }
  if (!FORMATY.includes(post.format)) braki.push(`Nieznany format: ${post.format}`)

  return { przechodzi: braki.length === 0, braki }
}
