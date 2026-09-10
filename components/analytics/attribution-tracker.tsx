'use client'

import { useEffect } from 'react'
import type { RawAttribution } from '@/lib/attribution'

const STORAGE_KEY = 'zautomatyzujemy:first-touch'

const EMPTY: RawAttribution = { referrer: null, landingPath: null, utmSource: null }

/**
 * Zapisuje pierwsze wejście w tej karcie przeglądarki. Kolejne podstrony go nie
 * nadpisują, bo interesuje nas wejście na witrynę, a nie ostatnie kliknięcie.
 */
export function AttributionTracker(): null {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) !== null) return

      const params = new URLSearchParams(window.location.search)
      const payload: RawAttribution = {
        referrer: document.referrer === '' ? null : document.referrer,
        landingPath: window.location.pathname,
        utmSource: params.get('utm_source'),
      }

      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Prywatne okno albo zablokowane dane witryny. Atrybucja jest opcjonalna,
      // więc brak zapisu nie może niczego zepsuć.
    }
  }, [])

  return null
}

/** Odczyt dla formularzy. Zawsze zwraca komplet pól, także gdy zapisu nie było. */
export function readFirstTouch(): RawAttribution {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored === null) return EMPTY

    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY

    const record = parsed as Record<string, unknown>
    return {
      referrer: typeof record['referrer'] === 'string' ? record['referrer'] : null,
      landingPath: typeof record['landingPath'] === 'string' ? record['landingPath'] : null,
      utmSource: typeof record['utmSource'] === 'string' ? record['utmSource'] : null,
    }
  } catch {
    return EMPTY
  }
}
