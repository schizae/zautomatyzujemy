'use client'

import Image from 'next/image'
import { SlideIn, FloatingElement } from '@/components/animations'
import { CheckCircle2 } from 'lucide-react'

const competences = [
  { label: 'Automatyzacje n8n', desc: 'Workflow\'y łączące dziesiątki systemów' },
  { label: 'LLM i chatboty RAG', desc: 'Asystenci AI znający Twój biznes' },
  { label: 'Zgodność z AI Act', desc: 'Audyty, dokumentacja, szkolenia' },
  { label: 'Wdrożenia dla MŚP', desc: 'Od analizy po gotowe rozwiązanie' },
]

export function AboutSection() {
  return (
    <section className="py-32 bg-[#0d0f0d] px-6 md:px-8" id="o-nas">
      <div className="max-w-screen-2xl mx-auto">

        {/* Label */}
        <div className="mb-16">
          <span className="text-xs font-label uppercase tracking-widest text-[#70e5ea]">
            O mnie
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* LEFT — Photo */}
          <SlideIn direction="left" className="lg:col-span-5">
            <div className="relative">

              {/* Photo frame */}
              <div className="relative rounded-[2.5rem] overflow-hidden border border-[#70e5ea]/15 shadow-[0_0_80px_rgba(112,229,234,0.08)]">
                {/* Cyan corner accent top-left */}
                <div className="absolute top-0 left-0 w-16 h-16 z-10 pointer-events-none">
                  <div className="absolute top-4 left-4 w-6 h-px bg-[#70e5ea]/60" />
                  <div className="absolute top-4 left-4 w-px h-6 bg-[#70e5ea]/60" />
                </div>
                {/* Cyan corner accent bottom-right */}
                <div className="absolute bottom-0 right-0 w-16 h-16 z-10 pointer-events-none">
                  <div className="absolute bottom-4 right-4 w-6 h-px bg-[#70e5ea]/60" />
                  <div className="absolute bottom-4 right-4 w-px h-6 bg-[#70e5ea]/60" />
                </div>

                <Image
                  src="/norbert.jpg"
                  alt="Norbert Chojnacki — założyciel Zautomatyzujemy.pl"
                  width={600}
                  height={800}
                  className="w-full object-cover object-top"
                  priority
                />

                {/* Subtle bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f0d]/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating credential card */}
              <FloatingElement
                className="absolute -bottom-8 -right-4 md:-right-8 hidden md:block"
                amplitude={6}
                duration={4}
              >
                <div className="bg-[#1a1c1a] border border-[#3d4949]/30 backdrop-blur-sm p-5 rounded-2xl shadow-xl max-w-[200px]">
                  <p className="text-[#70e5ea] font-headline font-bold text-2xl mb-0.5">Inż.</p>
                  <p className="text-[#e2e3df] font-headline font-bold text-sm leading-tight">
                    Informatyki
                  </p>
                  <p className="text-[#bcc9c9] text-xs font-body mt-2 leading-snug">
                    n8n · LLM · RAG · AI Act
                  </p>
                </div>
              </FloatingElement>
            </div>
          </SlideIn>

          {/* RIGHT — Text */}
          <SlideIn direction="right" delay={0.15} className="lg:col-span-7">

            {/* Name & role */}
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-[#e2e3df] mb-2">
                Norbert Chojnacki
              </h2>
              <p className="text-[#70e5ea] font-label text-sm uppercase tracking-widest">
                Założyciel · Inżynier Informatyki · Ekspert AI i Automatyzacji
              </p>
            </div>

            {/* Paragraphs */}
            <div className="space-y-5 text-[#bcc9c9] font-body text-base leading-relaxed mb-10">
              <p>
                Zautomatyzujemy.pl to jednoosobowa firma — i to jest świadomy wybór, nie wada.
                Kiedy zlecasz projekt mnie, rozmawiasz bezpośrednio z osobą, która go zaprojektuje,
                zbuduje i wdroży. Bez przepychania przez account managerów, bez głuchego telefonu
                między Tobą a programistą.
              </p>
              <p>
                Ukończyłem informatykę i od lat buduję systemy automatyzacji i AI dla firm —
                od małych biur rachunkowych, przez sklepy internetowe, po agencje marketingowe.
                Pracuję z n8n, modelami językowymi (GPT, Gemini, Claude), systemami RAG i
                narzędziami integracji. Zamiast sprzedawać gotowe szablony, analizuję konkretny
                proces w Twojej firmie i buduję rozwiązanie pod ten jeden cel.
              </p>
              <p>
                Śledzę AI Act od pierwszych projektów regulacji — i pomagam firmom przygotować
                się na sierpień 2026 zanim temat stanie się pilny. Jeśli używasz AI w firmie
                (nawet tylko ChatGPT do maili), masz obowiązki prawne. Lepiej wiedzieć
                o nich zawczasu.
              </p>
              <p>
                Jeśli szukasz taniej agencji, która zrealizuje projekt na procent i zniknie —
                nie jestem dobrym wyborem. Jeśli szukasz kogoś, kto naprawdę rozumie Twój
                problem i zostaje na dłużej, żeby upewnić się, że wdrożenie działa —
                porozmawiajmy.
              </p>
            </div>

            {/* Competences grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {competences.map((c) => (
                <div
                  key={c.label}
                  className="flex items-start gap-3 bg-[#1a1c1a] rounded-2xl p-4 border border-[#3d4949]/10"
                >
                  <CheckCircle2 className="text-[#70e5ea] shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-[#e2e3df] font-headline font-bold text-sm">{c.label}</p>
                    <p className="text-[#bcc9c9] text-xs font-body mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </SlideIn>
        </div>
      </div>
    </section>
  )
}
