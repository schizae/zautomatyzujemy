import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { createServiceClient } from '@/lib/supabase/server'
import { safeMdxComponents } from '@/lib/mdx-components'
import { JsonLd } from '@/components/seo/json-ld'
import { getBlogCover } from '@/lib/editorial-covers'
import { TRAINED_ALGORITHMIC_MEDIA } from '@/lib/ai-disclosure'
import { AiDisclosure } from '../_components/AiDisclosure'
import type { Post } from '@/types'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://www.zautomatyzujemy.pl'

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('posts')
    .select('title, excerpt, cover_image, published_at, updated_at, author, ai_generated, ai_model, noindex')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!data) return { title: 'Artykuł nie znaleziony' }

  const description = data.excerpt ?? data.title

  // Budujemy obiekt zamiast rozwijać warunkowo — `exactOptionalPropertyTypes`
  // odrzuca właściwość, która raz jest, a raz jej nie ma.
  const aiMeta: Record<string, string> = {}
  if (data.ai_generated) {
    aiMeta['ai-generated'] = 'true'
    if (data.ai_model) aiMeta['ai-model'] = data.ai_model
  }

  return {
    title: data.title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      type: 'article',
      title: data.title,
      description,
      url: `/blog/${slug}`,
      images: [{ url: getBlogCover(slug, data.cover_image) }],
      publishedTime: data.published_at ?? undefined,
      modifiedTime: data.updated_at ?? undefined,
      authors: data.author ? [data.author] : ['Zautomatyzujemy.pl'],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description,
      images: [getBlogCover(slug, data.cover_image)],
    },
    other: aiMeta,
    // Archiwalne przeglądy zostają na stronie dla czytelników, ale wypadają z indeksu.
    // follow zostaje włączone celowo: strona nie rankuje, ale jej odnośniki nadal
    // przekazują sygnał do stron, na które prowadzi.
    ...(data.noindex === true && { robots: { index: false, follow: true } }),
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!data) notFound()

  const post = data as Post
  const coverImage = getBlogCover(post.slug, post.cover_image)

  return (
    <main id="main" className="marketing-theme min-h-screen bg-[#f5f2ed] font-body text-[#151719] [color-scheme:light]">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt ?? post.title,
          image: new URL(coverImage, SITE_URL).toString(),
          datePublished: post.published_at ?? post.created_at,
          dateModified: post.updated_at ?? post.published_at ?? post.created_at,
          author: {
            '@type': 'Person',
            name: post.author ?? 'Zautomatyzujemy.pl',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Zautomatyzujemy.pl',
            url: SITE_URL,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/blog/${post.slug}`,
          },
          ...(post.ai_generated && { digitalSourceType: TRAINED_ALGORITHMIC_MEDIA }),
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
              name: 'Blog',
              item: `${SITE_URL}/blog`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: post.title,
              item: `${SITE_URL}/blog/${post.slug}`,
            },
          ],
        }}
      />
      {/* Header */}
      <div className="bg-[#151719] pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#96968f] hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Wróć do bloga
          </Link>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs font-medium text-[#ffaf98]">
                  {tag.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-[#96968f] text-sm">
            {post.author && <span className="font-semibold text-[#d9d6d0]">{post.author}</span>}
            <time>{formatDate(post.published_at ?? post.created_at)}</time>
          </div>
        </div>
      </div>

      {/* Cover image */}
      {(
        <div className="relative max-w-3xl mx-auto px-6 -mt-8 aspect-video">
          <Image
            src={coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="rounded-lg object-cover"
          />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-16 text-[#151719] leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1.5 [&_li]:text-[#62625d] [&_strong]:font-bold [&_em]:italic [&_a]:text-[#c93820] [&_a]:underline [&_a]:hover:opacity-80 [&_blockquote]:border-l-4 [&_blockquote]:border-[#c93820] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#686862] [&_blockquote]:mb-5 [&_code]:bg-[#e7e2da] [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-[#151719] [&_pre]:text-[#f5f2ed] [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-5 [&_hr]:border-[#d9d6d0] [&_hr]:my-8">
        <MDXRemote source={post.content} components={safeMdxComponents} />
        <AiDisclosure aiGenerated={post.ai_generated} reviewedAt={post.reviewed_at} />
      </article>
    </main>
  )
}
