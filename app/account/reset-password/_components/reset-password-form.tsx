'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestPasswordResetAction } from '@/lib/actions/account.actions'
import { Loader2, MailCheck, Send } from 'lucide-react'
import type { ActionResult } from '@/types'

const inputClass =
  'h-12 bg-white border-[#c7c3bb] text-[#151719] placeholder:text-[#74746d] focus-visible:border-[#c93820] focus-visible:ring-[#c93820]/20'

const INITIAL_STATE: ActionResult = { success: false, error: '' }

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, INITIAL_STATE)

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-[#c93820]/15">
          <MailCheck className="size-7 text-[#c93820]" />
        </div>
        <div>
          <h2 className="font-headline text-lg font-bold text-[#151719]">Sprawdź skrzynkę</h2>
          <p className="mt-1 text-sm text-[#62625d]">
            Jeśli konto o tym adresie istnieje, wysłaliśmy link do ustawienia nowego hasła.
            Link jest ważny przez godzinę.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
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
          autoFocus
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
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Wyślij link
      </Button>
    </form>
  )
}
