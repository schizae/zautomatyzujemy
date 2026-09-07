'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Rozmowa głosowa z asystentem GŁOS (ADR-24).
 *
 * W kodzie strony nie ma żadnego klucza Vapi — hook prosi serwer GŁOS o token
 * ważny 10 minut, przypięty do tej domeny i do jednego asystenta. Nie ma więc
 * czego skopiować ze źródła strony.
 *
 * SDK ładuje się **przy pierwszym kliknięciu**, nie przy wejściu na stronę:
 * `@vapi-ai/web` ciągnie `@daily-co/daily-js`, czyli zbyt dużo JavaScriptu, żeby
 * wysyłać go każdemu odwiedzającemu dla przycisku, którego większość nie naciśnie.
 */

export type VoiceStatus = 'idle' | 'connecting' | 'active' | 'denied' | 'error'

/** Po tylu sekundach bez połączenia mówimy, że się nie udało. */
const CONNECT_TIMEOUT_MS = 20_000

type VapiInstance = {
  start: (assistantId: string) => Promise<unknown>
  stop: () => void
  on: (event: string, handler: (payload?: unknown) => void) => void
  removeAllListeners?: () => void
}

function statusFromError(value: unknown): VoiceStatus {
  const text = (typeof value === 'string' ? value : JSON.stringify(value ?? '')).toLowerCase()
  // Odmowa mikrofonu to jedyny błąd wart nazwania: odwiedzający może go naprawić,
  // a przeglądarka nie zapyta o zgodę drugi raz.
  return text.includes('permission') || text.includes('notallowed') ? 'denied' : 'error'
}

export function useVoiceCall(tokenEndpoint: string | undefined) {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [activity, setActivity] = useState<'listening' | 'thinking' | 'speaking'>('listening')
  const startingRef = useRef(false)
  const generationRef = useRef(0)
  const vapiRef = useRef<VapiInstance | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      generationRef.current += 1
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      // Wyjście ze strony w trakcie rozmowy nie może zostawić otwartego mikrofonu.
      vapiRef.current?.stop()
      vapiRef.current?.removeAllListeners?.()
    }
  }, [])

  const start = useCallback(async () => {
    if (!tokenEndpoint || startingRef.current || vapiRef.current && status === 'active') return
    startingRef.current = true
    const generation = ++generationRef.current
    setStatus('connecting')
    try {
      // O mikrofon pytamy sami, przed tokenem. SDK połyka odmowę — nie odrzuca
      // obietnicy i nie wysyła zdarzenia `error` — więc przycisk zostawałby na
      // „Łączę…" bez końca. Sprawdzone w przeglądarce 2026-09-06.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      for (const track of stream.getTracks()) track.stop()
      if (generation !== generationRef.current) return

      // Druga osłona: SDK potrafi zamilknąć także z własnych powodów.
      clearTimer()
      timeoutRef.current = setTimeout(() => {
        if (generation === generationRef.current) setStatus(current => (current === 'connecting' ? 'error' : current))
      }, CONNECT_TIMEOUT_MS)

      // Świeży token za każdym razem: wygasa, a serwer liczy to żądanie do
      // obu sufitów, zanim go wyda.
      const response = await fetch(tokenEndpoint, { method: 'POST' })
      if (generation !== generationRef.current) return
      if (!response.ok) {
        // 429 znaczy, że limit został osiągnięty, 403 — że ta domena nie jest
        // zarejestrowana. Żadne z tego nie jest warte tłumaczenia odwiedzającemu.
        clearTimer()
        setStatus('error')
        return
      }
      const ticket: unknown = await response.json()
      if (typeof ticket !== 'object' || ticket === null || !('token' in ticket) || typeof ticket.token !== 'string' || !('assistantId' in ticket) || typeof ticket.assistantId !== 'string') throw new Error('Invalid voice ticket')

      const { default: Vapi } = await import('@vapi-ai/web')
      if (generation !== generationRef.current) return
      // Nowa instancja na rozmowę: poprzednia trzyma wygasły token.
      vapiRef.current?.removeAllListeners?.()
      const instance = new Vapi(ticket.token) as unknown as VapiInstance
      instance.on('call-start', () => { clearTimer(); setStatus('active'); setActivity('listening') })
      instance.on('speech-start', () => setActivity('speaking'))
      instance.on('speech-end', () => setActivity('listening'))
      instance.on('message', payload => {
        if (typeof payload === 'object' && payload !== null && 'type' in payload && payload.type === 'transcript' && 'role' in payload && payload.role === 'user' && 'transcriptType' in payload && payload.transcriptType === 'final') setActivity('thinking')
      })
      instance.on('call-end', () => { clearTimer(); setStatus('idle') })
      instance.on('error', payload => { clearTimer(); setStatus(statusFromError(payload)) })
      vapiRef.current = instance

      await instance.start(ticket.assistantId)
      if (generation !== generationRef.current) instance.stop()
    } catch (error) {
      if (generation === generationRef.current) {
        clearTimer()
        setStatus(statusFromError(String(error)))
      }
    } finally {
      if (generation === generationRef.current) startingRef.current = false
    }
  }, [tokenEndpoint, status, clearTimer])

  const stop = useCallback(() => {
    generationRef.current += 1
    startingRef.current = false
    clearTimer()
    vapiRef.current?.stop()
    vapiRef.current?.removeAllListeners?.()
    setStatus('idle')
  }, [clearTimer])

  return { status, activity, start, stop }
}
