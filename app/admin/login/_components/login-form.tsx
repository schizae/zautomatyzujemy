'use client'

import { useActionState } from 'react'
import { loginAction } from '@/lib/actions/admin.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Lock } from 'lucide-react'
import type { ActionResult } from '@/types'

const initialState: ActionResult = { success: true }

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="admin-password" className="block text-sm font-bold text-[#62625d]">Hasło administratora</label>
        <Input
          id="admin-password"
          autoComplete="current-password"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          autoFocus
          className="h-12 bg-white border-[#c7c3bb] text-[#151719] focus-visible:ring-[#c93820]/20"
        />
      </div>

      {!state.success && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" className="h-12 w-full gap-2 bg-[#c93820] text-white hover:bg-[#ab2f1c]" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Lock className="size-4" />
        )}
        Zaloguj się
      </Button>
    </form>
  )
}
