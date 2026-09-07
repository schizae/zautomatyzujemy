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
  'h-12 bg-white border-[#c7c3bb] text-[#151719] placeholder:text-[#74746d] focus-visible:border-[#c93820] focus-visible:ring-[#c93820]/20'

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
        <div className="flex size-14 items-center justify-center rounded-full bg-[#c93820]/15">
          <CheckCircle className="size-7 text-[#c93820]" />
        </div>
        <div>
          <h2 className="font-headline text-lg font-bold text-[#151719]">Konto utworzone!</h2>
          <p className="mt-1 text-sm text-[#62625d]">
            Jesteś teraz zalogowany.
          </p>
        </div>
        <Button
          className="mt-2 w-full gap-2 h-12 bg-[#c93820] text-white font-semibold hover:bg-[#ab2f1c] transition-colors"
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
          <label htmlFor="firstName" className="block text-sm font-medium text-[#62625d]">
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
          <label htmlFor="lastName" className="block text-sm font-medium text-[#62625d]">
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
        <label htmlFor="email" className="block text-sm font-medium text-[#62625d]">
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
        <label htmlFor="phone" className="block text-sm font-medium text-[#62625d]">
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
        <label htmlFor="password" className="block text-sm font-medium text-[#62625d]">
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
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#62625d]">
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
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gap-2 h-12 bg-[#c93820] text-white font-semibold hover:bg-[#ab2f1c] transition-colors"
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
