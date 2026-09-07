'use client'

import { MotionConfig } from 'framer-motion'
import { KlaraProvider } from '@/components/voice/klara-provider'
import { AuthProvider } from '@/lib/contexts/auth-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user"><AuthProvider><KlaraProvider>{children}</KlaraProvider></AuthProvider></MotionConfig>
}
