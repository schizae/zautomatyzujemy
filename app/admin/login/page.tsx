import { Zap } from 'lucide-react'
import { LoginForm } from './_components/login-form'

export const metadata = { title: 'Logowanie — Admin' }

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-blue-700 shadow-lg">
            <Zap className="size-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Panel Admin</h1>
            <p className="mt-1 text-sm text-slate-500">Zautomatyzujemy.pl</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
