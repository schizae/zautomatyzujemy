import Link from 'next/link'

const navLinks = [
  { label: 'Rozwiązania', href: '/#uslugi' },
  { label: 'Case Studies', href: '/#case-study' },
  { label: 'Blog', href: '/blog' },
  { label: 'O nas', href: '/#o-nas' },
  { label: 'Kontakt', href: '/#kontakt' },
]

const legalLinks = [
  { label: 'Polityka prywatności', href: '/privacy-policy' },
  { label: 'Regulamin', href: '/regulamin' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0d0f0d] border-t border-white/5">
      {/* Main grid */}
      <div className="mx-auto max-w-screen-2xl px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Brand */}
        <div className="space-y-4">
          <span className="text-xl font-headline font-black text-[#e2e3df] tracking-tight">
            zautomatyzujemy<span className="text-[#70e5ea]">.pl</span>
          </span>
          <p className="text-sm font-body text-[#bcc9c9] leading-relaxed max-w-xs">
            Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty
            i skalują Twój biznes.
          </p>
          <a
            href="mailto:kontakt@zautomatyzujemy.pl"
            className="inline-block text-sm font-body text-[#70e5ea] hover:underline"
          >
            kontakt@zautomatyzujemy.pl
          </a>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <p className="text-xs font-label uppercase tracking-widest text-[#5a6464]">
            Nawigacja
          </p>
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-body text-[#bcc9c9] hover:text-[#70e5ea] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-4">
          <p className="text-xs font-label uppercase tracking-widest text-[#5a6464]">
            Dokumenty
          </p>
          <ul className="space-y-3">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-body text-[#bcc9c9] hover:text-[#70e5ea] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-body text-[#5a6464]">
            © {year} Zautomatyzujemy.pl — wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}
