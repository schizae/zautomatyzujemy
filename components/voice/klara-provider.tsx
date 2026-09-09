'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useVoiceCall } from './use-voice-call'

interface KlaraContextValue {
  voice: ReturnType<typeof useVoiceCall>
  isOpen: boolean
  setIsOpen: (open: boolean | ((previous: boolean) => boolean)) => void
  voiceAvailable: boolean
  openChatDraft: (text: string) => void
  pendingDraft: { id: number; text: string } | null
  clearPendingDraft: () => void
}
const KlaraContext = createContext<KlaraContextValue | null>(null)
export function KlaraProvider({ children }: { children: React.ReactNode }) {
  const endpoint = process.env['NEXT_PUBLIC_GLOS_TOKEN_URL']
  const voice = useVoiceCall(endpoint)
  const [isOpen, setIsOpen] = useState(false)
  const draftId = useRef(0)
  const [pendingDraft, setPendingDraft] = useState<KlaraContextValue['pendingDraft']>(null)
  const openChatDraft = useCallback((text: string) => {
    draftId.current += 1
    setPendingDraft({ id: draftId.current, text })
    setIsOpen(true)
  }, [])
  const clearPendingDraft = useCallback(() => setPendingDraft(null), [])
  return <KlaraContext.Provider value={{ voice, isOpen, setIsOpen, voiceAvailable: Boolean(endpoint), openChatDraft, pendingDraft, clearPendingDraft }}>{children}</KlaraContext.Provider>
}
export function useKlara(): KlaraContextValue {
  const context = useContext(KlaraContext)
  if (!context) throw new Error('KlaraProvider is required')
  return context
}
