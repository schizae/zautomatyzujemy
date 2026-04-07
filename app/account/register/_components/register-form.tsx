'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/contexts/auth-context'
import { registerAction } from '@/lib/actions/account.actions'
import { CheckCircle, Loader2, UserPlus } from 'lucide-react'
import type { ActionResult } from '@/types'

const inputClass =
  'bg-surface-container-low border-outline-variant text-on-surface placeholder:text-outline-color focus-visible:border-[#70e5ea] focus-visible:ring-[#70e5ea]/20'

const INITIAL_STATE: ActionResult = { success: false, error: '' }

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, INITIAL_STATE)
  const [isSuccess, setIsSuccess] = useState(false)
  const { refreshProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      refreshProfile()
      setIsSuccess(true)
    }
  }, [state, refreshProfile])

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-[#70e5ea]/15">
          <CheckCircle className="size-7 text-[#70e5ea]" />
        </div>
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">Konto utworzone!</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Jesteś teraz zalogowany.
          </p>
        </div>
        <Button
          className="mt-2 w-full gap-2 bg-gradient-to-br from-[#70e5ea] to-[#50c9ce] text-[#003739] font-bold hover:brightness-110 hover:-translate-y-0.5 shadow-lg shadow-[#70e5ea]/20 transition-all"
          onClick={() => router.push('/')}
        >
          Przejdź do strony głównej
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="block text-sm font-medium text-on-surface-variant">
            Imię
          </label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Jan"
            required
            autoFocus
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="lastName" className="block text-sm font-medium text-on-surface-variant">
            Nazwisko
          </label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Kowalski"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-on-surface-variant">
          Adres e-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jan@firma.pl"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium text-on-surface-variant">
          Numer telefonu
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+48 500 000 000"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-on-surface-variant">
          Hasło
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-on-surface-variant">
          Potwierdź hasło
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          className={inputClass}
        />
      </div>

      {!state.success && state.error && (
        <p className="rounded-lg bg-red-900/30 px-4 py-2.5 text-sm font-medium text-red-400">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gap-2 bg-gradient-to-br from-[#70e5ea] to-[#50c9ce] text-[#003739] font-bold hover:brightness-110 hover:-translate-y-0.5 shadow-lg shadow-[#70e5ea]/20 transition-all"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        Utwórz konto
      </Button>
    </form>
  )
}
