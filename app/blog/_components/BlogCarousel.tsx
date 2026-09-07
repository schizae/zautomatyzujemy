'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { PostPreview } from '@/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase()
}

export function BlogGrid({ posts }: { posts: PostPreview[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(posts.length / 9)
  const currentPage = Math.min(page, Math.max(0, totalPages - 1))
  const heading = useRef<HTMLHeadingElement>(null)
  function changePage(next: number) {
    setPage(next)
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }
  return (
    <section aria-label="Artykuły na blogu">
      <h2 ref={heading} tabIndex={-1} className="mb-8 scroll-mt-8 text-2xl font-semibold outline-none">Wiedza dla Twojej firmy</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(currentPage * 9, currentPage * 9 + 9).map(post => (
          <div key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820]">
              <article className="group bg-[#faf8f5] rounded-lg overflow-hidden shadow-sm border border-[#d9d6d0] hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="relative aspect-video overflow-hidden border-b-4 border-[#e84324] bg-[#e7e2da] shrink-0">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover grayscale contrast-[0.9] motion-safe:group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-[#c93820]/40 text-4xl font-black">AI</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                    <span className="text-white text-sm font-bold flex items-center gap-2">
                      Czytaj artykuł <ExternalLink size={14} />
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs font-bold text-[#c93820] bg-[#c93820]/10 px-2.5 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <time className="text-xs font-bold text-[#62625d] uppercase tracking-widest block mb-2">
                    {formatDate(post.published_at ?? post.created_at)}
                  </time>
                  <h2 className="text-lg font-bold text-[#151719] mb-3 group-hover:text-[#c93820] transition-colors leading-snug">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-[#62625d] text-sm leading-relaxed line-clamp-3 mt-auto">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <nav aria-label="Strony bloga" className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button className="h-11 bg-[#151719] text-white hover:bg-[#292c2e]" disabled={currentPage === 0} onClick={() => changePage(currentPage - 1)}>← Poprzednia</Button>
          <p role="status" className="text-sm text-[#62625d]">Strona {currentPage + 1} z {totalPages}</p>
          <Button className="h-11 bg-[#151719] text-white hover:bg-[#292c2e]" disabled={currentPage >= totalPages - 1} onClick={() => changePage(currentPage + 1)}>Następna →</Button>
        </nav>
      )}
    </section>
  )
}
