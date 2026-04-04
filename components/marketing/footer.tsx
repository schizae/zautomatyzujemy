import Link from 'next/link'

const footerLinks = [
  { label: 'Polityka Prywatności', href: '/privacy-policy' },
  { label: 'LinkedIn', href: '#' },
  { label: 'GitHub', href: '#' },
]

export function Footer() {
  return (
    <footer className="bg-[#121412] w-full border-t border-white/5 font-label text-sm uppercase tracking-widest">
      <div className="w-full px-8 md:px-12 py-16 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo */}
        <div className="text-lg font-headline font-black text-white">
          zautomatyzujemy.pl
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[#bcc9c9]">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-[#70e5ea] transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-[#bcc9c9] text-center md:text-right">
          © {new Date().getFullYear()} zautomatyzujemy.pl — The Synthetic Architect
        </div>
      </div>
    </footer>
  )
}
