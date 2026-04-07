'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts/auth-context'
import { LogOut, Mail, Calendar } from 'lucide-react'

interface AccountInfoProps {
  email: string
  createdAt: string
}

export function AccountInfo({ email, createdAt }: AccountInfoProps) {
  const { signOut } = useAuth()

  const formattedDate = new Date(createdAt).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <Mail className="size-4 text-[#70e5ea]" />
        <div>
          <p className="text-on-surface-variant text-xs">Adres e-mail</p>
          <p className="text-on-surface font-medium">{email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <Calendar className="size-4 text-[#70e5ea]" />
        <div>
          <p className="text-on-surface-variant text-xs">Konto utworzone</p>
          <p className="text-on-surface font-medium">{formattedDate}</p>
        </div>
      </div>

      <div className="border-t border-outline-variant pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={signOut}
          className="w-full gap-2 border-outline-variant text-on-surface-variant hover:text-red-400 hover:border-red-400/50 transition-colors"
        >
          <LogOut className="size-4" />
          Wyloguj się
        </Button>
      </div>
    </div>
  )
}
