'use client'

import { useState } from 'react'
import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePointerMotion } from './use-pointer-motion'

interface InteractiveSurfaceProps {
  children: React.ReactNode
  /** Klasy karty — muszą zawierać zaokrąglenie, bo refleks jest do niego przycięty. */
  className?: string
  /** Jasny refleks na ciemnej powierzchni, ciemny na jasnej. */
  tone?: 'onDark' | 'onLight'
}

/**
 * Dyskretny refleks przy krawędzi karty, podążający za wskaźnikiem.
 *
 * Warstwa jest przycięta do karty, `pointer-events-none` i `aria-hidden`, więc
 * nie przechwytuje kliknięć ani nie trafia do czytnika ekranu. Karta nie staje
 * się przyciskiem — kontrolki w środku działają jak wcześniej.
 */
export function InteractiveSurface({ children, className, tone = 'onLight' }: InteractiveSurfaceProps) {
  const reduced = useReducedMotion()
  const pointer = usePointerMotion<HTMLDivElement>(reduced === false)
  const x = useTransform(pointer.x, [-1, 1], ['-38%', '38%'])
  // Widoczność przełącza stan wskazania, nie sprężyna — ta wraca do zera
  // asymptotycznie i refleks nigdy by nie zgasł.
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={pointer.ref}
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true) }}
      onPointerLeave={() => setHovered(false)}
      className={cn('relative isolate overflow-hidden', className)}
    >
      <motion.span
        aria-hidden="true"
        style={{ x }}
        initial={false}
        animate={{ opacity: hovered && reduced === false ? 1 : 0 }}
        transition={{ duration: .4 }}
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 -z-10 w-2/3 bg-gradient-to-r from-transparent to-transparent',
          tone === 'onDark' ? 'via-white/10' : 'via-black/[0.045]'
        )}
      />
      {children}
    </div>
  )
}
