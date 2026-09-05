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

  useEffect(() => {
    return () => {
      generationRef.current += 1
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
      // Świeży token za każdym razem: wygasa, a serwer liczy to żądanie do
      // obu sufitów, zanim go wyda.
      const response = await fetch(tokenEndpoint, { method: 'POST' })
      if (generation !== generationRef.current) return
      if (!response.ok) {
        // 429 znaczy, że limit został osiągnięty, 403 — że ta domena nie jest
        // zarejestrowana. Żadne z tego nie jest warte tłumaczenia odwiedzającemu.
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
      instance.on('call-start', () => { setStatus('active'); setActivity('listening') })
      instance.on('speech-start', () => setActivity('speaking'))
      instance.on('speech-end', () => setActivity('listening'))
      instance.on('message', payload => {
        if (typeof payload === 'object' && payload !== null && 'type' in payload && payload.type === 'transcript' && 'role' in payload && payload.role === 'user' && 'transcriptType' in payload && payload.transcriptType === 'final') setActivity('thinking')
      })
      instance.on('call-end', () => setStatus('idle'))
      instance.on('error', payload => setStatus(statusFromError(payload)))
      vapiRef.current = instance

      await instance.start(ticket.assistantId)
      if (generation !== generationRef.current) instance.stop()
    } catch (error) {
      if (generation === generationRef.current) setStatus(statusFromError(String(error)))
    } finally {
      if (generation === generationRef.current) startingRef.current = false
    }
  }, [tokenEndpoint, status])

  const stop = useCallback(() => {
    generationRef.current += 1
    startingRef.current = false
    vapiRef.current?.stop()
    vapiRef.current?.removeAllListeners?.()
    setStatus('idle')
  }, [])

  return { status, activity, start, stop }
}
