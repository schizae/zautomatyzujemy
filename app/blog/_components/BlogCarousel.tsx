'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { PostPreview } from '@/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase()
}

export function BlogCarousel({ posts }: { posts: PostPreview[] }) {
  return (
    <Carousel opts={{ align: 'start', loop: posts.length > 3 }} className="w-full">
      <CarouselContent className="-ml-4">
        {posts.map(post => (
          <CarouselItem key={post.slug} className="pl-4 md:basis-1/2 lg:basis-1/3">
            <Link href={`/blog/${post.slug}`} className="block h-full">
              <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="relative aspect-video overflow-hidden bg-slate-100 shrink-0">
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

                <div className="p-6 flex flex-col flex-1">
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
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
                  <h2 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mt-auto">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0 -translate-x-1/2 shadow-md" />
      <CarouselNext className="right-0 translate-x-1/2 shadow-md" />
    </Carousel>
  )
}
