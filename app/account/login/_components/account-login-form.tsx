'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/contexts/auth-context'
import { clientLoginAction, resendConfirmationAction } from '@/lib/actions/account.actions'
import { EMAIL_NOT_CONFIRMED } from '@/lib/auth-messages'
import { Loader2, Lock, MailCheck, ShieldCheck, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActionResult } from '@/types'

type Tab = 'client' | 'admin'

const inputClass =
  'h-12 bg-white border-[#c7c3bb] text-[#151719] placeholder:text-[#74746d] focus-visible:border-[#c93820] focus-visible:ring-[#c93820]/20'

const INITIAL_STATE: ActionResult = { success: false, error: '' }

export function AccountLoginForm() {
  const [tab, setTab] = useState<Tab>('client')
  const [state, formAction, isPending] = useActionState(clientLoginAction, INITIAL_STATE)
  const [adminPending, setAdminPending] = useState(false)
  const [email, setEmail] = useState('')
  const [resend, setResend] = useState<ActionResult | null>(null)
  const [resendPending, setResendPending] = useState(false)
  const { refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // /auth/callback odsyla tu z ?error=link, gdy link z maila wygasl lub byl juz uzyty.
  const linkError = searchParams.get('error') === 'link'
  const needsConfirmation = !state.success && state.error === EMAIL_NOT_CONFIRMED

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

  async function handleResend() {
    setResendPending(true)
    setResend(await resendConfirmationAction(email))
    setResendPending(false)
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex rounded-xl border border-[#d9d6d0] bg-[#eeeae3] p-1 gap-1">
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
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#62625d]">
                Hasło
              </label>
              <Link
                href="/account/reset-password"
                className="text-xs font-medium text-[#c93820] hover:brightness-110 transition-all"
              >
                Nie pamiętasz hasła?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className={inputClass}
            />
          </div>

          {linkError && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              Link z maila wygasł lub został już użyty. Zaloguj się lub poproś o nowy.
            </p>
          )}

          {!state.success && state.error && (
            <div className="space-y-2 rounded-lg bg-red-50 px-4 py-2.5">
              <p className="text-sm font-medium text-red-700">{state.error}</p>

              {needsConfirmation && !resend?.success && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendPending || !email}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c93820] hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {resendPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <MailCheck className="size-3.5" />
                  )}
                  Wyślij link aktywacyjny ponownie
                </button>
              )}

              {resend && !resend.success && (
                <p className="text-xs text-red-700">{resend.error}</p>
              )}
            </div>
          )}

          {resend?.success && (
            <p className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800">
              <MailCheck className="size-4" />
              Link aktywacyjny wysłany — sprawdź skrzynkę.
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
              <Lock className="size-4" />
            )}
            Zaloguj się
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#c93820]/20 bg-[#c93820]/5 px-4 py-3 text-sm text-[#62625d]">
            Zostaniesz przekierowany do panelu administratora, gdzie możesz zalogować się hasłem.
          </div>

          <Button
            type="button"
            disabled={adminPending}
            onClick={handleAdminRedirect}
            className="w-full gap-2 h-12 bg-[#c93820] text-white font-semibold hover:bg-[#ab2f1c] transition-colors"
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
    <Button
      type="button"
      variant="ghost"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-11 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
        active
          ? 'bg-[#151719] text-white hover:bg-[#292c2e] shadow-sm font-bold'
          : 'text-[#62625d] hover:text-[#151719] hover:bg-[#e4dfd6]'
      )}
    >
      {icon}
      {label}
    </Button>
  )
}
