import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { createServiceClient } from '@/lib/supabase/server'
import { safeMdxComponents } from '@/lib/mdx-components'
import { JsonLd } from '@/components/seo/json-ld'
import { BrandLogo } from '@/components/brand-logo'
import { getCaseCover } from '@/lib/editorial-covers'
import type { CaseStudy } from '@/types'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://www.zautomatyzujemy.pl'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('case_studies')
    .select('title, description, cover_image')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'Scenariusz nie znaleziony' }

  const description = data.description ?? data.title
  const coverImage = getCaseCover(slug, data.cover_image)

  return {
    title: data.title,
    description,
    alternates: {
      canonical: `/case-studies/${slug}`,
    },
    openGraph: {
      type: 'article',
      title: data.title,
      description,
      url: `/case-studies/${slug}`,
      images: [{ url: coverImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description,
      images: [coverImage],
    },
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) notFound()
  const item = data as CaseStudy
  const coverImage = getCaseCover(item.slug, item.cover_image)

  return (
    <main id="main" className="marketing-theme font-body min-h-screen bg-[#f5f2ed] text-[#151719] [color-scheme:light]">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: item.title,
          description: item.description ?? item.title,
          image: new URL(coverImage, SITE_URL).toString(),
          author: {
            '@type': 'Organization',
            name: 'Zautomatyzujemy.pl',
            url: SITE_URL,
          },
          publisher: {
            '@type': 'Organization',
            name: 'Zautomatyzujemy.pl',
            url: SITE_URL,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/case-studies/${item.slug}`,
          },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Strona główna',
              item: SITE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Case Study',
              item: `${SITE_URL}/case-studies`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: item.title,
              item: `${SITE_URL}/case-studies/${item.slug}`,
            },
          ],
        }}
      />
      {/* Header */}
      <div className="bg-[#151719] px-6 pb-16 pt-8 md:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10"><BrandLogo inverse /></div>
          <Link
            href="/case-studies"
            className="flex w-fit items-center gap-2 text-[#dedbd5] hover:text-white transition-colors text-sm mb-10 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
          >
            <ArrowLeft size={16} />
            Wróć do scenariuszy
          </Link>
          {item.tag && (
            <span className="inline-block text-xs font-semibold text-[#ffb49f] bg-[#ffb49f]/10 px-3 py-1 rounded mb-4 mr-2">
              {item.tag}
            </span>
          )}
          {item.is_example && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#ffb49f] border border-[#ffb49f]/30 px-3 py-1 rounded mb-4">
              Przykład możliwej automatyzacji
            </span>
          )}
          <h1 className="font-editorial text-4xl font-normal text-[#f5f2ed] tracking-tight leading-[1.08] mb-6 md:text-6xl lg:text-7xl">
            {item.title}
          </h1>
          <p className="max-w-3xl text-[#dedbd5] text-base md:text-lg leading-relaxed">
            {item.description}
          </p>
          {item.is_example && (
            <p className="max-w-3xl mt-8 rounded-lg border border-[#ffb49f]/25 bg-[#ffb49f]/5 px-5 py-4 text-sm leading-relaxed text-[#dedbd5]">
              To scenariusz poglądowy, a nie opis zrealizowanego projektu. Pokazuje, jak taka
              automatyzacja działa w praktyce. Rzeczywisty zakres i efekty ustalamy dla Twojej
              firmy podczas bezpłatnej konsultacji.
            </p>
          )}
        </div>
      </div>

      {/* Cover image */}
      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="relative aspect-[16/10] md:aspect-video overflow-hidden rounded-lg border border-[#d8d4cc] bg-[#e6e1d8]">
          <Image
            src={coverImage}
            alt={item.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      {item.content ? (
        <article className="max-w-3xl mx-auto px-6 py-16 text-[#30322f] leading-relaxed [&_h2]:font-editorial [&_h2]:text-3xl [&_h2]:font-normal [&_h2]:text-[#151719] [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#151719] [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1.5 [&_li]:text-[#454640] [&_strong]:font-bold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#62625d] [&_blockquote]:mb-5 [&_code]:bg-[#eae5dc] [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-[#151719] [&_pre]:text-[#f5f2ed] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-5 [&_hr]:border-[#d8d4cc] [&_hr]:my-8">
          <MDXRemote source={item.content} components={safeMdxComponents} />
        </article>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-16">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <ArrowLeft size={16} />
            Wróć do wszystkich scenariuszy
          </Link>
        </div>
      )}
    </main>
  )
}
