import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import type { PostPreview } from '@/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase()
}

interface DisplayPost {
  slug: string
  title: string
  category: string
  date: string
  cover_image: string
}

function toDisplayPosts(posts: PostPreview[]): DisplayPost[] {
  if (posts.length === 0) return []
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: (p.tags?.[0] ?? 'Blog'),
    date: formatDate(p.published_at ?? p.created_at),
    cover_image: p.cover_image ?? '',
  }))
}

export async function BlogPreview() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('posts')
    .select(
      'id, slug, title, excerpt, cover_image, published_at, is_published, author, tags, created_at, updated_at'
    )
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  const posts = toDisplayPosts((data ?? []) as PostPreview[])

  return (
    <section className="py-16 max-w-[1600px] mx-auto px-6 md:px-8" id="blog">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
        <h2 className="text-3xl font-headline font-bold text-[#151719]">Z naszego bloga.</h2>
        <Link
          href="/blog"
          className="text-[#c93820] font-headline font-bold flex items-center gap-2 group mt-4 md:mt-0"
        >
          Wszystkie artykuły <ArrowUpRight
            size={20}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </Link>
      </div>

      {posts.length === 0 && <p className="mb-8 text-[#686862]">Artykuły o praktycznym wykorzystaniu AI znajdziesz na naszym blogu.</p>}
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.slug} className="group">
            <Link href={post.slug.startsWith('#') ? '#blog' : `/blog/${post.slug}`}>
              <div className="mb-6">
                {/* Image */}
                {post.cover_image ? (
                  <div className="relative w-full aspect-[1.8/1] mb-6">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover rounded-2xl"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[1.8/1] rounded-2xl mb-6 bg-[#e7e2da] flex items-center justify-center">
                    <span className="text-[#c93820]/30 text-4xl font-headline font-black">AI</span>
                  </div>
                )}

                {/* Category + date */}
                <div className="font-label text-xs text-[#c93820] tracking-widest uppercase mb-3">
                  {post.category} — {post.date}
                </div>

                {/* Title */}
                <h4 className="text-2xl font-body font-semibold leading-tight text-[#151719] group-hover:text-[#c93820] transition-colors">
                  {post.title}
                </h4>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
