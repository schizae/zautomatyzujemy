'use client'

import { useActionState, useState, useEffect } from 'react'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { submitContactAction } from '@/lib/actions/contact.actions'
import type { ActionResult } from '@/types'

const initialState: ActionResult<string> = { success: true }

const labelClass = 'text-xs font-label uppercase tracking-widest text-[#bcc9c9]'
const fieldClass =
  'w-full bg-[#1e201e] border-b border-[#3d4949] focus:border-[#70e5ea] outline-none py-3 px-1 transition-all text-[#e2e3df] placeholder-[#bcc9c9]/30 font-body text-sm'

const GOAL_OPTIONS = [
  { value: 'llm', label: 'Implementacja LLM' },
  { value: 'automation', label: 'Automatyzacja Workflow' },
  { value: 'strategy', label: 'Strategia Enterprise' },
  { value: 'custom', label: 'Własne Rozwiązanie' },
]

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactAction, initialState)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]!.value)
  const [message, setMessage] = useState('')

  const isSuccess = state.success && 'data' in state && state.data === 'sent'
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (isSuccess) {
      setName('')
      setEmail('')
      setGoal(GOAL_OPTIONS[0]!.value)
      setMessage('')
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="contact-name" className={labelClass}>Imię i nazwisko</label>
          <input
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
          <input
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
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Opisz problem, który rozwiązujemy..."
          rows={4}
          className={`${fieldClass} resize-none`}
          required
        />
      </div>

      {!state.success && (
        <p className="rounded-lg bg-red-900/30 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 font-body">
          {state.error}
        </p>
      )}

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-[#70e5ea]/10 border border-[#70e5ea]/20 px-4 py-2.5 text-sm font-medium text-[#70e5ea] font-body">
          <CheckCircle className="size-4 shrink-0" />
          Wiadomość wysłana! Odezwiemy się w ciągu 24 godzin.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#70e5ea] text-[#003739] font-headline font-bold py-5 rounded-full text-lg hover:shadow-[0_0_30px_rgba(112,229,234,0.3)] transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {isPending ? 'Wysyłanie...' : 'Wyślij Zapytanie'}
      </button>
    </form>
  )
}
