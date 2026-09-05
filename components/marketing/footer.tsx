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
    <footer className="bg-[#151719] border-t border-white/5">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Brand */}
        <div className="space-y-4">
          <span className="text-xl font-headline font-black text-[#e2e3df] tracking-tight">
            zautomatyzujemy<span className="text-[#ffab98]">.pl</span>
          </span>
          <p className="text-sm font-body text-[#bcc9c9] leading-relaxed max-w-xs">
            Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty
            i skalują Twój biznes.
          </p>
          <div className="space-y-1.5">
            <a
              href="mailto:n.chojnacki1993@gmail.com"
              className="block text-sm font-body text-[#ffab98] hover:underline"
            >
              n.chojnacki1993@gmail.com
            </a>
            <a
              href="tel:+48730094465"
              className="block text-sm font-body text-[#bcc9c9] hover:text-[#ffab98] transition-colors"
            >
              +48 730 094 465
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <p className="text-xs font-label uppercase tracking-widest text-[#a6a6a0]">
            Nawigacja
          </p>
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-body text-[#bcc9c9] hover:text-[#ffab98] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-4">
          <p className="text-xs font-label uppercase tracking-widest text-[#a6a6a0]">
            Dokumenty
          </p>
          <ul className="space-y-3">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-body text-[#bcc9c9] hover:text-[#ffab98] transition-colors"
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
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-body text-[#a6a6a0]">
            © {year} Zautomatyzujemy.pl — wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}
