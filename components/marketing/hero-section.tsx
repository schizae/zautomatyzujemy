'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Mic, PhoneOff, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKlara } from '@/components/voice/klara-provider'

export function HeroSection({ content }: { content: Record<string, string> }) {
  const { voice, voiceAvailable, setIsOpen } = useKlara()
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const visible = useInView(ref)
  const [paused, setPaused] = useState(false)
  const moving = visible && !reduced && !paused
  const active = voice.status === 'active'
  const statusText = voice.status === 'connecting' ? 'Łączę z Klarą…' : voice.status === 'denied' ? 'Zezwól na mikrofon w ustawieniach przeglądarki.' : voice.status === 'error' ? 'Nie udało się połączyć. Spróbuj ponownie lub napisz.' : active ? voice.activity === 'speaking' ? 'Klara mówi' : voice.activity === 'thinking' ? 'Klara przygotowuje odpowiedź' : 'Klara słucha' : 'Asystent AI · rozmawiaj lub napisz'
  return (
    <section ref={ref} id="klara" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-12 md:px-8 lg:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#686862]">Mniej rutyny. Więcej przestrzeni na rozwój.</p>
          <h1 className="font-headline text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">{content['hero_title'] ? content['hero_title'].replaceAll('%%', '').replaceAll('{{AI}}', 'AI') : <>Twoja firma.<br />Więcej <span className="font-serif italic font-normal">możliwości.</span>
          </>}</h1>
          <p className="my-8 max-w-lg text-lg leading-relaxed text-[#686862]">{content['hero_description'] || 'AI, automatyzacje, szkolenia, aplikacje i strony internetowe. Dopasowane do Twojego biznesu — od pierwszego pomysłu po działające rozwiązanie.'}</p>
          <Button asChild className="h-auto whitespace-normal bg-[#c93820] px-6 py-4 text-base text-white hover:bg-[#ac301c] motion-safe:hover:-translate-y-1">
            <Link href="/#kontakt">{content['hero_cta_primary'] || 'Sprawdź możliwości dla swojej firmy'}<ArrowUpRight className="ml-3" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-[#686862]">Bezpłatna konsultacja · bez zobowiązań</p>
          <Link href="/#uslugi" className="mt-10 inline-block text-sm underline underline-offset-8">{content['hero_cta_secondary'] || 'Zobacz, co możemy usprawnić'} ↓</Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-[#151719] p-6 text-[#f5f2ed] shadow-2xl md:p-8">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-[#c0bfba]">Poznaj Klarę</span>
            <Button variant="ghost" size="icon" className="text-[#c0bfba] hover:bg-white/10 hover:text-white" aria-label={paused ? 'Włącz animację' : 'Zatrzymaj animację'} onClick={() => setPaused(!paused)}>{paused ? <Play /> : <Pause />}</Button>
          </div>
          <motion.div aria-hidden="true" className="relative mx-auto my-6 aspect-square w-full max-w-80" animate={moving ? { rotate: [0, 8, 0], scale: voice.activity === 'speaking' ? [1, 1.06, 1] : [1, 1.02, 1] } : { rotate: 0, scale: 1 }} transition={{ duration: voice.activity === 'speaking' ? 1.2 : 8, repeat: moving ? Infinity : 0, ease: 'easeInOut' }}>
            <svg viewBox="0 0 400 400" className="h-full w-full">
              <defs>
                <linearGradient id="klara-metal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#454749" />
                  <stop offset=".28" stopColor="#f6f4ef" />
                  <stop offset=".46" stopColor="#888b8e" />
                  <stop offset=".6" stopColor="#202224" />
                  <stop offset=".8" stopColor="#f2f0eb" />
                  <stop offset="1" stopColor="#f34c30" />
                </linearGradient>
              </defs>
              <ellipse cx="200" cy="200" rx="126" ry="112" transform="rotate(-35 200 200)" fill="none" stroke="url(#klara-metal)" strokeWidth="52" />
              <ellipse cx="200" cy="200" rx="87" ry="141" transform="rotate(35 200 200)" fill="none" stroke="url(#klara-metal)" strokeWidth="28" />
            </svg>
          </motion.div>
          <h2 className="font-headline text-3xl tracking-tight">Twój pierwszy kontakt z AI.</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c0bfba]">Zapytaj o pomysł dla swojej firmy. Klara pokaże Ci, jak może wyglądać rozmowa z Twoim asystentem.</p>
          <p role="status" className="my-5 min-h-10 text-sm text-[#ffab98]">{statusText}</p>
          <div className="flex flex-wrap gap-3">
            {voiceAvailable && <Button disabled={voice.status === 'connecting'} onClick={active ? voice.stop : voice.start} className="h-auto bg-[#f34c30] px-5 py-3 text-[#151719] hover:bg-[#ff7259]">{active ? <PhoneOff /> : <Mic />}{active ? 'Zakończ rozmowę' : voice.status === 'connecting' ? 'Łączę…' : 'Rozpocznij rozmowę'}</Button>}
            <Button onClick={() => setIsOpen(true)} className="h-auto border border-white/25 bg-transparent px-5 py-3 text-white hover:bg-white/10">Wolę napisać</Button>
          </div>
        </div>
      </div>
      <div className="mt-16 flex flex-wrap justify-between gap-4 border-t border-[#d9d6d0] pt-6 text-xs uppercase tracking-widest text-[#686862]">
        <span>01 / Możliwości zaczynają się tutaj</span>
        <span>Stworzone dla MŚP i jednoosobowych firm</span>
      </div>
    </section>
  )
}
