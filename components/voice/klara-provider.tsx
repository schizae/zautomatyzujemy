'use client'

import { createContext, useContext, useState } from 'react'
import { useVoiceCall } from './use-voice-call'

interface KlaraContextValue {
  voice: ReturnType<typeof useVoiceCall>
  isOpen: boolean
  setIsOpen: (open: boolean | ((previous: boolean) => boolean)) => void
  voiceAvailable: boolean
}
const KlaraContext = createContext<KlaraContextValue | null>(null)
export function KlaraProvider({ children }: { children: React.ReactNode }) {
  const endpoint = process.env['NEXT_PUBLIC_GLOS_TOKEN_URL']
  const voice = useVoiceCall(endpoint)
  const [isOpen, setIsOpen] = useState(false)
  return <KlaraContext.Provider value={{ voice, isOpen, setIsOpen, voiceAvailable: Boolean(endpoint) }}>{children}</KlaraContext.Provider>
}
export function useKlara(): KlaraContextValue {
  const context = useContext(KlaraContext)
  if (!context) throw new Error('KlaraProvider is required')
  return context
}
