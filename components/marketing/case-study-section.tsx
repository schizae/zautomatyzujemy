import { createServiceClient } from '@/lib/supabase/server'
import type { CaseStudy } from '@/types'

const fallbackCases = [
  {
    id: '1',
    title: 'Scalable Credit Risk Engine for Global Payments',
    tags: ['FINTECH', 'AUTOMATION'],
    stats: [
      { value: '12s', label: 'Processing Time' },
      { value: '-45%', label: 'OpEx Reduction' },
    ],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC__6df3fy7-2_TBNFO0TPOPXwuIg21Jt20O5C_eRdPC9w1ppLOZTSbR93vU_4UFB6ckPdltg5sdHdgfmTmSsU2ckggiBD7fSTpw68-I6lMqtErCiuglJTaZn_vpBVy_Att02Q-qhwpeLKix7dZ4K4XitnHVW6PSlsWDjc6wZ7fLogzWTbDIFjbZ6ullzkglQcUiwbBnBs567B4Cv9N90j8zkcdXWNLGA4w4jTRDK8FZ7cHZzGrS1qb9WaQFAWZfvqXC5ULWeeCx-3G',
  },
  {
    id: '2',
    title: 'HIPAA-Compliant Diagnostic Assistant Layer',
    tags: ['HEALTHCARE', 'LLM'],
    stats: [
      { value: '99.4%', label: 'Data Accuracy' },
      { value: '2.5k', label: 'Weekly Users' },
    ],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDxVKNZHipjGQg9VxgQxcCq6olmpXKDHYEzuIWxI6h9JFGiH6eKPXzbwlW0Rym_8ZM5WZhROSMyobfA1PGGQScCuOr32b2f6K96CSTCE39pS5bmCGgQDPj1iLaNKLCDUBGd9mFNa6Fvs0W9mZRRhf3PweRAowtYZ7pGZ_L5JPI92D4spSMihhsNtXfc-zWsAhoVHMvYrZwYIJtHU7_MpnGRhegWCrvO5MsbJelWGSur6cu2NdcxeVL768fkIz9Lqj6EBTaDYzSRbfFy',
  },
]

interface CaseItem {
  id: string
  title: string
  tags: string[]
  stats: { value: string; label: string }[]
  image: string
}

function buildCaseItems(data: CaseStudy[]): CaseItem[] {
  if (data.length === 0) return fallbackCases
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

  return (
    <section className="py-32 bg-[#0d0f0d]" id="case-study">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
        <div className="mb-16">
          <h2 className="text-4xl font-headline font-bold mb-4 text-[#e2e3df]">Case Study</h2>
          <p className="text-[#bcc9c9] text-lg font-body">
            Mierzalne efekty wprowadzonych automatyzacji
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {items.map((cs) => (
            <div key={cs.id} className="group cursor-pointer">
              {/* Image */}
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-8">
                {cs.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cs.image}
                    alt={cs.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1e201e] flex items-center justify-center">
                    <span className="text-[#70e5ea]/30 text-5xl font-headline font-black">AI</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f0d] via-transparent to-transparent" />

                {/* Tags */}
                {cs.tags.length > 0 && (
                  <div className="absolute bottom-6 left-6 flex gap-4">
                    {cs.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#70e5ea]/20 backdrop-blur-md px-4 py-2 rounded-xl text-[#70e5ea] font-label text-xs font-bold border border-[#70e5ea]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-headline font-bold mb-4 text-[#e2e3df]">
                {cs.title}
              </h3>

              {/* Stats */}
              {cs.stats.length > 0 && (
                <div className="flex gap-12">
                  {cs.stats.slice(0, 2).map((stat) => (
                    <div key={stat.label}>
                      <div className="text-3xl font-headline font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-xs font-label text-[#bcc9c9] uppercase">
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
