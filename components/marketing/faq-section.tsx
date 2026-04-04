import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { createServiceClient } from '@/lib/supabase/server'
import type { FaqItem } from '@/types'

export async function FaqSection() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('faq_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const faqs = (data ?? []) as FaqItem[]

  if (faqs.length === 0) return null

  return (
    <section className="py-24 bg-white border-t border-slate-100" id="faq">
      <div className="max-w-4xl mx-auto px-6">

        <FadeInUp className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">
            FAQ
          </h2>
          <h3 className="text-4xl font-bold">Często zadawane pytania</h3>
        </FadeInUp>

        <StaggerContainer className="space-y-4">
          {faqs.map((faq, idx) => (
            <StaggerItem key={faq.id}>
              <Accordion defaultValue={idx === 0 ? ['item-0'] : []}>
                <AccordionItem
                  value={`item-${idx}`}
                  className="border border-slate-100 rounded-2xl px-2 overflow-hidden hover:border-primary/20 transition-colors"
                >
                  <AccordionTrigger className="px-4 py-5 font-bold text-lg hover:no-underline hover:bg-slate-50 rounded-2xl transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  )
}
