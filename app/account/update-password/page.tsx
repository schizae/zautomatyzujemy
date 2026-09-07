import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { createClient } from '@/lib/supabase/server'
import { UpdatePasswordForm } from './_components/update-password-form'

export const metadata: Metadata = { title: 'Nowe hasło — Zautomatyzujemy.pl' }

export default async function UpdatePasswordPage() {
  // Sesję ustawia /auth/callback po kliknięciu linku z maila. Bez niej
  // nie ma czego zmieniać — odsyłamy po nowy link.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/account/reset-password')
  }

  return (
    <div className="marketing-theme text-[#151719] [color-scheme:light] flex min-h-screen items-center justify-center bg-[#f5f2ed] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <div className="mt-2">
            <h1 className="font-headline text-4xl font-semibold tracking-tight text-[#151719]">
              Ustaw nowe hasło
            </h1>
            <p className="mt-1 text-sm text-[#62625d]">{user.email}</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#d9d6d0] bg-[#faf8f5] p-6 sm:p-8 shadow-sm">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  )
}
