'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Check, FileText, Mail, Pause, Play, RotateCcw, SkipForward, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ScenarioId = 'website' | 'support' | 'workflow' | 'idea'
type DemoId = Exclude<ScenarioId, 'idea'>
const duration = 7000
const stages = ['Twoja potrzeba', 'Łączymy elementy', 'Gotowe do działania']
const descriptions: Record<DemoId, { title: string; result: string }> = {
  website: { title: 'Od pierwszego wrażenia do zapytania.', result: 'Strona, która jasno przedstawia ofertę i ułatwia kontakt.' },
  support: { title: 'Każde zapytanie na swoim miejscu.', result: 'Zapytania uporządkowane. Odpowiedź przygotowana do sprawdzenia.' },
  workflow: { title: 'Informacje płyną. Praca idzie dalej.', result: 'Mniej przepisywania. Więcej czasu na właściwą pracę.' },
}

export function ScenarioScene({ scenario }: { scenario: DemoId }) {
  const container = useRef<HTMLDivElement>(null)
  const animations = useRef<Animation[]>([])
  const visible = useInView(container, { amount: .25 })
  const preference = useReducedMotion()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  // The server and first client render both show the complete, readable scene.
  const reduced = hydrated ? preference : null
  const [paused, setPaused] = useState(false)
  const [run, setRun] = useState(0)
  const [stage, setStage] = useState(0)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (!container.current || reduced !== false) return
    animations.current = Array.from(container.current.querySelectorAll<HTMLElement>('[data-scene-motion]')).map(element => {
      const kind = element.dataset.sceneMotion
      const frames = kind === 'result'
        ? [{ opacity: 0, transform: 'translateY(16px)', offset: 0 }, { opacity: 0, transform: 'translateY(16px)', offset: .63 }, { opacity: 1, transform: 'translateY(0)', offset: .84 }, { opacity: 1, transform: 'translateY(0)', offset: 1 }]
        : kind === 'signal'
          ? [{ transform: 'scaleX(0)', offset: 0 }, { transform: 'scaleX(0)', offset: .25 }, { transform: 'scaleX(1)', offset: .64 }, { transform: 'scaleX(1)', offset: 1 }]
          : [{ opacity: 0, transform: 'translateY(24px) rotate(-3deg)', offset: 0 }, { opacity: 1, transform: 'translateY(0) rotate(0deg)', offset: .25 }, { opacity: 1, transform: 'translateY(0) rotate(0deg)', offset: 1 }]
      const animation = element.animate(frames, { duration, fill: 'both', easing: 'cubic-bezier(.22,.61,.36,1)' })
      animation.pause()
      return animation
    })
    return () => { animations.current.forEach(animation => animation.cancel()); animations.current = [] }
  }, [reduced, run])

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const elapsed = Number(animations.current[0]?.currentTime ?? 0)
      setStage(elapsed < 2300 ? 0 : elapsed < 4900 ? 1 : 2)
      setComplete(elapsed >= duration)
      if (elapsed < duration) frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      const playing = visible && !paused && !document.hidden && reduced === false
      animations.current.forEach(animation => {
        if (playing && Number(animation.currentTime ?? 0) < duration) animation.play()
        else animation.pause()
      })
      if (playing) frame = requestAnimationFrame(tick)
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', sync) }
  }, [visible, paused, reduced, run])

  const finished = reduced !== false || complete
  const activeStage = reduced !== false ? 2 : stage
  function finish() {
    animations.current.forEach(animation => { animation.currentTime = duration; animation.pause() })
    setComplete(true)
    setStage(2)
  }

  return <div ref={container} data-testid="scenario-scene">
    <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[.14em] text-[#62625d]">
      <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#c93820]" />Demonstracja</span>
      <span>Przykładowy przebieg</span>
    </div>
    <h3 className="mt-6 max-w-lg text-3xl font-semibold leading-[1.12] tracking-[-.045em] sm:text-4xl">{descriptions[scenario].title}</h3>
    <div className="relative my-8 overflow-hidden rounded-lg border border-[#d9d6d0] bg-[#ebe7df] p-4 sm:p-6" data-testid="scene-stage" data-stage={activeStage}>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      {scenario === 'website' ? <WebsiteDemo /> : <ProcessDemo scenario={scenario} />}
      <div className="mt-6 flex items-center justify-between gap-2 border-t border-[#d0ccc5] pt-4 text-[10px] uppercase tracking-widest text-[#62625d]" aria-hidden="true">
        {stages.map((label, index) => <span key={label} className={activeStage === index ? 'font-semibold text-[#c93820]' : ''}><span className="mr-1">0{index + 1}</span><span className="hidden sm:inline">{label}</span></span>)}
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-1 border-b border-[#d9d6d0] pb-4">
      <span className="mr-auto text-xs text-[#62625d]" role="status">{finished ? 'Rezultat' : paused ? 'Pokaz zatrzymany' : stages[activeStage]}</span>
      <Button variant="ghost" disabled={finished} onClick={() => setPaused(value => !value)} className="min-h-11 text-[#62625d] hover:bg-black/5" aria-label={paused ? 'Wznów pokaz' : 'Zatrzymaj pokaz'}>{paused ? <Play /> : <Pause />}</Button>
      <Button variant="ghost" disabled={reduced !== false} onClick={() => { setComplete(false); setStage(0); setPaused(false); setRun(value => value + 1) }} className="min-h-11 text-[#62625d] hover:bg-black/5" aria-label="Powtórz pokaz"><RotateCcw /></Button>
      <Button variant="ghost" disabled={finished} onClick={finish} className="min-h-11 text-[#62625d] hover:bg-black/5" aria-label="Pokaż rezultat"><SkipForward /></Button>
    </div>
    <p className="mt-5 min-h-12 text-sm leading-relaxed text-[#62625d]">{descriptions[scenario].result}</p>
  </div>
}

function WebsiteDemo() {
  return <div className="relative min-h-80 pb-14 sm:min-h-80">
    <div data-scene-motion="intro" className="overflow-hidden rounded-lg border border-[#c8c4bc] bg-[#fffdfa] shadow-[0_12px_35px_-24px_#151719]">
      <div className="flex items-center gap-1.5 border-b border-[#e6e2dc] px-4 py-3" aria-hidden="true"><span className="size-1.5 rounded-full bg-[#c93820]" /><span className="size-1.5 rounded-full bg-[#d9d6d0]" /><span className="size-1.5 rounded-full bg-[#d9d6d0]" /><span className="ml-auto font-mono text-[10px] text-[#62625d]">twoja-firma.pl</span></div>
      <div className="grid grid-cols-[1.2fr_.8fr] gap-4 p-5 sm:p-7">
        <div><p className="mb-3 text-[9px] uppercase tracking-[.18em] text-[#62625d]">Twoja marka. Twój kierunek.</p><p className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">Dobra oferta.<br /><span className="font-editorial font-normal italic">Dobry początek.</span></p><div className="mt-5 flex w-fit items-center gap-3 rounded bg-[#c93820] px-3 py-2 text-[10px] text-white">Porozmawiajmy <ArrowUpRight className="size-3" /></div></div>
        <div className="relative flex items-center justify-center overflow-hidden rounded bg-[#151719]" aria-hidden="true"><div className="h-28 w-12 -rotate-[30deg] rounded-full border-4 border-[#b4b0a9] bg-gradient-to-r from-[#292b2d] via-[#eeece7] to-[#636460] shadow-xl" /><div className="absolute h-16 w-8 rotate-[35deg] rounded-full border-2 border-[#e46845]" /></div>
      </div>
    </div>
    <div data-scene-motion="signal" className="absolute bottom-12 left-1/2 h-14 w-px origin-top bg-[#c93820]" aria-hidden="true" />
    <div data-scene-motion="result" className="absolute bottom-0 right-0 flex w-[92%] items-start gap-3 rounded-lg border border-[#d5c6bb] bg-[#fffdfa] p-4 shadow-[0_10px_30px_-18px_#151719] sm:w-4/5"><span className="rounded-full bg-[#f8d4c9] p-2 text-[#c93820]"><Mail className="size-4" /></span><div><p className="text-xs font-semibold">Nowe zapytanie przez stronę</p><p className="mt-1 text-xs leading-relaxed text-[#62625d]">„Podoba mi się Wasza oferta. Porozmawiajmy”.</p></div></div>
  </div>
}

function ProcessDemo({ scenario }: { scenario: 'support' | 'workflow' }) {
  const support = scenario === 'support'
  return <div className="min-h-80">
    <div className="grid gap-3 sm:grid-cols-2">
      <div data-scene-motion="intro" className="rounded-lg border border-[#d0ccc5] bg-[#fffdfa] p-4 sm:p-5">
        <p className="flex items-center gap-2 text-xs font-semibold">{support ? <Mail className="size-4" /> : <FileText className="size-4" />}{support ? 'Nowa wiadomość' : 'Dokumenty i zadania'}</p>
        <p className="mt-5 text-[10px] uppercase tracking-wider text-[#62625d]">{support ? 'Zapytanie o ofertę' : 'Do uporządkowania'}</p>
        <p className="mt-2 text-sm leading-relaxed">{support ? 'Proszę o ofertę montażu klimatyzacji.' : 'Zamówienie, dane klienta i termin realizacji.'}</p>
        <div className="mt-5 flex gap-2" aria-hidden="true"><span className="h-1 w-16 rounded bg-[#e6e2dc]" /><span className="h-1 w-8 rounded bg-[#e6e2dc]" /></div>
      </div>
      <div data-scene-motion="intro" className="flex flex-col justify-center rounded-lg bg-[#151719] p-5 text-[#f5f2ed]">
        <Sparkles className="mb-4 size-5 text-[#f34c30]" /><p className="text-lg font-semibold tracking-tight">{support ? 'Klara porządkuje dane.' : 'Narzędzia pracują razem.'}</p><p className="mt-2 text-xs leading-relaxed text-[#b9b7b2]">{support ? 'Temat, potrzeba i następny krok.' : 'Informacje trafiają na swoje miejsce.'}</p>
      </div>
    </div>
    <div className="relative mx-6 my-5 h-px bg-[#d0ccc5]" aria-hidden="true"><div data-scene-motion="signal" className="absolute inset-0 origin-left bg-[#c93820]" /></div>
    <div data-scene-motion="result" className="flex items-start gap-3 rounded-lg border border-[#d5c6bb] bg-[#fffdfa] p-4 sm:p-5"><span className="rounded-full bg-[#f8d4c9] p-2 text-[#c93820]"><Check className="size-4" /></span><div className="min-w-0"><p className="text-sm font-semibold">{support ? 'Zgłoszenie gotowe do obsługi' : 'Zadanie gotowe do realizacji'}</p><p className="mt-1 text-xs leading-relaxed text-[#62625d]">{support ? 'Montaż klimatyzacji · szkic odpowiedzi do sprawdzenia' : 'Dane zebrane · termin przypisany · zespół poinformowany'}</p></div></div>
  </div>
}
