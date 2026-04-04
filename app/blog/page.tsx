import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import type { PostPreview } from '@/types'

export const metadata: Metadata = {
  title: 'Blog — Baza Wiedzy',
  description: 'Artykuły o automatyzacji AI, n8n i transformacji cyfrowej dla MŚP.',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
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

      {/* Posts grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <p className="text-center text-slate-400 py-16">Brak opublikowanych artykułów.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-primary/40 text-4xl font-black">AI</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                      <span className="text-white text-sm font-bold flex items-center gap-2">
                        Czytaj artykuł <ExternalLink size={14} />
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {post.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <time className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      {formatDate(post.published_at ?? post.created_at)}
                    </time>
                    <h2 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
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
