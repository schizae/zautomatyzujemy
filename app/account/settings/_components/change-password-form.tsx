'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { changePasswordAction } from '@/lib/actions/account.actions'
import { CheckCircle, KeyRound, Loader2 } from 'lucide-react'
import type { ActionResult } from '@/types'

const inputClass =
  'bg-surface-container-low border-outline-variant text-on-surface placeholder:text-outline-color focus-visible:border-[#70e5ea] focus-visible:ring-[#70e5ea]/20'

const INITIAL_STATE: ActionResult = { success: false, error: '' }

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, INITIAL_STATE)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="block text-sm font-medium text-on-surface-variant">
          Nowe hasło
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-on-surface-variant">
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

      {!state.success && state.error && (
        <p className="rounded-lg bg-red-900/30 px-4 py-2.5 text-sm font-medium text-red-400">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="flex items-center gap-2 rounded-lg bg-[#70e5ea]/10 px-4 py-2.5 text-sm font-medium text-[#70e5ea]">
          <CheckCircle className="size-4" />
          Hasło zmienione.
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
          <KeyRound className="size-4" />
        )}
        Zmień hasło
      </Button>
    </form>
  )
}
