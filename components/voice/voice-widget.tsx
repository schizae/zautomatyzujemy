'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Floating 'talk to the assistant' button (brief §5.4, §11).
 *
 * Written to be copied verbatim into a customer's site: no shadcn, no project
 * imports, only Tailwind classes and the Vapi SDK. Everything that differs
 * between tenants arrives as a prop.
 *
 * The SDK is imported **on first click**, not on mount. `@vapi-ai/web` pulls in
 * `@daily-co/daily-js`, which is far too much JavaScript to ship to every
 * visitor of every page for a button most of them will not press (§11 W5 caps
 * the acceptable Lighthouse regression at 5 points).
 */

type Status = 'idle' | 'connecting' | 'active' | 'denied' | 'error'

export type VoiceWidgetProps = {
  publicKey: string
  assistantId: string
  /** The chat launcher usually owns the right corner, so default to the left (§11 W2). */
  side?: 'left' | 'right'
  /** Shown when the browser refuses the microphone — e.g. '/kontakt'. */
  fallbackHref?: string
  label?: string
  /**
   * Overrides the idle button's colours. The default is a dark pill, which
   * disappears on a dark-themed site — and an invisible sales button is worse
   * than no button. Pass the host site's accent instead.
   */
  buttonClassName?: string
}

// Minimal shape of the SDK instance; avoids importing types at module scope,
// which would defeat the lazy import.
type VapiInstance = {
  start: (assistantId: string) => Promise<unknown>
  stop: () => void
  on: (event: string, handler: (payload?: unknown) => void) => void
  removeAllListeners?: () => void
}

const STATUS_TEXT: Record<Status, string> = {
  idle: '',
  connecting: 'Łączę…',
  active: 'Trwa rozmowa',
  denied: 'Brak dostępu do mikrofonu',
  error: 'Nie udało się połączyć',
}

export function VoiceWidget({
  publicKey,
  assistantId,
  side = 'left',
  fallbackHref,
  label = 'Porozmawiaj z asystentem',
  buttonClassName = 'bg-neutral-900 text-white hover:bg-neutral-800',
}: VoiceWidgetProps) {
  const [status, setStatus] = useState<Status>('idle')
  const vapiRef = useRef<VapiInstance | null>(null)

  useEffect(() => {
    return () => {
      // Leaving the page mid-call must not leave the microphone open.
      vapiRef.current?.stop()
      vapiRef.current?.removeAllListeners?.()
    }
  }, [])

  const start = useCallback(async () => {
    setStatus('connecting')
    try {
      if (!vapiRef.current) {
        const { default: Vapi } = await import('@vapi-ai/web')
        const instance = new Vapi(publicKey) as unknown as VapiInstance
        instance.on('call-start', () => setStatus('active'))
        instance.on('call-end', () => setStatus('idle'))
        instance.on('error', (payload) => {
          const text = JSON.stringify(payload ?? '').toLowerCase()
          // Permission failures are the one error worth naming: the visitor can
          // fix them, and the browser gives no second prompt once denied.
          setStatus(
            text.includes('permission') || text.includes('notallowed') ? 'denied' : 'error',
          )
        })
        vapiRef.current = instance
      }
      await vapiRef.current.start(assistantId)
    } catch (error) {
      const text = String(error).toLowerCase()
      setStatus(text.includes('permission') || text.includes('notallowed') ? 'denied' : 'error')
    }
  }, [assistantId, publicKey])

  const stop = useCallback(() => {
    vapiRef.current?.stop()
    setStatus('idle')
  }, [])

  const inCall = status === 'active' || status === 'connecting'
  const failed = status === 'denied' || status === 'error'

  return (
    <div
      className={`fixed bottom-8 z-[90] flex flex-col gap-2 ${
        side === 'left' ? 'left-8 items-start' : 'right-8 items-end'
      }`}
    >
      {failed ? (
        <div className='max-w-[17rem] rounded-lg bg-white p-3 text-sm text-neutral-800 shadow-lg ring-1 ring-black/10'>
          <p className='font-medium'>
            {status === 'denied' ? 'Mikrofon jest zablokowany' : 'Coś poszło nie tak'}
          </p>
          <p className='mt-1 text-neutral-600'>
            {status === 'denied'
              ? 'Zezwól na mikrofon w ustawieniach przeglądarki (kłódka przy adresie) i spróbuj ponownie.'
              : 'Spróbuj ponownie za chwilę.'}
          </p>
          {fallbackHref ? (
            <a
              href={fallbackHref}
              className='mt-2 inline-block font-medium text-neutral-900 underline underline-offset-4'
            >
              Albo napisz do nas
            </a>
          ) : null}
        </div>
      ) : null}

      <button
        type='button'
        onClick={inCall ? stop : start}
        aria-label={inCall ? 'Zakończ rozmowę z asystentem' : label}
        className={`flex min-h-12 items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium shadow-lg transition-colors ${
          inCall
            ? 'bg-red-600 text-white hover:bg-red-700'
            : buttonClassName
        }`}
      >
        <span aria-hidden='true' className={status === 'active' ? 'animate-pulse' : undefined}>
          {inCall ? '⏹' : '🎙️'}
        </span>
        {inCall ? (status === 'connecting' ? 'Łączę…' : 'Zakończ rozmowę') : label}
      </button>

      {/* Status spoken by screen readers without stealing focus. */}
      <span aria-live='polite' className='sr-only'>
        {STATUS_TEXT[status]}
      </span>
    </div>
  )
}

export default VoiceWidget
