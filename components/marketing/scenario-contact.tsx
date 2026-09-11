'use client'

import { useRef, useState } from 'react'
import { Mail, MessageCircle, Mic, PhoneOff, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useKlara } from '@/components/voice/klara-provider'
import { ContactForm } from './contact-form'
import { track } from '@vercel/analytics'
import type { ScenarioId } from './scenario-scene'

export function ScenarioContact({ message, onMessageChange, custom, visible, scenario }: {
  message: string
  onMessageChange: (message: string) => void
  custom: boolean
  visible: boolean
  scenario: ScenarioId
}) {
  const { voice, voiceAvailable, openChatDraft } = useKlara()
  const [channel, setChannel] = useState<'voice' | 'chat' | 'email' | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const connected = voice.status === 'active' || voice.status === 'connecting'

  function choose(next: 'voice' | 'chat' | 'email') {
    const description = message.trim()
    if (description.length < 10 || description.length > 2000) {
      setError('Opisz pomysł w 10–2000 znakach, aby przekazać go dalej.')
      setChannel(null)
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
      return
    }
    setError('')
    setChannel(next)
    track('scenario_contact_opened', { scenario, channel: next })
    if (next === 'voice' && !connected) void voice.start(description)
    if (next === 'chat') openChatDraft(description)
  }

  return <div hidden={!visible} id="scenario-contact" className="mt-6 border-t border-[#d9d6d0] pt-6">
    <div hidden={channel === 'email'}>
      <label htmlFor="scenario-idea" className="block text-lg font-semibold leading-snug tracking-tight">{custom ? 'Co chciałbyś zmienić lub stworzyć w swojej firmie?' : 'O czym porozmawiamy?'}</label>
      <p id="scenario-idea-help" className="mb-4 mt-2 text-sm leading-relaxed text-[#62625d]">Wystarczy kilka zdań. Nie musisz znać technologii ani mieć gotowego planu.</p>
      <Textarea ref={inputRef} id="scenario-idea" value={message} onChange={event => { onMessageChange(event.target.value); setError('') }} rows={4} aria-describedby={`scenario-idea-help scenario-idea-count${error ? ' scenario-idea-error' : ''}`} aria-invalid={Boolean(error)} placeholder="Chciałbym, żeby moja firma…" className="min-h-32 resize-y rounded-lg border-[#b4b0a9] bg-[#fffdfa] p-4 text-base text-[#151719] placeholder:text-[#77736c] focus-visible:ring-[#c93820]/40" />
      <p id="scenario-idea-count" className="mt-2 text-right text-xs text-[#62625d]">{message.length} / 2000 · minimum 10 znaków</p>
      {error && <p id="scenario-idea-error" role="alert" className="mt-2 text-sm text-[#ac301c]">{error}</p>}
    </div>
    <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[.12em] text-[#62625d]">Jak chcesz porozmawiać?</p>
    <div className="grid gap-2 sm:grid-cols-3">
      <Button onClick={() => choose('voice')} disabled={!voiceAvailable || connected} aria-pressed={channel === 'voice'} className="h-auto min-h-20 flex-col items-start gap-2 whitespace-normal rounded-lg border border-[#b4b0a9] bg-transparent p-3 text-left text-[#151719] hover:border-[#c93820] hover:bg-[#f8d4c9]/30 aria-pressed:border-[#c93820]"><Mic /><span className="text-sm font-semibold">Porozmawiaj z Klarą</span><span className="text-xs font-normal text-[#62625d]">{!voiceAvailable ? 'Głos chwilowo niedostępny' : 'Rozmowa głosowa'}</span></Button>
      <Button onClick={() => choose('chat')} aria-pressed={channel === 'chat'} className="h-auto min-h-20 flex-col items-start gap-2 whitespace-normal rounded-lg border border-[#b4b0a9] bg-transparent p-3 text-left text-[#151719] hover:border-[#c93820] hover:bg-[#f8d4c9]/30 aria-pressed:border-[#c93820]"><MessageCircle /><span className="text-sm font-semibold">Przejdź do czatu</span><span className="text-xs font-normal text-[#62625d]">Rozmowa tekstowa</span></Button>
      <Button onClick={() => choose('email')} aria-pressed={channel === 'email'} className="h-auto min-h-20 flex-col items-start gap-2 whitespace-normal rounded-lg border border-[#b4b0a9] bg-transparent p-3 text-left text-[#151719] hover:border-[#c93820] hover:bg-[#f8d4c9]/30 aria-pressed:border-[#c93820]"><Mail /><span className="text-sm font-semibold">Napisz do nas</span><span className="text-xs font-normal text-[#62625d]">Odpowiemy e-mailem</span></Button>
    </div>
    {channel === 'chat' && <p className="mt-4 text-xs leading-relaxed text-[#62625d]">Otworzyliśmy czat z Twoim opisem. Wyślesz go, gdy będziesz gotowy.</p>}
    {connected && <div role="status" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#151719] p-4 text-sm text-[#f5f2ed]"><span>{voice.status === 'connecting' ? 'Łączę z Klarą…' : 'Trwa rozmowa z Klarą'}</span><Button onClick={voice.stop} className="min-h-11 bg-[#c93820] text-white hover:bg-[#a82e19]"><PhoneOff />{voice.status === 'connecting' ? 'Anuluj' : 'Zakończ rozmowę'}</Button></div>}
    {channel === 'voice' && (voice.status === 'denied' || voice.status === 'error') && <p role="alert" className="mt-4 text-sm text-[#ac301c]">{voice.status === 'denied' ? 'Brak dostępu do mikrofonu. Możesz zmienić uprawnienia przeglądarki lub wybrać czat albo e-mail.' : 'Nie udało się połączyć. Spróbuj ponownie lub wybierz czat albo e-mail. Twój opis jest zachowany.'}</p>}
    <div hidden={channel !== 'email'} className="mt-5 rounded-lg bg-[#151719] p-5 text-[#f5f2ed] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3"><h4 className="text-lg font-semibold">Opowiedz nam o swoim pomyśle</h4><ArrowUpRight className="size-5 text-[#f34c30]" /></div>
      <ContactForm message={message} onMessageChange={onMessageChange} idPrefix="scenario-email" />
    </div>
    <p className="mt-4 text-xs leading-relaxed text-[#62625d]">Opis przekażemy do rozmowy dopiero po Twoim wyborze. E-mail wyślesz osobnym przyciskiem w formularzu.</p>
  </div>
}
