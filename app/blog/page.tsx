import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { ArrowLeft } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import type { PostPreview } from '@/types'
import { BlogGrid } from './_components/BlogCarousel'

// Zawsze pobiera świeże dane — usunięcie posta w Supabase natychmiast
// odzwierciedla się na stronie bez konieczności ręcznej rewalidacji.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog — Baza Wiedzy',
  description: 'Artykuły o automatyzacji AI, n8n i transformacji cyfrowej dla MŚP.',
  alternates: {
    canonical: '/blog',
  },
}

export default async function BlogPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, cover_image, published_at, is_published, author, tags, created_at, updated_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const posts = (data ?? []) as PostPreview[]

  return (
    <main id="main" className="marketing-theme min-h-screen bg-[#f5f2ed] text-[#151719] [color-scheme:light]">
      {/* Header */}
      <div className="bg-[#151719] pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8"><BrandLogo inverse /></div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#dedbd5] hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Wróć na stronę główną
          </Link>
          <p className="text-xs font-bold text-[#ffb49f] tracking-widest uppercase mb-3">
            Baza Wiedzy
          </p>
          <h1 className="text-4xl md:text-6xl font-headline font-medium text-white tracking-tight">
            Pomysły na lepszą pracę.
          </h1>
          <p className="text-[#dedbd5] mt-4 text-lg">
            Artykuły o automatyzacji AI i transformacji cyfrowej dla MŚP.
          </p>
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <p className="text-center text-[#62625d] py-16">Brak opublikowanych artykułów.</p>
        ) : (
          <BlogGrid posts={posts} />
        )}
      </div>
    </main>
  )
}
