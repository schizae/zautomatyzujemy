'use client'

import { useEffect, useRef, useState } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

interface AnimatedValueProps {
  value: number
  /** Funkcja modułowa, nie strzałka w JSX — inaczej subskrypcja wstaje co render. */
  format: (value: number) => string
  className?: string
  /** Nazwa wartości dla czytnika ekranu, np. „Koszt pracy miesięcznie". */
  label: string
}

/**
 * Liczba dojeżdżająca do nowego celu od bieżącej wartości, bez zerowania
 * i bez przeskoku overshootu.
 *
 * Źródłem prawdy zostaje wartość z Reacta — animacja jest wyłącznie prezentacją.
 * Statyczny HTML zawiera gotowy wynik, więc bez JavaScriptu liczba jest na miejscu.
 */
export function AnimatedValue({ value, format, className, label }: AnimatedValueProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const target = useMotionValue(value)
  const shown = useSpring(target, { duration: 550, bounce: 0 })
  const [settled, setSettled] = useState(value)

  useEffect(() => { target.set(value) }, [value, target])

  useEffect(() => shown.on('change', current => {
    if (ref.current) ref.current.textContent = format(current)
  }), [shown, format])

  // Czytnik ekranu dostaje jeden spokojny komunikat po zakończeniu przeciągania,
  // zamiast kilkudziesięciu na sekundę w jego trakcie.
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), 400)
    return () => clearTimeout(timer)
  }, [value])

  return <>
    <span ref={ref} aria-hidden="true" className={className}>{format(value)}</span>
    <span className="sr-only">{label}: {format(settled)}</span>
  </>
}
