import { createServiceClient } from '@/lib/supabase/server'
import type { CaseStudy } from '@/types'

interface CaseItem {
  id: string
  title: string
  tags: string[]
  stats: { value: string; label: string }[]
  image: string
  description?: string
}

function buildCaseItems(data: CaseStudy[]): CaseItem[] {
  // Brak danych = sekcja się nie renderuje. Lepiej pokazać mniej niż wymyśloną treść.
  return data.map((cs) => ({
    id: cs.id,
    title: cs.title,
    tags: cs.tag ? [cs.tag] : [],
    stats: [],
    image: cs.cover_image ?? '',
  }))
}

export async function CaseStudySection() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('case_studies')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const items = buildCaseItems((data ?? []) as CaseStudy[])

  if (items.length === 0) return null

  return (
    <section className="py-32 bg-[#0d0f0d]" id="case-study">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
        <div className="mb-16">
          <span className="text-xs font-label uppercase tracking-widest text-[#70e5ea] mb-4 block">Przykładowe scenariusze wdrożeń</span>
          <h2 className="text-4xl font-headline font-bold mb-4 text-[#e2e3df]">Co konkretnie możemy dla Ciebie zrobić</h2>
          <p className="text-[#bcc9c9] text-lg font-body max-w-2xl">
            Poniższe scenariusze pokazują typowe wdrożenia. Prawdziwe wyniki zależą od specyfiki procesu — na bezpłatnej konsultacji szacujemy ROI dla Twojej firmy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((cs) => (
            <div key={cs.id} className="group bg-[#1a1c1a] rounded-[2rem] p-8 flex flex-col hover:bg-[#1e201e] transition-colors duration-300 border border-[#3d4949]/10">
              {/* Tags */}
              {cs.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {cs.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#70e5ea]/10 px-3 py-1 rounded-lg text-[#70e5ea] font-label text-xs font-bold border border-[#70e5ea]/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-headline font-bold mb-4 text-[#e2e3df] leading-snug">
                {cs.title}
              </h3>

              {/* Description */}
              {cs.description && (
                <p className="text-[#bcc9c9] font-body text-sm leading-relaxed mb-8 flex-1">
                  {cs.description}
                </p>
              )}

              {/* Stats */}
              {cs.stats.length > 0 && (
                <div className="flex gap-8 pt-6 border-t border-[#3d4949]/20">
                  {cs.stats.slice(0, 2).map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-headline font-bold text-[#70e5ea]">
                        {stat.value}
                      </div>
                      <div className="text-xs font-label text-[#bcc9c9] uppercase leading-tight mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
