import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MoveRight } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { BrandLogo } from '@/components/brand-logo'
import { getCaseCover } from '@/lib/editorial-covers'
import type { CaseStudy } from '@/types'

export const metadata: Metadata = {
  title: 'Case Study — Scenariusze automatyzacji',
  description: 'Przykładowe scenariusze wdrożeń AI i automatyzacji dla firm MŚP. Zobacz, co da się zautomatyzować w Twojej firmie.',
  alternates: {
    canonical: '/case-studies',
  },
}

export default async function CaseStudiesPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('case_studies')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const items = (data ?? []) as CaseStudy[]

  return (
    <main id="main" className="marketing-theme font-body min-h-screen bg-[#f5f2ed] text-[#151719] [color-scheme:light]">
      {/* Header */}
      <div className="bg-[#151719] px-6 pb-16 pt-8 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10"><BrandLogo inverse /></div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#dedbd5] hover:text-white transition-colors text-sm mb-10 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
          >
            <ArrowLeft size={16} />
            Wróć na stronę główną
          </Link>
          <p className="text-xs font-bold text-[#ffb49f] tracking-widest uppercase mb-5">
            Przykładowe scenariusze
          </p>
          <h1 className="font-editorial text-6xl font-normal text-[#f5f2ed] leading-none tracking-tight md:text-8xl">
            Case Study
          </h1>
          <p className="max-w-2xl text-[#dedbd5] mt-8 text-base leading-relaxed md:text-lg">
            Scenariusze pokazujące, co da się zautomatyzować. To przykłady poglądowe,
            a nie opisy zrealizowanych projektów — efekty zależą od specyfiki Twoich procesów.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {items.length === 0 ? (
          <p className="text-center text-[#62625d] py-16">Brak dostępnych scenariuszy.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map(item => (
              <Link key={item.slug} href={`/case-studies/${item.slug}`} className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820] focus-visible:ring-offset-4">
                <article className="bg-[#faf8f4] rounded-lg overflow-hidden border border-[#d8d4cc] hover:border-[#c93820] transition-colors duration-300 h-full">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#e6e1d8]">
                    <Image
                      src={getCaseCover(item.slug, item.cover_image)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.tag && (
                      <div className="absolute top-4 left-4 bg-[#151719] text-[#f5f2ed] text-xs font-semibold px-3 py-1.5 rounded">
                        {item.tag}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {item.is_example && (
                      <span className="inline-flex items-center rounded border border-[#c93820]/25 bg-[#c93820]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#a52e19] mb-4">
                        Przykład możliwej automatyzacji
                      </span>
                    )}
                    <h2 className="font-editorial text-3xl font-normal leading-tight tracking-tight text-[#151719] mb-4 group-hover:text-[#a52e19] transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-[#62625d] text-sm leading-relaxed line-clamp-3 mb-5">
                      {item.description}
                    </p>
                    <span className="text-[#a52e19] font-semibold text-sm inline-flex items-center gap-1">
                      Zobacz szczegóły <MoveRight size={14} />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
