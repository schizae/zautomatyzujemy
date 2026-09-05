'use client'

import Image from 'next/image'
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
    <section ref={ref} id="klara" className="mx-auto max-w-[1600px] scroll-mt-24 px-6 py-12 md:px-8 lg:py-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
        <div>
          <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#686862]">AI. Automatyzacje. Dobrze zaprojektowany biznes.</p>
          <h1 className="font-body text-5xl font-extrabold leading-[1.04] tracking-[-0.065em] sm:text-6xl xl:text-[clamp(4rem,5.5vw,6.5rem)]">Twoja firma.<br />Więcej <span className="font-editorial font-normal italic tracking-[-0.04em] underline decoration-[#f34c30] decoration-2 underline-offset-[12px]">możliwości.</span></h1>
          <p className="my-10 max-w-xl text-xl md:text-2xl leading-relaxed text-[#686862]">Strony, aplikacje i AI, które usprawniają codzienną pracę.</p>
          <Button asChild className="h-auto whitespace-normal bg-[#e84324] rounded-md px-7 py-5 text-base text-white hover:bg-[#ac301c] motion-safe:hover:-translate-y-1">
            <Link href="/#kontakt">{content['hero_cta_primary'] || 'Sprawdź możliwości dla swojej firmy'}<ArrowUpRight className="ml-3" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-[#686862]">Zacznij od bezpłatnej rozmowy.</p>
          <Link href="/#uslugi" className="mt-10 inline-block text-sm underline underline-offset-8">{content['hero_cta_secondary'] || 'Zobacz, co możemy usprawnić'} ↓</Link>
        </div>
        <div className="relative isolate flex min-h-[580px] flex-col justify-end overflow-hidden rounded-xl bg-[#101214] p-7 text-[#f5f2ed] lg:min-h-[670px] xl:min-h-[740px] md:p-9">
          <div className="absolute inset-x-7 top-6 z-20 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-[#c0bfba]">KLARA / ASYSTENT AI</span>
            <Button variant="ghost" size="icon" className="text-[#c0bfba] hover:bg-white/10 hover:text-white" aria-label={paused ? 'Włącz animację' : 'Zatrzymaj animację'} onClick={() => setPaused(!paused)}>{paused ? <Play /> : <Pause />}</Button>
          </div>
          <motion.div aria-hidden="true" className="absolute inset-0 -z-20" animate={moving ? { rotate: [0, 8, 0], scale: voice.activity === 'speaking' ? [1, 1.06, 1] : [1, 1.02, 1] } : { rotate: 0, scale: 1 }} transition={{ duration: voice.activity === 'speaking' ? 1.2 : 8, repeat: moving ? Infinity : 0, ease: 'easeInOut' }}>
            <Image src="/redesign/klara-metal.webp" alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
          </motion.div>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/10 to-transparent" /><h2 className="font-body text-4xl font-semibold tracking-tight">Poznaj Klarę.</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c0bfba]">Opowiedz, czego potrzebuje Twoja firma.</p>
          <p role="status" className="my-3 min-h-5 text-sm text-[#ffab98]">{statusText}</p>
          <div className="flex flex-col items-start gap-4">
            {voiceAvailable && <Button disabled={voice.status === 'connecting'} onClick={active ? voice.stop : voice.start} className="h-auto bg-[#f34c30] px-5 py-3 text-white hover:bg-[#d7371b]">{active ? <PhoneOff /> : <Mic />}{active ? 'Zakończ rozmowę' : voice.status === 'connecting' ? 'Łączę…' : 'Rozpocznij rozmowę'}</Button>}
            <Button onClick={() => setIsOpen(true)} className="h-auto rounded-none border-b border-white/60 bg-transparent p-0 pb-1 text-white hover:bg-white/10">Wolę napisać</Button>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-[#d9d6d0] pt-6 text-xs uppercase tracking-widest text-[#686862]">
        <span>01 / Możliwości zaczynają się tutaj</span>
        <span>Stworzone dla MŚP i jednoosobowych firm</span>
      </div>
    </section>
  )
}
