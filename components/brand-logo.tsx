import Link from 'next/link'

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820]">
      <svg aria-hidden="true" viewBox="0 0 24 36" className="h-8 w-6 shrink-0 text-[#e84324]" fill="currentColor"><path d="M8 0h16v23h-7V7H8zM0 13h7v16h9v7H0z" /></svg>
      <span className={`font-headline text-base font-bold tracking-tight sm:text-xl ${inverse ? 'text-white' : 'text-[#151719]'}`}>zautomatyzujemy.pl</span>
    </Link>
  )
}
