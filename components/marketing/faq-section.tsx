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
    <section className="py-24 px-6 border-t border-[#c7c3bb]/30" id="faq">
      <div className="max-w-4xl mx-auto">

        <FadeInUp className="text-center mb-16">
          <p className="text-xs font-bold text-[#c93820] tracking-widest uppercase mb-4 font-label">
            FAQ
          </p>
          <h2 className="text-4xl font-headline font-bold tracking-tight text-[#151719]">
            Często zadawane pytania
          </h2>
        </FadeInUp>

        <StaggerContainer className="space-y-4">
          {faqs.map((faq, idx) => (
            <StaggerItem key={faq.id}>
              <Accordion defaultValue={idx === 0 ? ['item-0'] : []}>
                <AccordionItem
                  value={`item-${idx}`}
                  className="border border-[#c7c3bb]/40 bg-[#ebe7df] rounded-2xl px-2 overflow-hidden hover:border-[#c93820]/30 transition-colors"
                >
                  <AccordionTrigger className="px-4 py-5 font-headline font-bold text-lg text-[#151719] hover:no-underline hover:bg-[#e7e2da] rounded-2xl transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 text-[#686862] leading-relaxed font-body">
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
