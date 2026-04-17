'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoveRight } from 'lucide-react'
import type { CaseStudy } from '@/types'

interface CaseStudyCarouselProps {
  items: CaseStudy[]
}

export function CaseStudyCarousel({ items }: CaseStudyCarouselProps) {
  const [index, setIndex] = useState(0)
  const perPage = 3
  const canGoLeft = index > 0
  const canGoRight = index + perPage < items.length
  const visible = items.slice(index, index + perPage)

  if (items.length === 0) return null

  return (
    <div className="relative overflow-hidden md:overflow-visible">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {visible.map((item, i) => {
          const isFirst = i === 0
          const isLast = i === visible.length - 1

          return (
            <div key={item.id} className="relative group/card">
              {/* Left arrow — hovering first card */}
              {isFirst && canGoLeft && (
                <motion.button
                  onClick={() => setIndex(v => v - 1)}
                  className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-colors opacity-0 group-hover/card:opacity-100"
                  initial={false}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Poprzedni"
                >
                  <ChevronLeft size={20} />
                </motion.button>
              )}

              {/* Right arrow — hovering last card */}
              {isLast && canGoRight && (
                <motion.button
                  onClick={() => setIndex(v => v + 1)}
                  className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-colors opacity-0 group-hover/card:opacity-100"
                  initial={false}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Następny"
                >
                  <ChevronRight size={20} />
                </motion.button>
              )}

              {/* Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <Link href={`/case-studies/${item.slug}`}>
                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 group hover:shadow-2xl hover:border-transparent transition-all duration-300 h-full cursor-pointer">
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        {item.cover_image ? (
                          <Image
                            src={item.cover_image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-primary/40 text-3xl font-black">AI</span>
                          </div>
                        )}
                        {item.tag && (
                          <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                            {item.tag}
                          </div>
                        )}
                      </div>
                      <div className="p-8">
                        <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                        <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                          {item.description}
                        </p>
                        <span className="text-primary font-bold text-sm inline-flex items-center gap-1 group/link">
                          Zobacz szczegóły{' '}
                          <MoveRight
                            size={14}
                            className="group-hover/link:translate-x-1 transition-transform"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Dots indicator */}
      {items.length > perPage && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(items.length / perPage) }).map((_, pageIdx) => (
            <button
              key={pageIdx}
              onClick={() => setIndex(pageIdx * perPage)}
              className={`h-2 rounded-full transition-all duration-200 ${
                Math.floor(index / perPage) === pageIdx
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Strona ${pageIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
