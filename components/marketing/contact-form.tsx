'use client'

import { useActionState, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { submitContactAction } from '@/lib/actions/contact.actions'
import type { ActionResult } from '@/types'

const initialState: ActionResult<string> = { success: true }

const labelClass = 'block text-xs font-label font-semibold uppercase tracking-widest text-[#dedbd5]'
const fieldClass =
  'min-h-12 w-full rounded-md bg-[#212326] border border-[#66696c] focus-visible:border-[#f34c30] focus-visible:ring-2 focus-visible:ring-[#f34c30]/30 py-3 px-4 text-[#f5f2ed] placeholder:text-[#b9b7b2] font-body text-base [color-scheme:dark]'

const GOAL_OPTIONS = [
  { value: 'llm', label: 'Asystent AI dla firmy' },
  { value: 'automation', label: 'Automatyzacja codziennej pracy' },
  { value: 'strategy', label: 'Szkolenie lub audyt AI' },
  { value: 'custom', label: 'Strona internetowa lub aplikacja' },
]

interface ContactFormProps {
  message?: string
  onMessageChange?: (message: string) => void
  idPrefix?: string
}

export function ContactForm({ message: controlledMessage, onMessageChange, idPrefix = 'contact' }: ContactFormProps = {}) {
  const [state, formAction, isPending] = useActionState(submitContactAction, initialState)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]!.value)
  const [localMessage, setLocalMessage] = useState('')
  const message = controlledMessage ?? localMessage
  const setMessage = (nextMessage: string) => {
    if (controlledMessage === undefined) setLocalMessage(nextMessage)
    onMessageChange?.(nextMessage)
  }
  const [gdprConsent, setGdprConsent] = useState(false)

  const isSuccess = state.success && 'data' in state && state.data === 'sent'
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (isSuccess) {
      setName('')
      setEmail('')
      setGoal(GOAL_OPTIONS[0]!.value)
      setLocalMessage('')
      setGdprConsent(false)
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden inputs — wartości kontrolowane przez React state */}
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="goal" value={goal} />
      <input type="hidden" name="message" value={message} />
      <input type="hidden" name="gdprConsent" value={gdprConsent ? 'true' : 'false'} />

      {/* Honeypot — ukryte przed ludźmi, widoczne dla botów */}
      <div aria-hidden="true" className="hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-name`} className={labelClass}>Imię i nazwisko</label>
          <Input
            id={`${idPrefix}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jan Kowalski"
            className={fieldClass}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-email`} className={labelClass}>E-mail</label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jan@firma.pl"
            className={fieldClass}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-goal`} className={labelClass}>Cele do osiągnięcia</label>
        <select
          id={`${idPrefix}-goal`}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className={`${fieldClass} cursor-pointer`}
        >
          {GOAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#212326]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-message`} className={labelClass}>Wiadomość</label>
        <Textarea
          id={`${idPrefix}-message`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Opisz problem, który rozwiązujemy..."
          rows={4}
          className={`${fieldClass} min-h-32 resize-y`}
          required
        />
      </div>

      {/* GDPR consent */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={gdprConsent}
          onChange={(e) => setGdprConsent(e.target.checked)}
          required
          className="mt-0.5 shrink-0 w-4 h-4 rounded border border-[#3d4949] bg-[#212326] accent-[#e84324] cursor-pointer"
        />
        <span className="text-xs font-body text-[#dedbd5] leading-relaxed">
          Wyrażam zgodę na przetwarzanie moich danych osobowych przez Zautomatyzujemy.pl
          w celu udzielenia odpowiedzi na zapytanie, zgodnie z{' '}
          <a
            href="/privacy-policy"
            className="text-[#ffb49f] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Polityką Prywatności
          </a>
          . Zgoda jest dobrowolna i można ją wycofać w dowolnym momencie.{' '}
          <span className="text-red-400">*</span>
        </span>
      </label>

      {!state.success && (
        <p className="rounded-lg bg-red-900/30 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 font-body">
          {state.error}
        </p>
      )}

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-[#ffab98]/10 border border-[#ffab98]/20 px-4 py-2.5 text-sm font-medium text-[#ffb49f] font-body">
          <CheckCircle className="size-4 shrink-0" />
          Wiadomość wysłana! Odezwiemy się w ciągu 24 godzin.
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending || !gdprConsent}
        className="min-h-14 h-auto w-full rounded-md bg-[#c93820] px-6 py-4 text-base font-semibold text-white hover:bg-[#a82e19] disabled:opacity-60 flex items-center justify-center gap-3"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {isPending ? 'Wysyłanie...' : 'Wyślij Zapytanie'}
      </Button>
    </form>
  )
}
