import { BrandLogo } from '@/components/brand-logo'
import { LoginForm } from './_components/login-form'

export const metadata = { title: 'Logowanie — Admin' }

export default function AdminLoginPage() {
  return (
    <div className="marketing-theme text-[#151719] [color-scheme:light] flex min-h-screen items-center justify-center bg-[#f5f2ed] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <div>
            <h1 className="font-headline text-4xl font-bold text-[#151719]">Panel administratora</h1>
            <p className="mt-1 text-sm text-[#62625d]">Zautomatyzujemy.pl</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#d9d6d0] bg-[#faf8f5] p-6 sm:p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
