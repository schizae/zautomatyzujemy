import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { createServiceClient } from '@/lib/supabase/server'
import { safeMdxComponents } from '@/lib/mdx-components'
import { JsonLd } from '@/components/seo/json-ld'
import { BrandLogo } from '@/components/brand-logo'
import { ServiceCta } from '@/components/marketing/service-cta'
import type { Service } from '@/types'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://www.zautomatyzujemy.pl'

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

  const title = (data.seo_title as string | null) ?? (data.title as string)
  const description = (data.seo_description as string | null) ?? (data.description as string)

  return {
    title,
    description,
    alternates: { canonical: `/uslugi/${slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
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
    <main
      id="main"
      className="marketing-theme font-body min-h-screen bg-[#f5f2ed] text-[#151719] [color-scheme:light]"
    >
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
          areaServed: [
            { '@type': 'Country', name: 'Polska' },
            { '@type': 'AdministrativeArea', name: 'województwo pomorskie' },
          ],
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

      <div className="bg-[#151719] px-6 pb-16 pt-8 md:pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <BrandLogo inverse />
          </div>
          <Link
            href="/uslugi"
            className="mb-10 inline-flex items-center gap-2 rounded text-sm text-[#dedbd5] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
          >
            <ArrowLeft size={16} />
            Wszystkie usługi
          </Link>
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#ffb49f]">Usługa</p>
          <h1 className="font-editorial text-4xl font-normal leading-[1.08] tracking-tight text-[#f5f2ed] md:text-6xl">
            {service.title}
          </h1>
          {service.subtitle && (
            <p className="mt-8 text-base leading-relaxed text-[#dedbd5] md:text-lg">
              {service.subtitle}
            </p>
          )}
        </div>
      </div>

      {service.content && (
        <article className="mx-auto max-w-3xl px-6 py-16 leading-relaxed text-[#30322f] [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80 [&_blockquote]:mb-5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#62625d] [&_code]:rounded [&_code]:bg-[#eae5dc] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:font-editorial [&_h2]:text-3xl [&_h2]:font-normal [&_h2]:text-[#151719] [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#151719] [&_hr]:my-8 [&_hr]:border-[#d8d4cc] [&_li]:text-[#454640] [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6 [&_p]:mb-5 [&_p]:leading-relaxed [&_pre]:mb-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#151719] [&_pre]:p-4 [&_pre]:text-[#f5f2ed] [&_strong]:font-bold [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
          <MDXRemote source={service.content} components={safeMdxComponents} />
        </article>
      )}

      <ServiceCta serviceName={service.title} serviceSlug={service.slug} />
    </main>
  )
}
