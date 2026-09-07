import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { AccountLoginForm } from './_components/account-login-form'

export const metadata: Metadata = { title: 'Logowanie — Zautomatyzujemy.pl' }

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AccountLoginPage({ searchParams }: PageProps) {
  // Czytamy parametr na serwerze — useSearchParams w formularzu wypychalo
  // caly komponent do klienta, przez co karta byla pusta az do hydracji.
  const params = await searchParams
  const linkError = params['error'] === 'link'

  return (
    <div className="marketing-theme text-[#151719] [color-scheme:light] flex min-h-screen items-center justify-center bg-[#f5f2ed] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <div className="mt-2">
            <h1 className="font-headline text-4xl font-semibold tracking-tight text-[#151719]">Zaloguj się</h1>
            <p className="mt-1 text-sm text-[#62625d]">
              Nie masz konta?{' '}
              <Link href="/account/register" className="text-[#c93820] hover:brightness-110 transition-all font-medium">
                Zarejestruj się
              </Link>
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#d9d6d0] bg-[#faf8f5] p-6 sm:p-8 shadow-sm">
          <AccountLoginForm linkError={linkError} />
        </div>
      </div>
    </div>
  )
}
