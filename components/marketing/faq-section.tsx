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
    <section className="py-16 px-6 md:px-8 border-t border-[#c7c3bb]" id="faq">
      <div className="max-w-[1616px] mx-auto grid gap-12 lg:grid-cols-2">

        <FadeInUp className="">
          <p className="text-xs font-bold text-[#c93820] tracking-widest uppercase mb-4 font-label">
            05 / FAQ
          </p>
          <h2 className="text-6xl xl:text-[88px] font-body font-extrabold tracking-[-0.05em] text-[#151719]">
            Warto<br /><span className="font-editorial font-normal italic tracking-[-0.065em] text-[#f34c30]">wiedzieć.</span>
          </h2>
        </FadeInUp>

        <StaggerContainer className="space-y-0">
          {faqs.slice(0, 3).map((faq, idx) => (<StaggerItem key={faq.id}>
              <Accordion defaultValue={[]}>
                <AccordionItem value={`item-${idx}`} className="border-b border-[#b4b0a9] rounded-none">
                  <AccordionTrigger className="px-0 py-5 font-body font-medium text-lg text-[#151719] hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="px-0 pb-5 text-[#62625d] leading-relaxed font-body">{faq.answer}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </StaggerItem>))}
          {faqs.length > 3 && <details className="mt-6">
            <summary className="cursor-pointer py-3 text-sm font-medium text-[#62625d] underline underline-offset-4">Zobacz wszystkie odpowiedzi →</summary>
            {faqs.slice(3).map((faq, idx) => (<StaggerItem key={faq.id}>
              <Accordion defaultValue={[]}>
                <AccordionItem value={`item-${idx}`} className="border-b border-[#b4b0a9] rounded-none">
                  <AccordionTrigger className="px-0 py-5 font-body font-medium text-lg text-[#151719] hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="px-0 pb-5 text-[#62625d] leading-relaxed font-body">{faq.answer}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </StaggerItem>))}
          </details>}
        </StaggerContainer>

      </div>
    </section>
  )
}
