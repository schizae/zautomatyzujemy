'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isTextUIPart } from 'ai'
import { useRef, useEffect, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Send, Loader2, Copy, Check, MessageCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { saveChatLeadAction } from '@/lib/actions/chat.actions'

// ─── Stałe ───────────────────────────────────────────────────────────────────

// Strict email regex — wymaga: tekst@domena.rozszerzenie (min 2 znaki rozszerzenia)
// Odrzuca losowe ciągi z @, wymaga sensownej struktury
const EMAIL_REGEX = /[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/

const GREETING = `Witaj w Zautomatyzujemy.pl! W czym mogę Ci pomóc w kwestii automatyzacji i wdrożeń AI?`

const QUICK_REPLIES = [
  'Ile kosztuje automatyzacja?',
  'Jak wygląda współpraca?',
  'Pokaż przykłady wdrożeń',
  'Chcę umówić konsultację',
]

const LS_GREETING = 'zaut_chat_greeting_seen'

// ─── Utilities ────────────────────────────────────────────────────────────────

function playNotificationSound(): void {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.35)
  } catch {}
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function InlineText({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/)
  return (
    <>
      {tokens.map((token, i) => {
        if (/^\*\*[^*]+\*\*$/.test(token))
          return <strong key={i} className="font-semibold text-[#e2e3df]">{token.slice(2, -2)}</strong>
        if (/^\*[^*]+\*$/.test(token))
          return <em key={i}>{token.slice(1, -1)}</em>
        if (/^`[^`]+`$/.test(token))
          return <code key={i} className="rounded bg-[#333533] px-1 font-mono text-xs text-[#70e5ea]">{token.slice(1, -1)}</code>
        return <span key={i}>{token}</span>
      })}
    </>
  )
}

function MarkdownMessage({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  const listBuffer: string[] = []

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return
    elements.push(
      <ul key={key} className="my-1 list-disc space-y-0.5 pl-4">
        {listBuffer.map((item, i) => (
          <li key={i}><InlineText text={item} /></li>
        ))}
      </ul>
    )
    listBuffer.length = 0
  }

  lines.forEach((line, idx) => {
    const key = String(idx)
    if (/^[-•]\s/.test(line)) {
      listBuffer.push(line.slice(2))
      return
    }
    flushList(`list-${idx}`)
    if (line.trim() === '') {
      elements.push(<div key={key} className="h-1.5" />)
    } else if (/^#{2,3}\s/.test(line)) {
      elements.push(
        <p key={key} className="mt-1.5 font-semibold text-[#e2e3df]">
          <InlineText text={line.replace(/^#{2,3}\s/, '')} />
        </p>
      )
    } else {
      elements.push(
        <p key={key} className="leading-relaxed">
          <InlineText text={line} />
        </p>
      )
    }
  })
  flushList('list-end')

  return <div className="space-y-0.5 text-[15px] text-[#bcc9c9]">{elements}</div>
}

// ─── Widget ───────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [greetingStep, setGreetingStep] = useState<'hidden' | 'typing' | 'shown'>(() => {
    if (typeof window === 'undefined') return 'hidden'
    return localStorage.getItem(LS_GREETING) === 'true' ? 'shown' : 'hidden'
  })
  const [unreadCount, setUnreadCount] = useState(0)
  const [leadSaved, setLeadSaved] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevAssistantCount = useRef(0)
  const prevIsLoading = useRef(false)
  const greetingTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const timestampsRef = useRef<Map<string, Date>>(new Map())

  const [, startSaveLead] = useTransition()
  const [chatError, setChatError] = useState<string | null>(null)

  const leadSavedRef = useRef(false)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: () => {
      setChatError('Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie.')
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Obsługa błędów — status 'error' z SDK lub error z onError
  useEffect(() => {
    if (status === 'error' || error) {
      setChatError('Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie.')
    }
  }, [status, error])

  // Wyczyść błąd gdy użytkownik wyśle nową wiadomość
  useEffect(() => {
    if (isLoading) setChatError(null)
  }, [isLoading])
  const showQuickReplies = greetingStep === 'shown' && messages.length === 0 && !isLoading

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [input])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, greetingStep, isLoading])

  // Greeting animation
  useEffect(() => {
    if (isOpen && greetingStep === 'hidden') {
      const t1 = setTimeout(() => setGreetingStep('typing'), 400)
      const t2 = setTimeout(() => {
        setGreetingStep('shown')
        localStorage.setItem(LS_GREETING, 'true')
      }, 1600)
      greetingTimers.current = [t1, t2]
    }
    if (!isOpen) greetingTimers.current.forEach(clearTimeout)
  }, [isOpen, greetingStep])

  // Track timestamps
  useEffect(() => {
    messages.forEach(msg => {
      if (!timestampsRef.current.has(msg.id)) {
        timestampsRef.current.set(msg.id, new Date())
      }
    })
  }, [messages])

  // Unread badge
  useEffect(() => {
    const assistantCount = messages.filter(m => m.role === 'assistant').length
    if (!isOpen && assistantCount > prevAssistantCount.current) {
      setUnreadCount(c => c + (assistantCount - prevAssistantCount.current))
    }
    prevAssistantCount.current = assistantCount
  }, [messages, isOpen])

  // Sound notification
  useEffect(() => {
    if (prevIsLoading.current && !isLoading && messages.some(m => m.role === 'assistant')) {
      playNotificationSound()
    }
    prevIsLoading.current = isLoading
  }, [isLoading, messages])

  // Reset unread
  useEffect(() => {
    if (isOpen) setUnreadCount(0)
  }, [isOpen])

  // Email detection → save lead
  useEffect(() => {
    if (leadSavedRef.current || isLoading || messages.length === 0) return
    let detectedEmail: string | null = null
    for (const msg of messages.filter(m => m.role === 'user')) {
      const text = msg.parts.filter(isTextUIPart).map(p => p.text).join(' ')
      const match = EMAIL_REGEX.exec(text)
      if (match) { detectedEmail = match[0]; break }
    }
    if (!detectedEmail) return
    leadSavedRef.current = true
    const chatMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.parts.filter(isTextUIPart).map(p => p.text).join(' '),
      }))
    startSaveLead(async () => {
      await saveChatLeadAction(detectedEmail!, chatMessages)
      setLeadSaved(true)
    })
  }, [messages, isLoading])

  function submitForm() {
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submitForm()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitForm()
    }
  }

  async function copyMessageText(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-[416px] md:w-[500px] glass-card rounded-3xl border border-[#3d4949]/30 shadow-2xl overflow-hidden flex flex-col mb-2"
          >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="bg-[#70e5ea]/10 p-6 flex items-center gap-4 border-b border-[#3d4949]/20">
              <div className="relative w-10 h-10 rounded-full bg-[#50c9ce] flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Automatek"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full p-1"
                />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold font-headline text-[#e2e3df]">Automatek</h5>
                <p className="text-[10px] text-[#70e5ea] uppercase font-label tracking-widest">
                  Active &amp; Analyzing
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex size-7 items-center justify-center rounded-lg text-[#bcc9c9] transition-colors hover:bg-[#282a28] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* ── Messages ────────────────────────────────────────────────── */}
            <div className="p-6 h-[308px] overflow-y-auto space-y-4 bg-[#121412]/60" aria-live="polite" aria-label="Historia rozmowy">

              {/* Powitanie typing */}
              <AnimatePresence>
                {greetingStep === 'typing' && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#282a28] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <span className="size-1.5 animate-bounce rounded-full bg-[#bcc9c9] [animation-delay:0ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-[#bcc9c9] [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-[#bcc9c9] [animation-delay:300ms]" />
                    </div>
                  </motion.div>
                )}

                {greetingStep === 'shown' && (
                  <motion.div
                    key="greeting"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#282a28] px-4 py-2 rounded-2xl rounded-tl-none text-sm text-[#bcc9c9] max-w-[80%] font-body">
                      {GREETING}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick replies */}
              <AnimatePresence>
                {showQuickReplies && (
                  <motion.div
                    key="quick"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2"
                  >
                    {QUICK_REPLIES.map(reply => (
                      <button
                        key={reply}
                        onClick={() => sendMessage({ text: reply })}
                        className="rounded-full border border-[#3d4949]/50 bg-[#1e201e] px-3 py-1.5 text-sm text-[#bcc9c9] hover:border-[#70e5ea]/50 hover:text-[#70e5ea] transition-all font-label"
                      >
                        {reply}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wiadomości */}
              <AnimatePresence initial={false}>
                {messages.map(message => {
                  const text = message.parts.filter(isTextUIPart).map(p => p.text).join('')
                  const timestamp = timestampsRef.current.get(message.id)
                  const isUser = message.role === 'user'

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn('group flex w-full', isUser ? 'justify-end' : 'justify-start')}
                    >
                      <div className={cn('flex max-w-[80%] flex-col gap-0.5', isUser ? 'items-end' : 'items-start')}>
                        <div
                          className={cn(
                            'px-4 py-2 rounded-2xl text-sm',
                            isUser
                              ? 'bg-[#70e5ea]/20 text-[#70e5ea] rounded-tr-none'
                              : 'bg-[#282a28] text-[#bcc9c9] rounded-tl-none',
                          )}
                        >
                          {!isUser ? <MarkdownMessage text={text} /> : <span className="font-body">{text}</span>}
                        </div>
                        {/* Meta row */}
                        <div className={cn('flex items-center gap-1 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
                          {timestamp && (
                            <span className="text-[10px] text-[#3d4949]">{formatTime(timestamp)}</span>
                          )}
                          <button
                            onClick={() => copyMessageText(text, message.id)}
                            className="flex items-center gap-0.5 text-[10px] text-[#3d4949] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#bcc9c9]"
                          >
                            {copiedId === message.id
                              ? <><Check className="size-2.5 text-[#70e5ea]" /><span className="text-[#70e5ea]">Skopiowano</span></>
                              : <><Copy className="size-2.5" /><span>Kopiuj</span></>
                            }
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Loading dots */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#282a28] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <span className="size-1.5 animate-bounce rounded-full bg-[#bcc9c9] [animation-delay:0ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-[#bcc9c9] [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-[#bcc9c9] [animation-delay:300ms]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {chatError && !isLoading && (
                  <motion.div
                    key="chat-error"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl bg-red-900/20 border border-red-500/20 px-3.5 py-2 text-sm text-red-400 font-body"
                  >
                    <AlertCircle className="size-4 shrink-0" />
                    {chatError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lead saved */}
              <AnimatePresence>
                {leadSaved && (
                  <motion.div
                    key="lead-saved"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-[#70e5ea]/10 border border-[#70e5ea]/20 px-3.5 py-2 text-center text-xs font-medium text-[#70e5ea] font-label"
                  >
                    ✓ Twój kontakt został zapisany. Odezwiemy się wkrótce!
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ───────────────────────────────────────────────────── */}
            <div className="p-4 bg-[#0d0f0d] border-t border-[#3d4949]/10">
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Napisz swoją wiadomość..."
                  disabled={isLoading}
                  rows={1}
                  className="w-full bg-[#1e201e] py-3 pl-4 pr-12 rounded-full border-none focus:ring-1 focus:ring-[#70e5ea]/50 text-base text-[#e2e3df] outline-none resize-none overflow-hidden placeholder-[#3d4949] font-body disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#70e5ea] disabled:opacity-40 hover:brightness-125 transition-all"
                >
                  {isLoading
                    ? <Loader2 className="size-5 animate-spin" />
                    : <Send className="size-5" />
                  }
                </button>
              </form>
              <p className="mt-2 text-center text-[9px] text-[#3d4949] font-label">
                Enter — wyślij · Shift+Enter — nowy wiersz
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB button ──────────────────────────────────────────────────── */}
      <div className="relative">
        <AnimatePresence>
          {unreadCount > 0 && !isOpen && (
            <motion.div
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 z-10 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#121412]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
            isOpen
              ? 'bg-[#282a28] text-[#bcc9c9]'
              : 'bg-gradient-to-br from-[#70e5ea] to-[#50c9ce] text-[#003739] shadow-[0_8px_32px_rgba(112,229,234,0.4)]',
          )}
          aria-label={isOpen ? 'Zamknij czat' : 'Otwórz czat'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="size-7" />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle className="size-7" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}
