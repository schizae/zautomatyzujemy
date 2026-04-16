'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch {
      // localStorage może być niedostępne (np. private mode w Safari)
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Zgoda na pliki cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div className="mx-auto max-w-screen-lg rounded-2xl border border-[#3d4949]/40 bg-[#161816]/95 backdrop-blur-sm px-6 py-4 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm font-body text-[#bcc9c9] leading-relaxed">
          Strona używa plików cookies wyłącznie w celach technicznych (sesja, bezpieczeństwo).
          Brak cookies śledzących ani reklamowych. Więcej informacji:{' '}
          <Link href="/privacy-policy" className="text-[#70e5ea] hover:underline">
            Polityka Prywatności
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-full bg-[#70e5ea] px-6 py-2.5 text-sm font-headline font-bold text-[#003739] hover:brightness-110 transition-all"
        >
          Rozumiem
        </button>
      </div>
    </div>
  )
}
