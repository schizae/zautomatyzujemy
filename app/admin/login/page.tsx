import { Zap } from 'lucide-react'
import { LoginForm } from './_components/login-form'

export const metadata = { title: 'Logowanie — Admin' }

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-lowest px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-primary shadow-lg shadow-primary/20">
            <Zap className="size-7 text-on-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">Panel Admin</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Zautomatyzujemy.pl</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
