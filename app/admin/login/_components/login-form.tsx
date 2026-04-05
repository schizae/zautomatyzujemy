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
        <label className="block text-sm font-bold text-on-surface-variant">Hasło administratora</label>
        <Input
          type="password"
          name="password"
          placeholder="••••••••"
          required
          autoFocus
          className="bg-surface-container-low"
        />
      </div>

      {!state.success && (
        <p className="rounded-lg bg-red-900/30 px-4 py-2.5 text-sm font-medium text-red-400">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full gap-2" disabled={isPending}>
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
