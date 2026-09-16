'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface ServiceMotionProps {
  children: ReactNode
  delay?: number
  className?: string
}

// A single short highlight explains the sequence without hiding the static illustration.
export function ServiceMotion({ children, delay = 0, className }: ServiceMotionProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced === false ? { opacity: [1, 0.55, 1], y: [0, -3, 0] } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: reduced === false ? 0.9 : 0, delay: reduced === false ? delay : 0, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export function ServiceFlow({ delay }: { delay: number }) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 24 32" className="ml-8 h-8 w-6 text-[#ffb49f]" fill="none" aria-hidden="true">
      <path d="M12 2v26m-5-5 5 5 5-5" stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.5} />
      <motion.path
        d="M12 2v26m-5-5 5 5 5-5"
        stroke="currentColor"
        strokeWidth={1.5}
        initial={false}
        whileInView={reduced === false ? { pathLength: [0, 1], opacity: [0.5, 1] } : { pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: reduced === false ? 0.7 : 0, delay: reduced === false ? delay : 0, ease: 'easeOut' }}
      />
    </svg>
  )
}
