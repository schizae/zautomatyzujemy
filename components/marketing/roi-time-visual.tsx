'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { AnimatedValue } from './animated-value'

// Bez wymuszonego miejsca po przecinku — 66 zostaje „66 h", 46,2 zostaje „46,2 h",
// a klatki pośrednie animacji nie pokazują ośmiu cyfr.
const hours = (value: number): string =>
  `${value.toLocaleString('pl-PL', { maximumFractionDigits: 1 })} h`

/**
 * Podział miesięcznego czasu na pracę odzyskaną i pozostającą.
 *
 * Cały pasek to ten sam miesięczny czas, więc obie porównywane części mają
 * jedną, widoczną skalę. Proporcja 70/30 jest stała — to założenie scenariusza,
 * nie wynik zależny od suwaków; zmieniają się wyłącznie liczby godzin.
 */
export function RoiTimeVisual({ totalHours }: { totalHours: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const entered = useInView(ref, { once: true, amount: .5 })
  const split = entered || reduced !== false

  const recovered = Math.round(totalHours * 7) / 10
  const remaining = Math.round(totalHours * 3) / 10

  return (
    <div ref={ref} className="mb-5">
      <p className="mb-2 text-xs text-[#d6d3cd]">
        Obecnie <AnimatedValue value={totalHours} format={hours} label="Miesięczny czas pracy" className="font-semibold tabular-nums text-[#f5f2ed]" /> miesięcznie
      </p>
      <div aria-hidden="true" className="flex h-2 w-full overflow-hidden rounded-full bg-white/15">
        <motion.div
          className="h-full w-[70%] origin-left rounded-full bg-[#f34c30]"
          initial={false}
          animate={{ scaleX: split ? 1 : 0 }}
          transition={{ duration: reduced === false ? .9 : 0, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs">
        <span className="text-[#ffab98]">
          Odzyskane <AnimatedValue value={recovered} format={hours} label="Czas odzyskany miesięcznie" className="font-semibold tabular-nums" />
        </span>
        <span className="text-[#d6d3cd]">
          Po automatyzacji zostaje <AnimatedValue value={remaining} format={hours} label="Czas pozostający miesięcznie" className="font-semibold tabular-nums text-[#f5f2ed]" />
        </span>
      </div>
    </div>
  )
}
