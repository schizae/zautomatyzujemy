'use client'

import { useEffect } from 'react'
import type { RawAttribution } from '@/lib/attribution'

const STORAGE_KEY = 'zautomatyzujemy:first-touch'

const EMPTY: RawAttribution = { referrer: null, landingPath: null, utmSource: null }

function currentTouch(): RawAttribution {
  const params = new URLSearchParams(window.location.search)
  return {
    referrer: document.referrer === '' ? null : document.referrer,
    landingPath: window.location.pathname,
    utmSource: params.get('utm_source'),
  }
}

function readStored(): RawAttribution | null {
  const stored = window.sessionStorage.getItem(STORAGE_KEY)
  if (stored === null) return null

  const parsed: unknown = JSON.parse(stored)
  if (typeof parsed !== 'object' || parsed === null) return null

  const record = parsed as Record<string, unknown>
  return {
    referrer: typeof record['referrer'] === 'string' ? record['referrer'] : null,
    landingPath: typeof record['landingPath'] === 'string' ? record['landingPath'] : null,
    utmSource: typeof record['utmSource'] === 'string' ? record['utmSource'] : null,
  }
}

/**
 * Zwraca pierwsze wejście w tej karcie, a gdy go jeszcze nie ma — zapisuje bieżące.
 * Zapis przy odczycie jest tu celowy: gdy pamięć jest pusta, bieżąca strona JEST
 * stroną wejścia, a formularz może odczytać dane wcześniej, niż zdąży je zapisać
 * komponent śledzący. Bez tego kolejność efektów Reacta decydowałaby o atrybucji.
 */
function captureFirstTouch(): RawAttribution {
  try {
    const stored = readStored()
    if (stored !== null) return stored

    const fresh = currentTouch()
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    return fresh
  } catch {
    // Prywatne okno albo zablokowane dane witryny. Atrybucja jest opcjonalna,
    // więc brak zapisu nie może niczego zepsuć.
    return EMPTY
  }
}

/**
 * Zapisuje pierwsze wejście w tej karcie przeglądarki. Kolejne podstrony go nie
 * nadpisują, bo interesuje nas wejście na witrynę, a nie ostatnie kliknięcie.
 */
export function AttributionTracker(): null {
  useEffect(() => {
    captureFirstTouch()
  }, [])

  return null
}

/** Odczyt dla formularzy. Zawsze zwraca komplet pól, także gdy zapisu nie było. */
export function readFirstTouch(): RawAttribution {
  return captureFirstTouch()
}
