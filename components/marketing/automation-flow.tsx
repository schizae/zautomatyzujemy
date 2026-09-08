'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { FileText, Mail, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const message = 'Proszę o ofertę montażu klimatyzacji.'
const fields = [['Temat', 'Montaż klimatyzacji'], ['Źródło', 'E-mail'], ['Status', 'Nowe']]

export function AutomationFlow() {
  const ref = useRef<HTMLDivElement>(null)
  const startedAt = useRef<number | null>(null)
  const visible = useInView(ref, { amount: .25 })
  const reduced = useReducedMotion()
  const [elapsed, setElapsed] = useState<number | null>(null)
  const [replay, setReplay] = useState(0)
  useEffect(() => {
    if (!visible || reduced !== false) return
    startedAt.current ??= performance.now()
    let frame = 0
    const tick = (now: number) => {
      const time = Math.min(4800, now - startedAt.current!)
      setElapsed(time)
      if (time < 4800 && !document.hidden) frame = requestAnimationFrame(tick)
    }
    const resume = () => { cancelAnimationFrame(frame); if (!document.hidden) frame = requestAnimationFrame(tick) }
    resume()
    document.addEventListener('visibilitychange', resume)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', resume) }
  }, [visible, reduced, replay])
  const time = reduced || elapsed === null ? 4800 : elapsed
  const scanning = time >= 1500 && time < 2600
  const complete = time >= 4200
  return <div ref={ref}>
    <div className="grid items-center gap-4 sm:grid-cols-[1fr_2rem_1fr]">
      <div className={`relative min-h-64 overflow-hidden rounded-lg border bg-[#fffdfa] p-5 shadow-[0_12px_32px_-16px_rgba(21,23,25,0.35)] transition-colors duration-700 ${scanning ? 'border-[#c93820]' : 'border-[#d0ccc5]'}`}>
        <div className="mb-5 flex items-center gap-3 border-b border-black/10 pb-4 text-sm"><Mail className="size-5" />Nowa wiadomość</div>
        <p className="text-xs text-[#62625d]">Od: klient@przyklad.pl</p>
        <p className="mt-2 text-xs text-[#62625d]">Temat: Zapytanie o ofertę</p>
        <div className="relative mt-6 leading-relaxed" aria-label={message}>
          <p aria-hidden="true" className="invisible">{message}</p>
          <p aria-hidden="true" className="absolute inset-0">{message.slice(0, Math.floor(time / 38))}<span className={time < 1500 ? 'text-[#c93820]' : 'hidden'}>_</span></p>
        </div>
        {scanning && <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 origin-left border-r-2 border-[#f34c30] bg-[#f34c30]/5" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease: 'linear' }} />}
      </div>
      <svg aria-hidden="true" viewBox="0 0 32 40" className="mx-auto h-10 w-8 rotate-90 sm:rotate-0">
        <path d="M0 20H30M23 13L30 20L23 27" fill="none" stroke="#d0ccc5" strokeWidth="1.5" />
        <motion.path d="M0 20H30M23 13L30 20L23 27" fill="none" stroke="#c93820" strokeWidth="2" initial={false} animate={{ pathLength: time >= 2400 ? 1 : 0 }} transition={{ duration: reduced ? 0 : .65 }} />
      </svg>
      <div className={`min-h-64 rounded-lg border bg-[#fffdfa] p-5 shadow-[0_12px_32px_-16px_rgba(21,23,25,0.35)] transition-colors duration-700 ${complete ? 'border-[#d0ccc5]' : 'border-[#eea38f]'}`}>
        <div className="mb-5 flex items-center gap-3 text-sm font-semibold"><FileText className="size-5" />Nowe zgłoszenie</div>
        <dl className="space-y-4 text-sm">{fields.map(([label, value], index) => <div key={label}>
          <dt className="text-xs text-[#62625d]">{label}</dt>
          <dd className="relative"><span aria-hidden="true" className="invisible">{value}</span><motion.span className={`absolute inset-0 ${index === 2 ? 'text-[#c93820]' : ''}`} initial={false} animate={{ opacity: time >= 2800 + index * 350 ? 1 : 0, y: time >= 2800 + index * 350 || reduced ? 0 : 8 }} transition={{ duration: reduced ? 0 : .55 }}>{value}</motion.span></dd>
        </div>)}</dl>
        <motion.p initial={false} animate={{ opacity: complete ? 1 : 0, y: complete || reduced ? 0 : 8 }} transition={{ duration: reduced ? 0 : .7 }} className="mt-5 rounded-md border border-[#eea38f] bg-[#f8d4c9] p-3 text-sm">✓ Szkic odpowiedzi gotowy</motion.p>
      </div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#62625d]">
      <div aria-hidden="true" className="flex gap-3 font-mono"><span className={time < 2400 ? 'text-[#c93820]' : ''}>01 / odczyt</span><span className={time >= 2400 && !complete ? 'text-[#c93820]' : ''}>02 / struktura</span><span className={complete ? 'text-[#c93820]' : ''}>03 / gotowe</span></div>
      <Button variant="ghost" disabled={!complete} onClick={() => { startedAt.current = null; setElapsed(0); setReplay(previous => previous + 1) }} className="h-auto gap-2 p-1 text-xs text-[#62625d] hover:bg-black/5 hover:text-[#c93820] motion-reduce:hidden"><RotateCcw className="size-3" />Powtórz animację</Button>
    </div>
  </div>
}
