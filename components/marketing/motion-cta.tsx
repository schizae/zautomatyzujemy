'use client'

import Link from 'next/link'
import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePointerMotion } from './use-pointer-motion'

interface MotionCtaProps {
  children: React.ReactNode
  className: string
  /** Link — renderuje `Button asChild` z `next/link`. */
  href?: string
  onClick?: () => void
}

/**
 * Główne CTA marketingowe z reakcją na wskaźnik.
 *
 * Rusza się wyłącznie zawartość przycisku, maksymalnie o 3 px. Strefa klikalna
 * i układ zostają nieruchome, więc trafienie w przycisk jest tak samo łatwe jak
 * przed zmianą. `components/ui/button.tsx` pozostaje nietknięty — efekt dotyczy
 * tylko strony marketingowej.
 */
export function MotionCta({ children, className, href, onClick }: MotionCtaProps) {
  const reduced = useReducedMotion()
  const pointer = usePointerMotion<HTMLSpanElement>(reduced === false)
  const x = useTransform(pointer.x, [-1, 1], [-3, 3])
  const y = useTransform(pointer.y, [-1, 1], [-3, 3])

  const press = cn(className, 'duration-150 motion-safe:active:scale-[.98]')
  const content = <motion.span className="inline-flex items-center justify-center" style={{ x, y }}>{children}</motion.span>

  return (
    <span ref={pointer.ref} className="inline-flex max-w-full">
      {href
        ? <Button asChild className={press}><Link href={href}>{content}</Link></Button>
        : <Button onClick={onClick} className={press}>{content}</Button>}
    </span>
  )
}
