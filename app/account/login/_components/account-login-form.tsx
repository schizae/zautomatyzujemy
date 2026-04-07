'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/contexts/auth-context'
import { clientLoginAction } from '@/lib/actions/account.actions'
import { Loader2, Lock, ShieldCheck, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActionResult } from '@/types'

type Tab = 'client' | 'admin'

const inputClass =
  'bg-surface-container-low border-outline-variant text-on-surface placeholder:text-outline-color focus-visible:border-[#70e5ea] focus-visible:ring-[#70e5ea]/20'

const INITIAL_STATE: ActionResult = { success: false, error: '' }

export function AccountLoginForm() {
  const [tab, setTab] = useState<Tab>('client')
  const [state, formAction, isPending] = useActionState(clientLoginAction, INITIAL_STATE)
  const [adminPending, setAdminPending] = useState(false)
  const { refreshProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      refreshProfile()
      router.push('/')
      router.refresh()
    }
  }, [state, refreshProfile, router])

  function handleAdminRedirect() {
    setAdminPending(true)
    router.push('/admin/login')
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex rounded-xl border border-outline-variant bg-surface-container-low p-1 gap-1">
        <TabButton
          active={tab === 'client'}
          onClick={() => setTab('client')}
          icon={<User className="size-3.5" />}
          label="Klient"
        />
        <TabButton
          active={tab === 'admin'}
          onClick={() => setTab('admin')}
          icon={<ShieldCheck className="size-3.5" />}
          label="Administrator"
        />
      </div>

      {tab === 'client' ? (
        <form action={formAction} className="space-y-4">
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
              autoFocus
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
              <Lock className="size-4" />
            )}
            Zaloguj się
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#70e5ea]/20 bg-[#70e5ea]/5 px-4 py-3 text-sm text-on-surface-variant">
            Zostaniesz przekierowany do panelu administratora, gdzie możesz zalogować się hasłem.
          </div>

          <Button
            type="button"
            disabled={adminPending}
            onClick={handleAdminRedirect}
            className="w-full gap-2 bg-gradient-to-br from-[#70e5ea] to-[#50c9ce] text-[#003739] font-bold hover:brightness-110 hover:-translate-y-0.5 shadow-lg shadow-[#70e5ea]/20 transition-all"
          >
            {adminPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            Przejdź do panelu admina
          </Button>
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
        active
          ? 'bg-gradient-to-br from-[#70e5ea] to-[#50c9ce] text-[#003739] shadow-sm font-bold'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
