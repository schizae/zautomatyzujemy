import Link from 'next/link'
import Image from 'next/image'
import { FadeInUp } from '@/components/animations'
export function AboutSection() {
  return <section id="o-nas" className="mx-auto max-w-[1680px] scroll-mt-24 px-6 pb-8 pt-12 md:px-8">
    <FadeInUp>
      <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#62625d]">04 / Ludzie i wiedza</p>
      <h2 className="max-w-6xl font-body text-5xl font-extrabold leading-[1.05] tracking-[-0.055em] xl:text-[88px]">Technologia ma sens,<br />gdy pomaga <span className="font-editorial font-normal italic tracking-[-0.065em]">ludziom.</span></h2>
      <details className="mt-10 border-b border-[#c7c3bb] pb-8">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-6 py-4 text-xl"><span className="border-l-4 border-[#f34c30] pl-6">Bezpośrednia współpraca. Jasny zakres. Wsparcie po wdrożeniu.</span><span className="rounded-md border border-[#151719] px-6 py-4 text-base">Poznaj nas →</span></summary>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row"><Image src="/norbert.png" alt="Norbert Chojnacki" width={120} height={160} className="w-24 rounded-lg object-cover" /><div className="max-w-2xl"><h3 className="text-xl font-semibold">Norbert Chojnacki</h3><p className="my-4 leading-relaxed text-[#62625d]">Pomagam firmom wdrażać AI i porządkować codzienną pracę. Rozmawiasz bezpośrednio ze mną — od poznania potrzeb, przez projekt, po uruchomienie rozwiązania.</p><Link href="/#kontakt" className="text-[#c93820] underline">Poznajmy się</Link></div></div>
      </details>
    </FadeInUp>
  </section>
}
