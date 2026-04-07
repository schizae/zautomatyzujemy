import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import { ProfileForm } from './_components/profile-form'
import { ChangePasswordForm } from './_components/change-password-form'
import { AccountInfo } from './_components/account-info'

export const metadata: Metadata = { title: 'Ustawienia konta — Zautomatyzujemy.pl' }

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/account/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const typedProfile = profile as Profile | null

  if (!typedProfile) {
    redirect('/account/login')
  }

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
            <h1 className="font-headline text-2xl font-bold text-on-surface">Ustawienia konta</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Zarządzaj swoimi danymi i hasłem
            </p>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-6 shadow-sm mb-4">
          <AccountInfo email={typedProfile.email} createdAt={typedProfile.created_at} />
        </div>

        {/* Profile Form */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-6 shadow-sm mb-4">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Dane osobowe</h2>
          <ProfileForm profile={typedProfile} />
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-6 shadow-sm">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Zmiana hasła</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
