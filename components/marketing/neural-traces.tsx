'use client'

import { motion } from 'framer-motion'

const circuits = [
  'M0 160 H70 L110 200 V320 L150 360 H210',
  'M600 100 H530 L490 140 V260 L450 300 H410',
  'M600 460 H540 L500 500 V560 H380',
  'M0 520 H60 L100 480 V420 H160',
]

const nodes: [number, number][] = [[110, 200], [490, 260], [500, 500], [100, 480]]

/**
 * `still` to zatrzymanie dekoracji (pauza, ukryta karta, ograniczony ruch).
 * Pozostałe tryby odwzorowują rzeczywisty stan hooka rozmowy. Odmowa mikrofonu
 * i błąd wracają do `idle` — zamrożona grafika wyglądałaby jak usterka strony,
 * a komunikat o błędzie i tak jest podany tekstem obok.
 */
export type TraceMode = 'still' | 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'

interface Rhythm {
  duration: number
  /** Dodatek czasu na kolejną ścieżkę — rozstraja je, żeby nie pulsowały zgodnie. */
  spread: number
  stagger: number
  peak: number
  /** Sygnał biegnie od formy na zewnątrz zamiast ku niej. */
  outbound: boolean
  /** Tylko jedna ścieżka — bez udawania gotowego połączenia. */
  single: boolean
}

const RHYTHMS: Record<TraceMode, Rhythm> = {
  still: { duration: 0, spread: 0, stagger: 0, peak: 0, outbound: false, single: false },
  idle: { duration: 5, spread: 1, stagger: .4, peak: .75, outbound: false, single: false },
  connecting: { duration: 6, spread: 0, stagger: 0, peak: .5, outbound: false, single: true },
  listening: { duration: 3.4, spread: .3, stagger: .3, peak: .7, outbound: false, single: false },
  thinking: { duration: 1.9, spread: .2, stagger: .16, peak: .9, outbound: false, single: false },
  speaking: { duration: 2.6, spread: .2, stagger: .25, peak: .95, outbound: true, single: false },
}

export function NeuralTraces({ mode }: { mode: TraceMode }) {
  const rhythm = RHYTHMS[mode]
  const frozen = mode === 'still'
  return <svg aria-hidden="true" viewBox="0 0 600 700" preserveAspectRatio="none" className="pointer-events-none h-full w-full">
    {circuits.map((path, index) => {
      const quiet = frozen || (rhythm.single && index > 0)
      return <g key={path}>
        <path d={path} fill="none" stroke="#f5f2ed" strokeOpacity=".12" strokeWidth="1" />
        <motion.path
          d={path}
          fill="none"
          stroke="#f34c30"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="24 600"
          initial={false}
          animate={quiet ? { opacity: 0 } : { strokeDashoffset: rhythm.outbound ? [0, 624] : [624, 0], opacity: [.15, rhythm.peak, .15] }}
          transition={{ duration: quiet ? 0 : rhythm.duration + index * rhythm.spread, delay: quiet ? 0 : index * rhythm.stagger, repeat: quiet ? 0 : Infinity, ease: 'linear' }}
        />
      </g>
    })}
    {nodes.map(([x, y], index) => <motion.circle
      key={`${x}-${y}`}
      cx={x}
      cy={y}
      r="3"
      fill="#f34c30"
      initial={false}
      animate={frozen ? { opacity: .2, r: 2 } : { opacity: [.15, rhythm.peak, .15], r: [2, 4, 2] }}
      transition={{ duration: frozen ? 0 : Math.max(1.4, rhythm.duration * .8), repeat: frozen ? 0 : Infinity, delay: frozen ? 0 : index * (rhythm.stagger + .3) }}
    />)}
  </svg>
}
