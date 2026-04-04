import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MoveRight } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import type { CaseStudy } from '@/types'

export const metadata: Metadata = {
  title: 'Case Study — Realizacje Zautomatyzujemy.pl',
  description: 'Przykłady wdrożeń AI i automatyzacji dla firm MŚP. Sprawdź nasze realizacje.',
}

export default async function CaseStudiesPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('case_studies')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const items = (data ?? []) as CaseStudy[]

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
            Realizacje
          </p>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Case Study
          </h1>
          <p className="text-slate-400 mt-4 text-lg">
            Przykłady wdrożeń AI i automatyzacji, które przyniosły realne rezultaty.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {items.length === 0 ? (
          <p className="text-center text-slate-400 py-16">Brak dostępnych realizacji.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map(item => (
              <Link key={item.slug} href={`/case-studies/${item.slug}`}>
                <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="h-52 overflow-hidden relative bg-slate-100">
                    {item.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-primary/40 text-4xl font-black">AI</span>
                      </div>
                    )}
                    {item.tag && (
                      <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                        {item.tag}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-5">
                      {item.description}
                    </p>
                    <span className="text-primary font-bold text-sm inline-flex items-center gap-1">
                      Zobacz szczegóły <MoveRight size={14} />
                    </span>
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
