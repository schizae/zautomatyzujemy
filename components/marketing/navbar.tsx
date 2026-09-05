'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Settings, CircleUser } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Rozwiązania', href: '/#uslugi' },
  { label: 'Demo Klary', href: '/#klara' },
  { label: 'Blog', href: '/blog' },
  { label: 'O nas', href: '/#o-nas' },
  { label: 'Kontakt', href: '/#kontakt' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isLoggedIn, isLoading, user } = useAuth()

  return (
    <nav className="bg-[#f5f2ed]/70 backdrop-blur-xl sticky top-0 z-50 w-full border-b border-white/5">
      <div className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-[1600px] mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="Zautomatyzujemy.pl logo"
            width={36}
            height={36}
            className="rounded-full brightness-110"
          />
          <span className="text-base sm:text-xl font-bold tracking-tighter text-[#151719] font-headline group-hover:brightness-110 transition-all">
            zautomatyzujemy.pl
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8 font-headline font-bold tracking-tight">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[#51534e] hover:text-[#c93820] transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right: icons + CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Zębatka — tylko gdy zalogowany */}
          {!isLoading && isLoggedIn && (
            <Link
              href="/account/settings"
              title="Ustawienia konta"
              className="flex items-center justify-center"
            >
              <Settings
                size={22}
                className="text-[#51534e] hover:text-[#c93820] transition-colors"
              />
            </Link>
          )}

          {/* CircleUser — glow gdy zalogowany */}
          <Link
            href={isLoggedIn ? '/account/settings' : '/account/login'}
            title={isLoggedIn ? `Zalogowany: ${user?.firstName} ${user?.lastName}` : 'Zaloguj się'}
            className="relative flex items-center justify-center"
          >
            <CircleUser
              size={22}
              className={cn(
                'transition-all duration-300',
                isLoggedIn
                  ? 'text-[#c93820] drop-shadow-[0_0_8px_rgba(112,229,234,0.85)]'
                  : 'text-[#51534e] hover:text-[#c93820]'
              )}
              aria-label={isLoggedIn ? 'Konto użytkownika' : 'Zaloguj się'}
            />
          </Link>

          {isLoggedIn ? (
            <Link
              href="/account/settings"
              className="ml-2 bg-gradient-to-br from-[#151719] to-[#151719] text-[#ffffff] px-6 py-2 rounded-md font-headline font-bold text-sm transition-all hover:brightness-110 active:scale-95 duration-200"
            >
              Moje konto
            </Link>
          ) : (
            <Link
              href="/#kontakt"
              className="ml-2 bg-gradient-to-br from-[#151719] to-[#151719] text-[#ffffff] px-6 py-2 rounded-md font-headline font-bold text-sm transition-all hover:brightness-110 active:scale-95 duration-200"
            >
              Porozmawiajmy
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <Button
          className="lg:hidden p-2 text-[#51534e] hover:text-[#c93820] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-white/5 bg-[#f5f2ed] px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-[#51534e] hover:text-[#c93820] py-2 text-sm font-headline font-bold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* User link */}
          <Link
            href={isLoggedIn ? '/account/settings' : '/account/login'}
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-2 py-2 text-sm font-headline font-bold transition-colors',
              isLoggedIn ? 'text-[#c93820]' : 'text-[#51534e] hover:text-[#c93820]'
            )}
          >
            <CircleUser size={18} />
            {isLoggedIn ? `${user?.firstName} ${user?.lastName}` : 'Zaloguj się'}
          </Link>

          {/* Ustawienia — mobile, tylko gdy zalogowany */}
          {isLoggedIn && (
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-headline font-bold text-[#51534e] hover:text-[#c93820] transition-colors"
            >
              <Settings size={18} />
              Ustawienia
            </Link>
          )}

          {isLoggedIn ? (
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-gradient-to-br from-[#151719] to-[#151719] text-[#ffffff] px-6 py-3 rounded-md font-headline font-bold text-sm mt-4 transition-all hover:brightness-110"
            >
              Moje konto
            </Link>
          ) : (
            <Link
              href="/#kontakt"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-gradient-to-br from-[#151719] to-[#151719] text-[#ffffff] px-6 py-3 rounded-md font-headline font-bold text-sm mt-4 transition-all hover:brightness-110"
            >
              Porozmawiajmy
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
