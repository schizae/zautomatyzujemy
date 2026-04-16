'use client'

import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[error boundary]', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0d0f0d] px-6 text-center">
      <div className="mx-auto max-w-md">
        <p className="text-6xl font-headline font-black text-[#70e5ea]">Ups!</p>
        <h1 className="mt-4 text-2xl font-headline font-bold text-[#e2e3df]">
          Coś poszło nie tak
        </h1>
        <p className="mt-3 text-[#bcc9c9] leading-relaxed">
          Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę lub wrócić na stronę główną.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-[#70e5ea] px-6 py-3 text-sm font-semibold text-[#003739] transition-all hover:brightness-110 hover:-translate-y-0.5"
          >
            Spróbuj ponownie
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#3d4949]/50 px-6 py-3 text-sm font-semibold text-[#bcc9c9] transition-all hover:border-[#70e5ea]/50 hover:text-[#70e5ea]"
          >
            Strona główna
          </Link>
        </div>
      </div>
    </main>
  )
}
