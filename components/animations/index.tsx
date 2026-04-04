'use client'

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

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
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
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
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer}
      custom={staggerDelay}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
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
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const x = direction === 'left' ? -60 : 60

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
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
