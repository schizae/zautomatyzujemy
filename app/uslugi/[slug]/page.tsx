import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { createServiceClient } from '@/lib/supabase/server'
import { safeMdxComponents } from '@/lib/mdx-components'
import { JsonLd } from '@/components/seo/json-ld'
import type { Service } from '@/types'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('services')
    .select('title, description, seo_title, seo_description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'Usługa nie znaleziona' }

  return {
    title: data.seo_title ?? data.title,
    description: data.seo_description ?? data.description,
    alternates: { canonical: `/uslugi/${slug}` },
    openGraph: {
      type: 'website',
      title: data.seo_title ?? data.title,
      description: data.seo_description ?? data.description,
      url: `/uslugi/${slug}`,
    },
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) notFound()
  const service = data as Service

  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.description,
          serviceType: service.title,
          provider: {
            '@type': 'Organization',
            name: 'Zautomatyzujemy.pl',
            url: SITE_URL,
          },
          areaServed: { '@type': 'Country', name: 'Polska' },
          url: `${SITE_URL}/uslugi/${service.slug}`,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Strona główna', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Usługi', item: `${SITE_URL}/uslugi` },
            {
              '@type': 'ListItem',
              position: 3,
              name: service.title,
              item: `${SITE_URL}/uslugi/${service.slug}`,
            },
          ],
        }}
      />

      <div className="bg-slate-950 pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/uslugi"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Wszystkie usługi
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {service.title}
          </h1>
          {service.subtitle && (
            <p className="text-slate-300 text-lg leading-relaxed">{service.subtitle}</p>
          )}
        </div>
      </div>

      {service.content && (
        <article className="max-w-3xl mx-auto px-6 py-16 text-slate-800 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1.5 [&_li]:text-slate-700 [&_strong]:font-bold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80">
          <MDXRemote source={service.content} components={safeMdxComponents} />
        </article>
      )}

      <section className="bg-slate-50 border-t border-slate-200 px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Porozmawiajmy o Twoim procesie</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Zakres i wycenę ustalam indywidualnie, po obejrzeniu tego, jak pracujecie dzisiaj.
            Pierwsza rozmowa jest bezpłatna i do niczego nie zobowiązuje.
          </p>
          <Link
            href="/#kontakt"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold hover:brightness-110 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Umów bezpłatną konsultację
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  )
}
