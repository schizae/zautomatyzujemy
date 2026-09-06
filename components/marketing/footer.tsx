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
    <footer className="border-t border-white/20 bg-[#101214] text-[#dedbd5]">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-6 px-6 py-8 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[#f5f2ed]">zautomatyzujemy.pl</Link>
        <nav aria-label="Nawigacja w stopce" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {[...navLinks, ...legalLinks].map(link => <Link key={link.href} href={link.href} className="hover:text-[#ffb49f] hover:underline underline-offset-4">{link.label}</Link>)}
        </nav>
        <p className="text-xs text-[#b9b7b2]">© {year} Zautomatyzujemy.pl</p>
      </div>
    </footer>
  )
}
