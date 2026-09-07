'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { changePasswordAction } from '@/lib/actions/account.actions'
import { CheckCircle, KeyRound, Loader2 } from 'lucide-react'
import type { ActionResult } from '@/types'

const inputClass =
  'h-12 bg-white border-[#c7c3bb] text-[#151719] placeholder:text-[#74746d] focus-visible:border-[#c93820] focus-visible:ring-[#c93820]/20'

const INITIAL_STATE: ActionResult = { success: false, error: '' }

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, INITIAL_STATE)
  const router = useRouter()

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-[#c93820]/15">
          <CheckCircle className="size-7 text-[#c93820]" />
        </div>
        <div>
          <h2 className="font-headline text-lg font-bold text-[#151719]">Hasło zmienione</h2>
          <p className="mt-1 text-sm text-[#62625d]">Od teraz loguj się nowym hasłem.</p>
        </div>
        <Button
          className="mt-2 w-full gap-2 h-12 bg-[#c93820] text-white font-semibold hover:bg-[#ab2f1c] transition-colors"
          onClick={() => {
            router.push('/')
            router.refresh()
          }}
        >
          Przejdź do strony głównej
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="block text-sm font-medium text-[#62625d]">
          Nowe hasło
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoFocus
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#62625d]">
          Potwierdź nowe hasło
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

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gap-2 h-12 bg-[#c93820] text-white font-semibold hover:bg-[#ab2f1c] transition-colors"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Zapisz nowe hasło
      </Button>
    </form>
  )
}
