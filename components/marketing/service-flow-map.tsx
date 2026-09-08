'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface FlowNode {
  /** Stabilny identyfikator — nie indeks, żeby zmiana usługi nie myliła animacji. */
  id: string
  label: string
  note: string
}

interface ServiceFlowMapProps {
  nodes: FlowNode[]
  /** Wybrany węzeł; `null` znaczy „bez wyboru", czyli pełny przebieg. */
  activeId: string | null
  onActivate: (id: string) => void
}

/**
 * Mapa przykładowego przebiegu usługi.
 *
 * Węzły są zwykłymi przyciskami — działają myszą, dotykiem i klawiaturą.
 * Wskazanie i fokus wyłącznie objaśniają węzeł; dopiero kliknięcie go wybiera,
 * żeby ruch myszy nad diagramem nie przerywał trwającej sekwencji.
 * SVG niesie tylko dekoracyjne połączenia.
 */
export function ServiceFlowMap({ nodes, activeId, onActivate }: ServiceFlowMapProps) {
  const [describedId, setDescribedId] = useState<string | null>(null)
  const reduced = useReducedMotion()
  const shown = nodes.find(node => node.id === (describedId ?? activeId)) ?? null

  return (
    <div>
      <ol className="flex flex-col gap-1 lg:flex-row lg:items-stretch">
        {nodes.map((node, index) => {
          const active = node.id === activeId
          const lit = active || node.id === describedId
          return (
            <li key={node.id} className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-center">
              <Button
                onClick={() => onActivate(node.id)}
                onPointerEnter={() => setDescribedId(node.id)}
                onPointerLeave={() => setDescribedId(null)}
                onFocus={() => setDescribedId(node.id)}
                onBlur={() => setDescribedId(null)}
                aria-pressed={active}
                className={`h-auto w-full min-w-0 flex-col items-start gap-1 whitespace-normal rounded-lg border px-3 py-3 text-left text-sm duration-200 ${lit ? 'border-[#c93820] bg-white' : 'border-[#d0ccc5] bg-[#fffdfa] hover:bg-white'}`}
              >
                <span className="flex w-full items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#62625d]">
                  0{index + 1}
                  {active && <Check aria-label="wybrany etap" className="ml-auto size-3.5 text-[#c93820]" />}
                </span>
                <span className={`w-full break-words leading-snug ${lit ? 'text-[#151719]' : 'text-[#3f4144]'}`}>{node.label}</span>
              </Button>
              {index < nodes.length - 1 && <svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto size-4 shrink-0 rotate-90 lg:mx-1 lg:rotate-0">
                <path d="M2 12H20M15 7L20 12L15 17" fill="none" stroke={lit ? '#c93820' : '#d0ccc5'} strokeWidth="2" className="duration-200" />
              </svg>}
            </li>
          )
        })}
      </ol>

      {/* Miejsce zarezerwowane na stałe — objaśnienie nie przesuwa przycisku niżej.
          Klucz remontuje akapit i odtwarza samo wejście; AnimatePresence potrafi tu
          zatrzymać poprzednie dziecko, gdy wyjście ma zerowy czas trwania. */}
      <div className="mt-4 min-h-14 rounded-lg border border-[#d9d6d0] bg-white/60 p-3 text-sm text-[#62625d]">
        <motion.p
          key={shown?.id ?? 'brak'}
          initial={{ opacity: reduced === false ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced === false ? .2 : 0 }}
        >
          {shown ? shown.note : 'Wskaż lub wybierz etap, aby zobaczyć, co się w nim dzieje.'}
        </motion.p>
      </div>
    </div>
  )
}
