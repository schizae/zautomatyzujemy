'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Settings, CircleUser } from 'lucide-react'

const navLinks = [
  { label: 'Rozwiązania', href: '#uslugi' },
  { label: 'Case Studies', href: '#case-study' },
  { label: 'Blog', href: '#blog' },
  { label: 'O nas', href: '#o-nas' },
  { label: 'Kontakt', href: '#kontakt' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-[#121412]/70 backdrop-blur-xl sticky top-0 z-50 w-full border-b border-white/5">
      <div className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-screen-2xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="Zautomatyzujemy.pl logo"
            width={36}
            height={36}
            className="rounded-full brightness-110"
          />
          <span className="text-xl md:text-2xl font-bold tracking-tighter text-[#70e5ea] font-headline group-hover:brightness-110 transition-all">
            zautomatyzujemy.pl
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[#bcc9c9] hover:text-white transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right: icons + CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Settings
            size={22}
            className="text-[#bcc9c9] hover:text-white transition-colors cursor-pointer"
            aria-hidden="true"
          />
          <CircleUser
            size={22}
            className="text-[#bcc9c9] hover:text-white transition-colors cursor-pointer"
            aria-hidden="true"
          />
          <Link
            href="#kontakt"
            className="ml-2 bg-gradient-to-br from-[#70e5ea] to-[#50c9ce] text-[#003739] px-6 py-2 rounded-full font-headline font-bold text-sm transition-all hover:brightness-110 active:scale-95 duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[#bcc9c9] hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#1a1c1a] px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-[#bcc9c9] hover:text-white py-2 text-sm font-headline font-bold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#kontakt"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center bg-gradient-to-br from-[#70e5ea] to-[#50c9ce] text-[#003739] px-6 py-3 rounded-full font-headline font-bold text-sm mt-4 transition-all hover:brightness-110"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  )
}
