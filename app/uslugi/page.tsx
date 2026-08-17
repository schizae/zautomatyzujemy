import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MoveRight } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { JsonLd } from '@/components/seo/json-ld'
import type { Service } from '@/types'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'

export const metadata: Metadata = {
  title: 'Usługi — automatyzacja i AI dla firm',
  description:
    'Automatyzacja procesów, chatboty AI, odczyt faktur, audyt, szkolenia, oprogramowanie na zamówienie i zgodność z AI Act. Bezpłatna konsultacja.',
  alternates: { canonical: '/uslugi' },
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
    <main className="min-h-screen bg-slate-50">
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

      <div className="bg-slate-950 pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Wróć na stronę główną
          </Link>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">Usługi</h1>
          <p className="text-slate-400 mt-4 text-lg max-w-2xl">
            Każde wdrożenie zaczyna się od konkretnego problemu, który kosztuje czas albo
            pieniądze. Poniżej obszary, w których pomagam.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {services.length === 0 ? (
          <p className="text-center text-slate-400 py-16">Brak dostępnych usług.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <Link key={service.slug} href={`/uslugi/${service.slug}`}>
                <article className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                    {service.subtitle ?? service.description}
                  </p>
                  <span className="text-primary font-bold text-sm inline-flex items-center gap-1">
                    Zobacz szczegóły <MoveRight size={14} />
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
