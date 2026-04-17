'use client'

import '@/sentry.client.config'
import { AuthProvider } from '@/lib/contexts/auth-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
