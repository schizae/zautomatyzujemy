'use client'

import { motion, useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Start only after hydration: SSR and a failed script still leave readable content.
function useEntrance<T extends HTMLElement>(delay: number, duration: number, line = false) {
  const ref = useRef<T>(null)
  const entered = useRef(false)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  useEffect(() => {
    const element = ref.current
    if (!element || !isInView || entered.current) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches) return
    const animation = element.animate(
      line
        ? [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }]
        : [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: duration * 1000, delay: Math.min(delay, .35) * 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' }
    )
    animation.onfinish = () => { entered.current = true }
    const stop = () => { if (preference.matches) { entered.current = true; animation.cancel() } }
    preference.addEventListener('change', stop)
    return () => { animation.cancel(); preference.removeEventListener('change', stop) }
  }, [isInView, delay, duration, line])
  return ref
}

export function RevealText({ children, className, delay = 0 }: FadeInUpProps) {
  const ref = useEntrance<HTMLSpanElement>(delay, .7)
  return <span ref={ref} className={cn('inline-block', className)}>{children}</span>
}

export function DrawLine() {
  const ref = useEntrance<HTMLSpanElement>(.35, .7, true)
  return <span ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-1 h-0.5 origin-left bg-[#f34c30]" />
}

// ─── Fade In Up — universal scroll-reveal wrapper ────────────────────────────

interface FadeInUpProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeInUp({
  children,
  className,
  delay = 0,
  duration = 0.6,
}: FadeInUpProps) {
  const ref = useEntrance<HTMLDivElement>(delay, duration)

  return (
    <div
      ref={ref}
      className={className}
    >
      {children}
    </div>
  )
}

// ─── Stagger Container — animuje dzieci po kolei ──────────────────────────────

interface StaggerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

const staggerContainer = {
  hidden: {},
  show: (staggerDelay: number) => ({
    transition: { staggerChildren: staggerDelay },
  }),
}

const staggerItem = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.12,
}: StaggerProps) {
  const ref = useRef(null)

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer}
      custom={staggerDelay}
      initial={false}
      animate='show'
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  )
}

// ─── Slide In — z lewej lub prawej ───────────────────────────────────────────

interface SlideInProps {
  children: React.ReactNode
  className?: string
  direction?: 'left' | 'right'
  delay?: number
}

export function SlideIn({
  children,
  className,
  direction = 'left',
  delay = 0,
}: SlideInProps) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const x = direction === 'left' ? -60 : 60

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={isInView || reduced ? { opacity: 1, x: 0 } : { opacity: 1, x: x / 4 }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

interface CounterProps {
  to: number
  suffix?: string
  className?: string
  duration?: number
}

export function AnimatedCounter({
  to,
  suffix = '',
  className,
  duration = 2,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })

  useEffect(() => {
    if (isInView) motionValue.set(to)
  }, [isInView, motionValue, to])

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = Math.round(v) + suffix
      }
    })
  }, [spring, suffix])

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────

export function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={cn('cursor-pointer', className)}
      whileHover={{ scale: 1.02, rotateX: -3, rotateY: 4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      {children}
    </motion.div>
  )
}

// ─── Floating Element — dekoracyjne unoszenie ─────────────────────────────────

export function FloatingElement({
  children,
  className,
  amplitude = 12,
  duration = 4,
}: {
  children: React.ReactNode
  className?: string
  amplitude?: number
  duration?: number
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-amplitude / 2, amplitude / 2, -amplitude / 2] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

// ─── Pulse Glow — pulsujący efekt dla CTA ────────────────────────────────────

export function PulseGlow({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        'absolute inset-0 rounded-full bg-primary/30 blur-2xl',
        className
      )}
      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ─── Animated Gradient Text ───────────────────────────────────────────────────

export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.span
      className={cn(
        'bg-gradient-to-r from-blue-400 via-blue-300 to-sky-400 bg-clip-text text-transparent',
        className
      )}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      style={{ backgroundSize: '200% 200%' }}
    >
      {children}
    </motion.span>
  )
}
