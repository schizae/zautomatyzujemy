/**
 * Skąd przyszedł odwiedzający. Moduł jest świadomie bez importów — dzięki temu
 * testuje się go transpilacją, tak samo jak `lib/ai-disclosure.ts`.
 *
 * Uwaga o zakresie pomiaru: dane pochodzą z `sessionStorage`, więc opisują
 * pierwsze wejście w obrębie jednej karty przeglądarki, a nie pierwszą wizytę
 * klienta w całej jego historii. To świadomie przyjęte minimum.
 */

export type LeadSourceKind =
  | 'organic'
  | 'social'
  | 'referral'
  | 'direct'
  | 'campaign'
  | 'internal'

export interface RawAttribution {
  referrer?: string | null
  landingPath?: string | null
  utmSource?: string | null
}

export interface NormalizedAttribution {
  referrer: string | null
  landingPath: string | null
  utmSource: string | null
  sourceKind: LeadSourceKind
}

/** Kolumny w bazie są typu TEXT, ale nie ma powodu zapisywać cudzych megabajtów. */
const MAX_LENGTH = 500

const OWN_HOSTS = ['zautomatyzujemy.pl', 'localhost']

// Dopasowanie po fragmencie nazwy hosta. Świadomie proste: fałszywe trafienie
// na domenie zawierającej „google" jest tańsze niż utrzymywanie pełnej listy.
const SEARCH_TOKENS = ['google', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'brave', 'yandex']
const SOCIAL_TOKENS = ['linkedin', 'lnkd.in', 'facebook', 'instagram', 'twitter', 'x.com', 't.co', 'tiktok', 'youtube']

function clamp(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '') return null
  return trimmed.slice(0, MAX_LENGTH)
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

export function classifySource(
  referrer: string | null | undefined,
  utmSource: string | null | undefined
): LeadSourceKind {
  if (clamp(utmSource) !== null) return 'campaign'

  const referrerValue = clamp(referrer)
  if (referrerValue === null) return 'direct'

  const host = hostOf(referrerValue)
  if (host === null) return 'direct'

  if (OWN_HOSTS.some(own => host === own || host.endsWith(`.${own}`))) return 'internal'
  if (SEARCH_TOKENS.some(token => host.includes(token))) return 'organic'
  if (SOCIAL_TOKENS.some(token => host.includes(token))) return 'social'

  return 'referral'
}

export function normalizeAttribution(raw: RawAttribution): NormalizedAttribution {
  const landingPath = clamp(raw.landingPath)

  return {
    referrer: clamp(raw.referrer),
    landingPath: landingPath !== null && landingPath.startsWith('/') ? landingPath : null,
    utmSource: clamp(raw.utmSource),
    sourceKind: classifySource(raw.referrer, raw.utmSource),
  }
}
