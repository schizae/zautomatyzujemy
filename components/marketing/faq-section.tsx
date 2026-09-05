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
      <div className="max-w-[1500px] mx-auto grid gap-12 lg:grid-cols-2">

        <FadeInUp className="">
          <p className="text-xs font-bold text-[#c93820] tracking-widest uppercase mb-4 font-label">
            FAQ
          </p>
          <h2 className="text-6xl xl:text-8xl font-body font-extrabold tracking-[-0.05em] text-[#151719]">
            Warto<br /><span className="font-editorial font-normal italic text-[#f34c30]">wiedzieć.</span>
          </h2>
        </FadeInUp>

        <StaggerContainer className="space-y-4">
          {faqs.map((faq, idx) => (
            <StaggerItem key={faq.id}>
              <Accordion defaultValue={[]}>
                <AccordionItem
                  value={`item-${idx}`}
                  className="border-b border-[#c7c3bb] rounded-none"
                >
                  <AccordionTrigger className="px-0 py-6 font-body font-medium text-xl text-[#151719] hover:no-underline">
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
