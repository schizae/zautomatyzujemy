import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { RegisterForm } from './_components/register-form'

export const metadata: Metadata = { title: 'Rejestracja — Zautomatyzujemy.pl' }

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-lowest px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Zautomatyzujemy.pl logo"
              width={40}
              height={40}
              className="rounded-full brightness-110"
            />
            <span className="font-headline text-xl font-bold text-primary group-hover:brightness-110 transition-all">
              zautomatyzujemy.pl
            </span>
          </Link>
          <div className="mt-2">
            <h1 className="font-headline text-2xl font-bold text-on-surface">Utwórz konto</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Masz już konto?{' '}
              <Link href="/account/login" className="text-primary hover:brightness-110 transition-all font-medium">
                Zaloguj się
              </Link>
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
