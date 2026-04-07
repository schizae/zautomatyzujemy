'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/contexts/auth-context'
import { updateProfileAction } from '@/lib/actions/account.actions'
import { CheckCircle, Loader2, Save } from 'lucide-react'
import type { ActionResult, Profile } from '@/types'

const inputClass =
  'bg-surface-container-low border-outline-variant text-on-surface placeholder:text-outline-color focus-visible:border-[#70e5ea] focus-visible:ring-[#70e5ea]/20'

const INITIAL_STATE: ActionResult = { success: false, error: '' }

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, INITIAL_STATE)
  const { refreshProfile } = useAuth()

  useEffect(() => {
    if (state.success) {
      refreshProfile()
    }
  }, [state, refreshProfile])

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
            defaultValue={profile.first_name}
            required
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
            defaultValue={profile.last_name}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium text-on-surface-variant">
          Numer telefonu
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone}
          placeholder="+48 500 000 000"
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
          Dane zaktualizowane.
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
          <Save className="size-4" />
        )}
        Zapisz zmiany
      </Button>
    </form>
  )
}
