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

// Dopasowanie po etykietach hosta, nie po fragmencie nazwy. `www.google.pl`
// ma etykiety `www`, `google`, `pl`, więc jedna reguła obsługuje wszystkie
// krajowe warianty wyszukiwarki, a `notgoogle.com` już nie trafia.
const SEARCH_LABELS = ['google', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'brave', 'yandex']
const SOCIAL_LABELS = ['linkedin', 'facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'messenger']

// Skrótowce, których nie da się dopasować etykietą, bo cała domena jest tokenem.
// Porównujemy je dokładnie — `x.com` jako fragment trafiał w `box.com`.
const SOCIAL_DOMAINS = ['lnkd.in', 't.co', 'x.com', 'fb.me', 'fb.com', 'youtu.be']

function matchesDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`)
}

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

  if (OWN_HOSTS.some(own => matchesDomain(host, own))) return 'internal'

  const labels = host.split('.')
  if (SEARCH_LABELS.some(label => labels.includes(label))) return 'organic'
  if (SOCIAL_LABELS.some(label => labels.includes(label))) return 'social'
  if (SOCIAL_DOMAINS.some(domain => matchesDomain(host, domain))) return 'social'

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
