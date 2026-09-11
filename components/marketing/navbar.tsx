'use client'

import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X, Settings, CircleUser } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Usługi', href: '/uslugi' },
  { label: 'Demo Klary', href: '/#klara' },
  { label: 'Blog', href: '/blog' },
  { label: 'O nas', href: '/#o-nas' },
  { label: 'Kontakt', href: '/#kontakt' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const reduced = useReducedMotion()
  const { isLoggedIn, isLoading, user } = useAuth()

  return (
    <nav className="marketing-theme bg-[#f5f2ed]/95 backdrop-blur-xl sticky top-0 z-50 w-full border-b border-[#c7c3bb]">
      <div className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-[1680px] mx-auto">

        {/* Logo */}
        <BrandLogo />

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8 font-body font-medium tracking-tight">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-[#51534e] hover:text-[#c93820] transition-colors text-sm after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#c93820] after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none"
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
                  ? 'text-[#c93820] '
                  : 'text-[#51534e] hover:text-[#c93820]'
              )}
              aria-label={isLoggedIn ? 'Konto użytkownika' : 'Zaloguj się'}
            />
          </Link>

          {isLoggedIn ? (
            <Link
              href="/account/settings"
              className="ml-2 bg-gradient-to-br from-[#151719] to-[#151719] text-[#ffffff] px-6 py-3.5 rounded-md font-headline font-bold text-sm transition-all hover:brightness-110 active:scale-95 duration-200"
            >
              Moje konto
            </Link>
          ) : (
            <Link
              href="/#kontakt"
              className="ml-2 bg-gradient-to-br from-[#151719] to-[#151719] text-[#ffffff] px-6 py-3.5 rounded-md font-headline font-bold text-sm transition-all hover:brightness-110 active:scale-95 duration-200"
            >
              Porozmawiajmy
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <Button
          className="lg:hidden bg-transparent p-2 text-[#51534e] hover:text-[#c93820] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div id="mobile-menu" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .18, ease: 'easeOut' }} inert={!isOpen} className="lg:hidden border-t border-[#c7c3bb] bg-[#f5f2ed] px-6 py-4 space-y-3">
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
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  )
}
