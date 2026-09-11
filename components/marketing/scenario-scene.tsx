'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WebsiteAct } from './website-scenes'
import { SupportAct, WorkflowAct } from './process-scenes'

export type ScenarioId = 'website' | 'support' | 'workflow' | 'idea'
type DemoId = Exclude<ScenarioId, 'idea'>
type Act = 0 | 1 | 2
const duration = 12000
const acts: Act[] = [0, 1, 2]
const stories = {
  website: { title: 'Twoja oferta. W najlepszym świetle.', steps: ['Pomysł', 'Projekt', 'Zapytanie'], captions: ['Najpierw poznajemy ofertę i odbiorców Twojej firmy.', 'Treść, fotografia i układ tworzą spójną stronę.', 'Czytelna oferta prowadzi do konkretnej rozmowy.'] },
  support: { title: 'Od wiadomości do następnego kroku.', steps: ['Wiadomość', 'Zrozumienie', 'Odpowiedź'], captions: ['Zapytanie klienta trafia do wspólnej skrzynki.', 'Asystent rozpoznaje temat i porządkuje istotne informacje.', 'Dostajesz kompletne zgłoszenie i szkic odpowiedzi do sprawdzenia.'] },
  workflow: { title: 'Mniej ręcznej pracy. Więcej porządku.', steps: ['Dokumenty', 'Porządkowanie', 'Działanie'], captions: ['Informacje są rozproszone w dokumentach i wiadomościach.', 'System odczytuje pola i dopasowuje je do właściwego zlecenia.', 'Zespół otrzymuje uporządkowane zadania z potrzebnymi danymi.'] },
}

function framesFor(index: Act): Keyframe[] {
  const shown = { opacity: 1, visibility: 'visible', filter: 'blur(0px)', transform: 'scale(1)' }
  const hidden = { opacity: 0, visibility: 'hidden', filter: 'blur(4px)', transform: 'scale(1.012)' }
  if (index === 0) return [{ ...shown, offset: 0 }, { ...shown, offset: .29 }, { ...hidden, offset: 1 / 3 }, { ...hidden, offset: 1 }]
  if (index === 1) return [{ ...hidden, offset: 0 }, { ...hidden, offset: .29 }, { ...shown, offset: 1 / 3 }, { ...shown, offset: .62 }, { ...hidden, offset: 2 / 3 }, { ...hidden, offset: 1 }]
  return [{ ...hidden, offset: 0 }, { ...hidden, offset: .62 }, { ...shown, offset: 2 / 3 }, { ...shown, offset: 1 }]
}

export function ScenarioScene({ scenario }: { scenario: DemoId }) {
  const container = useRef<HTMLDivElement>(null)
  const animations = useRef<Animation[]>([])
  const visible = useInView(container, { amount: .2 })
  const preference = useReducedMotion()
  const [hydrated, setHydrated] = useState(false)
  const [paused, setPaused] = useState(false)
  const [run, setRun] = useState(0)
  const [stage, setStage] = useState<Act>(2)
  const [complete, setComplete] = useState(false)
  const reduced = !hydrated || preference !== false
  const story = stories[scenario]
  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (reduced) { setStage(2); return }
    if (!container.current) return
    setStage(0)
    animations.current = Array.from(container.current.querySelectorAll<HTMLElement>('[data-scene-motion]')).map((element, index) => {
      const animation = element.animate(framesFor(acts[index] ?? 2), { duration, fill: 'both', easing: 'linear' })
      animation.pause()
      return animation
    })
    container.current.querySelectorAll<HTMLElement>('[data-story-detail]').forEach(element => {
      const start = Number(element.dataset.storyDetail)
      const animation = element.animate([{ opacity: 0, offset: 0 }, { opacity: 0, offset: start, easing: 'ease-out' }, { opacity: 1, offset: start + .06 }, { opacity: 1, offset: 1 }], { duration, fill: 'both', easing: 'linear' })
      animation.pause()
      animations.current.push(animation)
    })
    return () => { animations.current.forEach(animation => animation.cancel()); animations.current = [] }
  }, [reduced, run])

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const elapsed = Number(animations.current[0]?.currentTime ?? 0)
      setStage(elapsed < 4000 ? 0 : elapsed < 8000 ? 1 : 2)
      setComplete(elapsed >= duration)
      if (elapsed < duration) frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      const playing = visible && !paused && !document.hidden && !reduced
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

  function selectAct(act: Act, finish = false) {
    animations.current.forEach(animation => { animation.currentTime = finish ? duration : act * 4000 + 3000; animation.pause() })
    setStage(act)
    setPaused(true)
    setComplete(finish)
  }
  const finished = reduced || complete

  return <div ref={container} data-testid="scenario-scene">
    <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[.14em] text-[#62625d]"><span>Przykładowy scenariusz</span><span>0{stage + 1} / 03</span></div>
    <h3 className="mb-7 mt-5 max-w-lg text-3xl font-semibold leading-[1.12] tracking-[-.045em] sm:text-4xl">{story.title}</h3>
    <div className="relative isolate h-[560px] overflow-hidden rounded-lg bg-[#141a1d] sm:h-[460px]" data-testid="scene-stage" data-stage={stage}>
      {acts.map(act => <div key={act} data-scene-motion={act} data-act={act} aria-hidden={stage !== act} className={`absolute inset-0 px-3 py-5 sm:p-7 ${reduced && stage === act ? 'visible' : 'invisible'}`}>
        {scenario === 'website' ? <WebsiteAct stage={act} /> : scenario === 'support' ? <SupportAct stage={act} /> : <WorkflowAct stage={act} />}
      </div>)}
    </div>
    <div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="Etapy demonstracji">
      {acts.map(act => <Button key={act} onClick={() => selectAct(act)} aria-pressed={stage === act} className={`h-auto min-h-14 flex-col items-start gap-2 whitespace-normal rounded-none border-0 border-t-2 bg-transparent px-0 py-3 text-left hover:bg-transparent ${stage === act ? 'border-[#c93820] text-[#151719]' : 'border-[#d0ccc5] text-[#62625d]'}`}><span className="text-[10px]">0{act + 1}</span><span className="text-xs font-medium sm:text-sm">{story.steps[act]}</span></Button>)}
    </div>
    <p className="mt-3 min-h-14 text-sm leading-relaxed text-[#555852]" role="status">{story.captions[stage]}</p>
    <div className="mt-3 flex items-center gap-1 border-t border-[#d0ccc5] pt-3">
      <span className="mr-auto text-xs text-[#62625d]">{finished ? 'Rezultat' : paused ? 'Pokaz zatrzymany' : 'Zobacz, jak to działa'}</span>
      <Button variant="ghost" disabled={finished} onClick={() => setPaused(value => !value)} className="min-h-11 text-[#555852] hover:bg-black/5" aria-label={paused ? 'Wznów pokaz' : 'Zatrzymaj pokaz'}>{paused ? <Play /> : <Pause />}</Button>
      <Button variant="ghost" disabled={reduced} onClick={() => { setComplete(false); setStage(0); setPaused(false); setRun(value => value + 1) }} className="min-h-11 text-[#555852] hover:bg-black/5" aria-label="Powtórz pokaz"><RotateCcw /></Button>
      <Button variant="ghost" disabled={finished} onClick={() => selectAct(2, true)} className="min-h-11 text-[#555852] hover:bg-black/5" aria-label="Pokaż rezultat"><SkipForward /></Button>
    </div>
  </div>
}
