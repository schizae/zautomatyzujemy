'use client'

import { useEffect, useRef, useState } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'

/** Sprężyna bez widocznego odbicia — punkt startowy z planu ruchu. */
const SPRING = { stiffness: 120, damping: 24, mass: 0.8 }

/** Zamienia współrzędną wskaźnika na zakres −1…1 względem krawędzi elementu. */
export function normalizePointer(position: number, start: number, size: number): number {
  if (size <= 0) return 0
  return Math.max(-1, Math.min(1, ((position - start) / size - 0.5) * 2))
}

interface PointerMotion<T extends HTMLElement> {
  /** Podepnij do NIERUCHOMEGO kontenera, nie do transformowanej warstwy w środku. */
  ref: React.RefObject<T | null>
  x: MotionValue<number>
  y: MotionValue<number>
}

/**
 * Położenie wskaźnika wewnątrz elementu jako dwie sprężynowane Motion Values.
 *
 * Wartości nie przechodzą przez `setState`, więc ruch myszy nie renderuje
 * ponownie sekcji. Poza precyzyjnym wskaźnikiem z obsługą hover — czyli na
 * dotyku — hook zwraca zera i nie zakłada nasłuchu.
 */
export function usePointerMotion<T extends HTMLElement>(enabled: boolean): PointerMotion<T> {
  const ref = useRef<T>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, SPRING)
  const y = useSpring(rawY, SPRING)
  const [finePointer, setFinePointer] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(pointer: fine) and (hover: hover)')
    const update = () => setFinePointer(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled || !finePointer) {
      rawX.set(0)
      rawY.set(0)
      return
    }

    // Prostokąt czytamy przy wejściu, przewijaniu i zmianie rozmiaru — nie przy
    // każdym ruchu, żeby nie wymuszać przeliczenia układu w każdej klatce.
    let bounds = element.getBoundingClientRect()
    const measure = () => { bounds = element.getBoundingClientRect() }

    const move = (event: PointerEvent) => {
      rawX.set(normalizePointer(event.clientX, bounds.left, bounds.width))
      rawY.set(normalizePointer(event.clientY, bounds.top, bounds.height))
    }
    const reset = () => { rawX.set(0); rawY.set(0) }

    element.addEventListener('pointerenter', measure)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerleave', reset)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      element.removeEventListener('pointerenter', measure)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerleave', reset)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      reset()
    }
  }, [enabled, finePointer, rawX, rawY])

  return { ref, x, y }
}
