'use client'

import { useActionState, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { submitContactAction } from '@/lib/actions/contact.actions'
import type { ActionResult } from '@/types'

const initialState: ActionResult<string> = { success: true }

const labelClass = 'text-xs font-label uppercase tracking-widest text-[#bcc9c9]'
const fieldClass =
  'w-full bg-[#1e201e] border-b border-[#3d4949] focus:border-[#ffab98] outline-none py-3 px-1 transition-all text-[#e2e3df] placeholder-[#bcc9c9]/30 font-body text-sm'

const GOAL_OPTIONS = [
  { value: 'llm', label: 'Asystent AI dla firmy' },
  { value: 'automation', label: 'Automatyzacja codziennej pracy' },
  { value: 'strategy', label: 'Szkolenie lub audyt AI' },
  { value: 'custom', label: 'Strona internetowa lub aplikacja' },
]

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactAction, initialState)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]!.value)
  const [message, setMessage] = useState('')
  const [gdprConsent, setGdprConsent] = useState(false)

  const isSuccess = state.success && 'data' in state && state.data === 'sent'
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (isSuccess) {
      setName('')
      setEmail('')
      setGoal(GOAL_OPTIONS[0]!.value)
      setMessage('')
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
          <label htmlFor="contact-name" className={labelClass}>Imię i nazwisko</label>
          <Input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jan Kowalski"
            className={fieldClass}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className={labelClass}>E-mail</label>
          <Input
            id="contact-email"
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
        <label htmlFor="contact-goal" className={labelClass}>Cele do osiągnięcia</label>
        <select
          id="contact-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className={`${fieldClass} cursor-pointer`}
        >
          {GOAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1e201e]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className={labelClass}>Wiadomość</label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Opisz problem, który rozwiązujemy..."
          rows={4}
          className={`${fieldClass} resize-none`}
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
          className="mt-0.5 shrink-0 w-4 h-4 rounded border border-[#3d4949] bg-[#1e201e] accent-[#ffab98] cursor-pointer"
        />
        <span className="text-xs font-body text-[#bcc9c9] leading-relaxed">
          Wyrażam zgodę na przetwarzanie moich danych osobowych przez Zautomatyzujemy.pl
          w celu udzielenia odpowiedzi na zapytanie, zgodnie z{' '}
          <a
            href="/privacy-policy"
            className="text-[#ffab98] hover:underline"
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
        <div className="flex items-center gap-2 rounded-lg bg-[#ffab98]/10 border border-[#ffab98]/20 px-4 py-2.5 text-sm font-medium text-[#ffab98] font-body">
          <CheckCircle className="size-4 shrink-0" />
          Wiadomość wysłana! Odezwiemy się w ciągu 24 godzin.
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending || !gdprConsent}
        className="w-full bg-[#ffab98] text-[#151719] font-headline font-bold py-5 rounded-lg text-lg hover:shadow-[0_0_30px_rgba(112,229,234,0.3)] transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {isPending ? 'Wysyłanie...' : 'Wyślij Zapytanie'}
      </Button>
    </form>
  )
}
