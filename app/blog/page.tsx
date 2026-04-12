import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import type { PostPreview } from '@/types'
import { BlogCarousel } from './_components/BlogCarousel'

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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-950 pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Wróć na stronę główną
          </Link>
          <p className="text-xs font-bold text-primary tracking-widest uppercase mb-3">
            Baza Wiedzy
          </p>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Blog
          </h1>
          <p className="text-slate-400 mt-4 text-lg">
            Artykuły o automatyzacji AI i transformacji cyfrowej dla MŚP.
          </p>
        </div>
      </div>

      {/* Posts carousel */}
      <div className="max-w-7xl mx-auto px-10 py-16">
        {posts.length === 0 ? (
          <p className="text-center text-slate-400 py-16">Brak opublikowanych artykułów.</p>
        ) : (
          <BlogCarousel posts={posts} />
        )}
      </div>
    </main>
  )
}
