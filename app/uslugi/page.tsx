import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MoveRight } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { BrandLogo } from '@/components/brand-logo'
import { JsonLd } from '@/components/seo/json-ld'
import { ServiceSymbol } from '@/components/marketing/service-artwork'
import type { Service } from '@/types'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://www.zautomatyzujemy.pl'

// Read current service slugs instead of retaining build-time Supabase responses.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Automatyzacja procesów i wdrożenia AI dla firm',
  description:
    'Automatyzacja procesów biznesowych, agenci i asystenci AI, obieg dokumentów, szkolenia i zgodność z AI Act. Wdrażam samodzielnie, rozmawiasz bezpośrednio ze mną.',
  alternates: { canonical: '/uslugi' },
  openGraph: {
    type: 'website',
    title: 'Automatyzacja procesów i wdrożenia AI dla firm',
    description:
      'Automatyzacja procesów biznesowych, agenci i asystenci AI, obieg dokumentów, szkolenia i zgodność z AI Act.',
    url: '/uslugi',
  },
}

export default async function ServicesPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const services = (data ?? []) as Service[]

  return (
    <main
      id="main"
      className="marketing-theme font-body min-h-screen bg-[#f5f2ed] text-[#151719] [color-scheme:light]"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Usługi Zautomatyzujemy.pl',
          itemListElement: services.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: service.title,
            url: `${SITE_URL}/uslugi/${service.slug}`,
          })),
        }}
      />

      <div className="bg-[#151719] px-6 pb-16 pt-8 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <BrandLogo inverse />
          </div>
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 rounded text-sm text-[#dedbd5] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
          >
            <ArrowLeft size={16} />
            Wróć na stronę główną
          </Link>
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#ffb49f]">
            Zakres współpracy
          </p>
          <h1 className="font-editorial text-6xl font-normal leading-none tracking-tight text-[#f5f2ed] md:text-8xl">
            Usługi
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#dedbd5] md:text-lg">
            Każde wdrożenie zaczyna się od konkretnego procesu, który kosztuje czas albo pieniądze.
            Poniżej obszary, w których pomagam, i to, jak wygląda praca w każdym z nich.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {services.length === 0 ? (
          <p className="py-16 text-center text-[#62625d]">Brak dostępnych usług.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map(service => (
              <Link
                key={service.slug}
                href={`/uslugi/${service.slug}`}
                className="group relative rounded-xl transition-transform duration-300 ease-out focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f2ed] motion-safe:focus-visible:-translate-y-1 motion-safe:active:scale-[0.99] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:z-10 [@media(hover:hover)_and_(pointer:fine)]:motion-safe:hover:-translate-y-1 [@media(hover:hover)_and_(pointer:fine)]:motion-safe:hover:scale-[1.02]"
              >
                <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[#d8d4cc] bg-[#faf8f4] p-7 transition-[background-color,border-color,box-shadow] duration-300 group-hover:border-[#c93820]/50 group-hover:bg-[#fffaf5] group-hover:shadow-xl group-hover:shadow-[#583729]/10 group-focus-visible:border-[#c93820]/50 group-focus-visible:bg-[#fffaf5] motion-reduce:transition-none sm:p-8">
                  <div className="mb-8 flex items-center justify-between" aria-hidden="true">
                    <span className="flex size-12 items-center justify-center rounded-lg border border-[#d8d4cc] bg-[#f0ebe3] text-[#c93820] transition-colors duration-300 group-hover:border-[#c93820] group-hover:bg-[#c93820] group-hover:text-white group-focus-visible:bg-[#c93820] group-focus-visible:text-white motion-reduce:transition-none"><ServiceSymbol slug={service.slug} /></span>
                    <MoveRight size={20} className="text-[#8b877f] transition-[color,transform] duration-300 group-hover:text-[#c93820] motion-safe:group-hover:-rotate-45 motion-safe:group-focus-visible:-rotate-45 motion-reduce:transition-none" />
                  </div>
                  <h2 className="mb-3 text-xl font-semibold tracking-tight">{service.title}</h2>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-[#62625d]">
                    {service.subtitle ?? service.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#c93820]">
                    Zobacz szczegóły
                    <MoveRight
                      size={14}
                      className="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                    />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
