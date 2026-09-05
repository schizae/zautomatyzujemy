import Link from 'next/link'
import Image from 'next/image'
import { FadeInUp } from '@/components/animations'
export function AboutSection() {
  return <section id="o-nas" className="mx-auto max-w-7xl scroll-mt-24 px-6 pb-8 pt-20 md:px-8">
    <FadeInUp>
      <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#686862]">05 / Ludzie stoją za technologią</p>
      <div className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-headline text-4xl font-medium tracking-tight md:text-5xl">Technologia ma sens,<br />gdy <span className="font-serif italic">pomaga ludziom.</span>
          </h2>
          <p className="mt-6 max-w-xl leading-relaxed text-[#686862]">Nazywam się Norbert Chojnacki. Pomagam firmom wdrażać AI i porządkować codzienną pracę. Rozmawiasz bezpośrednio ze mną — od poznania potrzeb, przez projekt, po uruchomienie rozwiązania.</p>
          <p className="mt-6 text-sm font-medium">Rozmowa → Plan → Wdrożenie → Wsparcie</p>
        </div>
        <div className="flex items-center gap-6 rounded-2xl border border-[#d9d6d0] p-6">
          <Image src="/norbert.png" alt="Norbert Chojnacki" width={120} height={160} className="w-24 rounded-xl object-cover" />
          <div>
            <h3 className="text-xl font-headline">Norbert Chojnacki</h3>
            <p className="mt-2 text-sm text-[#686862]">Założyciel Zautomatyzujemy.pl</p>
            <Link href="/#kontakt" className="mt-4 inline-block text-sm text-[#c93820] underline underline-offset-4">Poznajmy się ↗</Link>
          </div>
        </div>
      </div>
    </FadeInUp>
  </section>
}
