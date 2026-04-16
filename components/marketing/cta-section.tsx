import Link from 'next/link'
import { FadeInUp } from '@/components/animations'
import { createServiceClient } from '@/lib/supabase/server'

export async function CtaSection() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('page_content')
    .select('key, value')
    .in('key', ['cta_title', 'cta_description'])

  const content: Record<string, string> = Object.fromEntries(
    (data ?? []).map((item: { key: string; value: string }) => [item.key, item.value])
  )
  const title = content['cta_title'] ?? 'Gotowy na automatyzację?'
  const description = content['cta_description'] ?? 'Skontaktuj się z nami i umów bezpłatną konsultację.'

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <FadeInUp>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            {description}
          </p>
          <Link
            href="/#kontakt"
            className="inline-flex items-center justify-center rounded-full bg-primary text-white px-10 py-4 text-base font-bold shadow-xl shadow-primary/40 hover:bg-primary/90 hover:scale-105 transition-all duration-200"
          >
            Umów bezpłatną konsultację
          </Link>
        </FadeInUp>
      </div>
    </section>
  )
}
