'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Mic, PhoneOff, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKlara } from '@/components/voice/klara-provider'
import { DrawLine, FadeInUp, RevealText } from '@/components/animations'

export function HeroSection({ content }: { content: Record<string, string> }) {
  const { voice, voiceAvailable, setIsOpen } = useKlara()
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const visible = useInView(ref)
  const [paused, setPaused] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === 'visible')
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  const moving = visible && pageVisible && reduced === false && !paused
  const active = voice.status === 'active'
  const statusText = voice.status === 'connecting' ? 'Łączę z Klarą…' : voice.status === 'denied' ? 'Zezwól na mikrofon w ustawieniach przeglądarki.' : voice.status === 'error' ? 'Nie udało się połączyć. Spróbuj ponownie lub napisz.' : active ? voice.activity === 'speaking' ? 'Klara mówi' : voice.activity === 'thinking' ? 'Klara przygotowuje odpowiedź' : 'Klara słucha' : 'Asystent AI · rozmawiaj lub napisz'
  return (
    <section ref={ref} id="klara" className="mx-auto max-w-[1680px] scroll-mt-24 px-6 py-12 md:px-8 lg:py-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
        <div className="min-w-0">
          <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#62625d]">AI. Automatyzacje. Dobrze zaprojektowany biznes.</p>
          <h1 className="font-body text-5xl font-extrabold leading-[1.04] tracking-[-0.06em] sm:text-6xl lg:text-[clamp(3rem,6.2vw,6.5rem)]"><RevealText>Twoja firma.</RevealText><br /><RevealText delay={.1}>Więcej</RevealText>{' '}<RevealText delay={.2} className="relative font-editorial font-normal italic tracking-[-0.065em]">możliwości.<DrawLine /></RevealText></h1>
          <FadeInUp delay={.3}>
          <p className="my-8 max-w-xl text-xl xl:text-[28px] leading-relaxed text-[#62625d]">Strony, aplikacje i AI, które usprawniają codzienną pracę.</p>
          <Button asChild className="h-auto whitespace-normal bg-[#c93820] rounded-md px-7 py-5 text-base xl:text-lg text-white hover:bg-[#ac301c] duration-200 motion-safe:active:scale-[.98]">
            <Link href="/#kontakt">Sprawdź możliwości dla swojej firmy<ArrowUpRight className="ml-3 transition-transform duration-200 motion-safe:group-hover/button:translate-x-1 motion-safe:group-hover/button:-translate-y-1 motion-safe:group-focus-visible/button:translate-x-1" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-[#62625d]">Zacznij od bezpłatnej rozmowy.</p>
          </FadeInUp>
        </div>
        <div className="relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden rounded-xl bg-[#101214] p-7 text-[#f5f2ed] lg:min-h-[620px] xl:min-h-[700px] md:p-9">
          <div className="absolute inset-x-7 top-6 z-20 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-[#dedbd5]"><span aria-hidden="true" className="mr-3 inline-block size-2.5 rounded-full bg-[#f34c30]" />KLARA / ASYSTENT AI</span>
            <Button variant="ghost" size="icon" className="text-[#dedbd5] hover:bg-white/10 hover:text-white motion-reduce:hidden" aria-label={paused ? 'Włącz animację' : 'Zatrzymaj animację'} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play /> : <Pause />}</Button>
          </div>
          <motion.div aria-hidden="true" className="absolute inset-0 -z-20" animate={moving ? { rotate: [0, 2, 0], scale: active && voice.activity === 'speaking' ? [1, 1.06, 1] : [1, 1.02, 1] } : { rotate: 0, scale: 1 }} transition={{ duration: !moving ? 0 : active && voice.activity === 'speaking' ? 1.2 : 8, repeat: moving ? Infinity : 0, ease: 'easeInOut' }}>
            <Image src="/redesign/klara-metal-v2.webp" alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain object-center" />
          </motion.div>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/5 to-transparent" /><h2 className="font-body text-4xl xl:text-5xl font-semibold tracking-tight">Poznaj Klarę.</h2>
          <p className="mt-3 text-base leading-relaxed text-[#dedbd5]">Opowiedz, czego potrzebuje Twoja firma.</p>
          <p role="status" className="my-3 min-h-5 text-xs text-[#ffab98]">{statusText}</p>
          <div className="flex flex-col items-start gap-4">
            <Button disabled={!voiceAvailable || voice.status === 'connecting'} onClick={active ? voice.stop : voice.start} className="max-w-full min-h-14 h-auto whitespace-normal gap-3 rounded-md bg-[#c93820] px-6 py-4 text-base text-white hover:bg-[#a82e19] disabled:opacity-70">{active ? <PhoneOff /> : <Mic />}{!voiceAvailable ? 'Rozmowa głosowa niedostępna' : active ? 'Zakończ rozmowę' : voice.status === 'connecting' ? 'Łączę…' : 'Rozpocznij rozmowę'}</Button>
            <Button onClick={() => setIsOpen(true)} className="h-auto rounded-none border-0 border-b border-white/60 bg-transparent p-0 pb-1 text-base text-white hover:bg-white/10">Wolę napisać <ArrowUpRight className="ml-2" /></Button>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-[#d9d6d0] pt-6 text-xs uppercase tracking-widest text-[#62625d]">
        <span>01 / Możliwości zaczynają się tutaj</span>
        <Link href="/#uslugi" className="normal-case tracking-normal underline-offset-4 hover:underline">{content['hero_cta_secondary'] || 'Przewiń, zobacz więcej'} ↓</Link>
      </div>
    </section>
  )
}
