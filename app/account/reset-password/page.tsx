import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { ResetPasswordForm } from './_components/reset-password-form'

export const metadata: Metadata = { title: 'Reset hasła — Zautomatyzujemy.pl' }

export default function ResetPasswordPage() {
  return (
    <div className="marketing-theme text-[#151719] [color-scheme:light] flex min-h-screen items-center justify-center bg-[#f5f2ed] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <div className="mt-2">
            <h1 className="font-headline text-4xl font-semibold tracking-tight text-[#151719]">
              Nie pamiętasz hasła?
            </h1>
            <p className="mt-1 text-sm text-[#62625d]">
              Wyślemy link do ustawienia nowego hasła.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#d9d6d0] bg-[#faf8f5] p-6 sm:p-8 shadow-sm">
          <ResetPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-[#62625d]">
          Pamiętasz hasło?{' '}
          <Link
            href="/account/login"
            className="text-[#c93820] hover:brightness-110 transition-all font-medium"
          >
            Wróć do logowania
          </Link>
        </p>
      </div>
    </div>
  )
}
