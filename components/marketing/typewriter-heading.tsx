'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const phrases = ['Twoja firma.', 'Więcej', 'możliwości.']
const letterCount = phrases.join('').length

export function TypewriterHeading({ active }: { active: boolean }) {
  const reduced = useReducedMotion()
  const [written, setWritten] = useState<number | null>(null)
  const startedAt = useRef<number | null>(null)

  useEffect(() => {
    if (!active || reduced !== false) return
    startedAt.current ??= performance.now()
    let frame = 0
    const type = (now: number) => {
      const count = Math.min(letterCount, Math.max(0, Math.floor((now - startedAt.current! - 250) / 85)))
      setWritten(count)
      if (count < letterCount) frame = requestAnimationFrame(type)
    }
    frame = requestAnimationFrame(type)
    return () => cancelAnimationFrame(frame)
  }, [active, reduced])

  const count = active && !reduced ? written : null
  let offset = 0
  return (
    <h1 aria-label="Twoja firma. Więcej możliwości." data-written={count ?? letterCount} className="font-body text-5xl font-extrabold leading-[1.04] tracking-[-0.06em] sm:text-6xl lg:text-[clamp(3rem,6.2vw,6.5rem)]">
      {phrases.map((phrase, phraseIndex) => {
        const start = offset
        offset += phrase.length
        const typed = count === null ? phrase.length : Math.max(0, Math.min(phrase.length, count - start))
        const cursor = count !== null && count <= offset && (count > start || start === 0)
        return <span key={phrase} aria-hidden="true">
          {phraseIndex === 1 && <br />}{phraseIndex === 2 && ' '}
          <span className={`relative inline-block whitespace-nowrap ${phraseIndex === 2 ? 'font-editorial font-normal italic tracking-[-0.065em]' : ''}`}>
            <span className="invisible">{phrase}</span>
            <span className="absolute inset-0">{phrase.slice(0, typed)}{cursor && <motion.span className="pointer-events-none inline-block h-[.78em] w-[.055em] bg-[#c93820] align-baseline" animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1, times: [0, .48, .5, 1], repeat: Infinity }} />}</span>
            {phraseIndex === 2 && <span className={`absolute inset-x-0 -bottom-1 h-0.5 origin-left bg-[#f34c30] motion-reduce:transition-none ${count === null || count === letterCount ? 'scale-x-100 transition-transform duration-1000' : 'scale-x-0 opacity-0'}`} />}
          </span>
        </span>
      })}
    </h1>
  )
}
