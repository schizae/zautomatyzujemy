import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { createServiceClient } from '@/lib/supabase/server'
import { safeMdxComponents } from '@/lib/mdx-components'
import type { CaseStudy } from '@/types'

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

  if (!data) return { title: 'Realizacja nie znaleziona' }
  return {
    title: `${data.title} — Case Study Zautomatyzujemy.pl`,
    description: data.description,
    openGraph: data.cover_image ? { images: [data.cover_image] } : undefined,
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

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-950 pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Wróć do realizacji
          </Link>
          {item.tag && (
            <span className="inline-block text-xs font-bold text-primary bg-primary/20 px-2.5 py-0.5 rounded-full mb-4">
              {item.tag}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {item.title}
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Cover image */}
      {item.cover_image && (
        <div className="max-w-3xl mx-auto px-6 -mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.cover_image}
            alt={item.title}
            className="w-full rounded-2xl shadow-xl object-cover aspect-video"
          />
        </div>
      )}

      {/* Content */}
      {item.content ? (
        <article className="max-w-3xl mx-auto px-6 py-16 text-slate-800 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1.5 [&_li]:text-slate-700 [&_strong]:font-bold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:mb-5 [&_code]:bg-slate-100 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-5 [&_hr]:border-slate-200 [&_hr]:my-8">
          <MDXRemote source={item.content} components={safeMdxComponents} />
        </article>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-16">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <ArrowLeft size={16} />
            Wróć do wszystkich realizacji
          </Link>
        </div>
      )}
    </main>
  )
}
